import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = resolve(packageRoot, "../..");
const tokenPath = resolve(packageRoot, "tokens/nocturne.tokens.json");
const webPath = resolve(packageRoot, "generated/web/nocturne.css");
const packageDartPath = resolve(
  packageRoot,
  "generated/dart/argent_tokens.dart",
);
const mobileDartPath = resolve(
  repoRoot,
  "apps/mobile/lib/theme/argent_tokens.dart",
);

const rawTokens = JSON.parse(await readFile(tokenPath, "utf8"));

function flattenTokens(node, path = [], output = []) {
  for (const [key, value] of Object.entries(node)) {
    if (key.startsWith("$")) {
      continue;
    }

    if (!value || typeof value !== "object") {
      continue;
    }

    if ("$value" in value) {
      output.push({
        path: [...path, key],
        type: value.$type,
        value: value.$value,
      });
      continue;
    }

    flattenTokens(value, [...path, key], output);
  }

  return output;
}

const flattened = flattenTokens(rawTokens);
const tokenByPath = new Map(
  flattened.map((token) => [token.path.join("."), token]),
);

function resolveTokenValue(value, seen = new Set()) {
  if (typeof value !== "string") {
    return value;
  }

  const alias = value.match(/^\{(.+)\}$/u);
  if (!alias) {
    return value;
  }

  const aliasPath = alias[1];
  if (seen.has(aliasPath)) {
    throw new Error(
      `Circular token reference: ${[...seen, aliasPath].join(" -> ")}`,
    );
  }

  const referenced = tokenByPath.get(aliasPath);
  if (!referenced) {
    throw new Error(`Unknown token reference: ${aliasPath}`);
  }

  seen.add(aliasPath);
  return resolveTokenValue(referenced.value, seen);
}

function cssVariableName(path) {
  return `--argent-${path.join("-").replaceAll(/[A-Z]/gu, (match) => `-${match.toLowerCase()}`)}`;
}

function cssDeclaration(token) {
  const name = cssVariableName(token.path);

  if (token.type !== "fontFamily") {
    return `  ${name}: ${token.resolvedValue};`;
  }

  const families = token.resolvedValue.split(", ");
  const lines = [];
  let currentLine = "";

  for (const family of families) {
    const candidate = currentLine ? `${currentLine}, ${family}` : family;
    if (candidate.length > 72 && currentLine) {
      lines.push(`${currentLine},`);
      currentLine = family;
      continue;
    }

    currentLine = candidate;
  }

  if (currentLine) {
    lines.push(`${currentLine};`);
  }

  return `  ${name}:\n${lines.map((line) => `    ${line}`).join("\n")}`;
}

function dartConstantName(path) {
  return path
    .map((part, index) => {
      const normalized = part.replaceAll(/[^a-zA-Z0-9]/gu, "");
      if (index === 0) {
        return normalized;
      }

      return `${normalized.slice(0, 1).toUpperCase()}${normalized.slice(1)}`;
    })
    .join("");
}

function dartColor(hex) {
  return `Color(0xFF${hex.replace("#", "").toUpperCase()})`;
}

function dartValue(token, value) {
  if (token.type === "color") {
    return dartColor(value);
  }

  if (
    token.type === "dimension" &&
    typeof value === "string" &&
    value.endsWith("px")
  ) {
    return Number(value.slice(0, -2)).toString();
  }

  if (
    token.type === "duration" &&
    typeof value === "string" &&
    value.endsWith("ms")
  ) {
    return `Duration(milliseconds: ${Number(value.slice(0, -2))})`;
  }

  if (token.type === "fontFamily") {
    return JSON.stringify(value);
  }

  return String(value);
}

const resolvedTokens = flattened.map((token) => ({
  ...token,
  resolvedValue: resolveTokenValue(token.value),
}));

const css = `/* Generated from packages/design-system/tokens/nocturne.tokens.json. Do not edit by hand. */
:root {
${resolvedTokens.map((token) => cssDeclaration(token)).join("\n")}
}
`;

const dart = `// Generated from packages/design-system/tokens/nocturne.tokens.json.
// Do not edit by hand. Run pnpm --filter @argent/design-system generate.

import 'package:flutter/material.dart';

abstract final class ArgentTokens {
${resolvedTokens
  .map((token) => {
    const name = dartConstantName(token.path);
    const value = dartValue(token, token.resolvedValue);

    if (token.type === "color") {
      return `  static const ${name} = ${value};`;
    }

    if (token.type === "dimension" || token.type === "number") {
      return `  static const double ${name} = ${value};`;
    }

    if (token.type === "duration") {
      return `  static const ${name} = ${value};`;
    }

    return `  static const String ${name} =
      ${value};`;
  })
  .join("\n")}
}
`;

for (const outputPath of [webPath, packageDartPath, mobileDartPath]) {
  await mkdir(dirname(outputPath), { recursive: true });
}

await writeFile(webPath, css);
await writeFile(packageDartPath, dart);
await writeFile(mobileDartPath, dart);
