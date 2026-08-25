export const interviewUsageSchemaVersion = "interview-usage-ledger/v1" as const;

export type InterviewExecutionKind = "ai-provider" | "deterministic-template";
export type InterviewUsageEnvironment =
  "development" | "preview" | "production" | "test";
export type InterviewUsageMode =
  "hybrid" | "structured" | "typed-conversation" | "voice";
export type InterviewCacheBehavior = "none" | "read" | "read-write" | "write";

export interface InterviewUsageExecutionInput {
  readonly audioInputMs: number;
  readonly audioOutputMs: number;
  readonly cacheBehavior: InterviewCacheBehavior;
  readonly cacheReadTokens: number;
  readonly cacheWriteTokens: number;
  readonly environment: InterviewUsageEnvironment;
  readonly estimatedCostMicrousd: number;
  readonly executionId: string;
  readonly executionKind: InterviewExecutionKind;
  readonly inputTokens: number;
  readonly latencyMs: number;
  readonly mode: InterviewUsageMode;
  readonly model: string | null;
  readonly occurredAt: string;
  readonly outputTokens: number;
  readonly provider: string | null;
  readonly retryCount: number;
  readonly sessionId: string;
}

export interface InterviewUsageExecution extends InterviewUsageExecutionInput {
  readonly schemaVersion: typeof interviewUsageSchemaVersion;
  readonly sourceContentStored: false;
}

export interface InterviewBudgetPolicy {
  readonly featureEnabled: boolean;
  readonly maxAudioMsPerExecution: number;
  readonly maxEstimatedCostMicrousdPerSession: number;
  readonly maxExecutionsPerSession: number;
  readonly maxInputTokensPerExecution: number;
  readonly maxLatencyMsPerExecution: number;
  readonly maxOutputTokensPerExecution: number;
  readonly maxSessionElapsedMs: number;
  readonly providerEnabled: boolean;
}

export type InterviewBudgetFallbackReason =
  | "audio-limit"
  | "cost-limit"
  | "execution-limit"
  | "feature-kill-switch"
  | "input-token-limit"
  | "latency-limit"
  | "output-token-limit"
  | "provider-kill-switch"
  | "session-time-limit";

export type InterviewBudgetDecision =
  | {
      readonly action: "allow";
      readonly estimatedSessionCostMicrousd: number;
    }
  | {
      readonly action: "structured-fallback";
      readonly estimatedSessionCostMicrousd: number;
      readonly reason: InterviewBudgetFallbackReason;
    };

const executionKeys = [
  "audioInputMs",
  "audioOutputMs",
  "cacheBehavior",
  "cacheReadTokens",
  "cacheWriteTokens",
  "environment",
  "estimatedCostMicrousd",
  "executionId",
  "executionKind",
  "inputTokens",
  "latencyMs",
  "mode",
  "model",
  "occurredAt",
  "outputTokens",
  "provider",
  "retryCount",
  "sessionId",
] as const;
const validEnvironments = new Set<InterviewUsageEnvironment>([
  "development",
  "preview",
  "production",
  "test",
]);
const validModes = new Set<InterviewUsageMode>([
  "hybrid",
  "structured",
  "typed-conversation",
  "voice",
]);
const validCacheBehaviors = new Set<InterviewCacheBehavior>([
  "none",
  "read",
  "read-write",
  "write",
]);
const identifierPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function recordInterviewUsageExecution(
  input: unknown,
): InterviewUsageExecution {
  if (!isRecord(input) || !hasExactKeys(input, executionKeys)) {
    throw new Error("Interview usage rejected: unexpected or missing fields");
  }

  const executionKind = requireExecutionKind(input.executionKind);
  const provider = requireProviderValue(input.provider, executionKind);
  const model = requireProviderValue(input.model, executionKind);
  const cacheBehavior = requireEnum(
    input.cacheBehavior,
    validCacheBehaviors,
    "Cache behavior",
  );

  const execution: InterviewUsageExecution = {
    audioInputMs: requireNonNegativeInteger(
      input.audioInputMs,
      "Audio input milliseconds",
    ),
    audioOutputMs: requireNonNegativeInteger(
      input.audioOutputMs,
      "Audio output milliseconds",
    ),
    cacheBehavior,
    cacheReadTokens: requireNonNegativeInteger(
      input.cacheReadTokens,
      "Cache read tokens",
    ),
    cacheWriteTokens: requireNonNegativeInteger(
      input.cacheWriteTokens,
      "Cache write tokens",
    ),
    environment: requireEnum(
      input.environment,
      validEnvironments,
      "Environment",
    ),
    estimatedCostMicrousd: requireNonNegativeInteger(
      input.estimatedCostMicrousd,
      "Estimated cost",
    ),
    executionId: requireIdentifier(input.executionId, "Execution ID"),
    executionKind,
    inputTokens: requireNonNegativeInteger(input.inputTokens, "Input tokens"),
    latencyMs: requireNonNegativeInteger(input.latencyMs, "Latency"),
    mode: requireEnum(input.mode, validModes, "Interview mode"),
    model,
    occurredAt: requireIsoTimestamp(input.occurredAt, "Occurred at"),
    outputTokens: requireNonNegativeInteger(
      input.outputTokens,
      "Output tokens",
    ),
    provider,
    retryCount: requireNonNegativeInteger(input.retryCount, "Retry count"),
    schemaVersion: interviewUsageSchemaVersion,
    sessionId: requireIdentifier(input.sessionId, "Session ID"),
    sourceContentStored: false,
  };

  validateCacheMetrics(execution);
  validateDeterministicExecution(execution);
  return execution;
}

export function evaluateInterviewBudget(
  input: Readonly<{
    execution: InterviewUsageExecution;
    existingExecutions: readonly InterviewUsageExecution[];
    policy: InterviewBudgetPolicy;
    sessionElapsedMs: number;
  }>,
): InterviewBudgetDecision {
  const sessionElapsedMs = requireNonNegativeInteger(
    input.sessionElapsedMs,
    "Session elapsed milliseconds",
  );
  validateBudgetPolicy(input.policy);

  if (
    input.existingExecutions.some(
      (execution) => execution.sessionId !== input.execution.sessionId,
    )
  ) {
    throw new Error("Interview budget history must belong to one session");
  }
  const executionIds = new Set(
    input.existingExecutions.map((execution) => execution.executionId),
  );
  if (
    executionIds.size !== input.existingExecutions.length ||
    executionIds.has(input.execution.executionId)
  ) {
    throw new Error("Interview budget history contains a duplicate execution");
  }

  const estimatedSessionCostMicrousd = [
    ...input.existingExecutions,
    input.execution,
  ].reduce((total, execution) => total + execution.estimatedCostMicrousd, 0);
  const fallback = (
    reason: InterviewBudgetFallbackReason,
  ): InterviewBudgetDecision => ({
    action: "structured-fallback",
    estimatedSessionCostMicrousd,
    reason,
  });

  if (!input.policy.featureEnabled) return fallback("feature-kill-switch");
  if (
    input.execution.executionKind === "ai-provider" &&
    !input.policy.providerEnabled
  ) {
    return fallback("provider-kill-switch");
  }
  if (input.existingExecutions.length >= input.policy.maxExecutionsPerSession) {
    return fallback("execution-limit");
  }
  if (sessionElapsedMs > input.policy.maxSessionElapsedMs) {
    return fallback("session-time-limit");
  }
  if (input.execution.inputTokens > input.policy.maxInputTokensPerExecution) {
    return fallback("input-token-limit");
  }
  if (input.execution.outputTokens > input.policy.maxOutputTokensPerExecution) {
    return fallback("output-token-limit");
  }
  if (input.execution.latencyMs > input.policy.maxLatencyMsPerExecution) {
    return fallback("latency-limit");
  }
  if (
    input.execution.audioInputMs + input.execution.audioOutputMs >
    input.policy.maxAudioMsPerExecution
  ) {
    return fallback("audio-limit");
  }
  if (
    estimatedSessionCostMicrousd >
    input.policy.maxEstimatedCostMicrousdPerSession
  ) {
    return fallback("cost-limit");
  }

  return { action: "allow", estimatedSessionCostMicrousd };
}

function validateBudgetPolicy(policy: InterviewBudgetPolicy): void {
  if (
    typeof policy.featureEnabled !== "boolean" ||
    typeof policy.providerEnabled !== "boolean"
  ) {
    throw new Error("Interview budget kill switches must be boolean");
  }
  requireNonNegativeInteger(policy.maxAudioMsPerExecution, "Audio limit");
  requireNonNegativeInteger(
    policy.maxEstimatedCostMicrousdPerSession,
    "Session cost limit",
  );
  requireNonNegativeInteger(
    policy.maxExecutionsPerSession,
    "Session execution limit",
  );
  requireNonNegativeInteger(
    policy.maxInputTokensPerExecution,
    "Input token limit",
  );
  requireNonNegativeInteger(policy.maxLatencyMsPerExecution, "Latency limit");
  requireNonNegativeInteger(
    policy.maxOutputTokensPerExecution,
    "Output token limit",
  );
  requireNonNegativeInteger(policy.maxSessionElapsedMs, "Session time limit");
}

function validateCacheMetrics(execution: InterviewUsageExecution): void {
  const reads = execution.cacheReadTokens > 0;
  const writes = execution.cacheWriteTokens > 0;
  if (
    (execution.cacheBehavior === "none" && (reads || writes)) ||
    (execution.cacheBehavior === "read" && (!reads || writes)) ||
    (execution.cacheBehavior === "write" && (reads || !writes)) ||
    (execution.cacheBehavior === "read-write" && (!reads || !writes))
  ) {
    throw new Error("Interview usage rejected: cache metrics do not agree");
  }
}

function validateDeterministicExecution(
  execution: InterviewUsageExecution,
): void {
  if (execution.executionKind !== "deterministic-template") return;
  if (
    execution.provider !== null ||
    execution.model !== null ||
    execution.inputTokens !== 0 ||
    execution.outputTokens !== 0 ||
    execution.audioInputMs !== 0 ||
    execution.audioOutputMs !== 0 ||
    execution.cacheBehavior !== "none" ||
    execution.cacheReadTokens !== 0 ||
    execution.cacheWriteTokens !== 0 ||
    execution.estimatedCostMicrousd !== 0
  ) {
    throw new Error(
      "Interview usage rejected: deterministic execution cannot claim provider usage",
    );
  }
}

function requireExecutionKind(value: unknown): InterviewExecutionKind {
  if (value === "ai-provider" || value === "deterministic-template")
    return value;
  throw new Error("Execution kind is invalid");
}

function requireProviderValue(
  value: unknown,
  executionKind: InterviewExecutionKind,
): string | null {
  if (executionKind === "deterministic-template") {
    if (value !== null)
      throw new Error("Deterministic usage requires null provider fields");
    return null;
  }
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error("Provider usage requires provider and model values");
  }
  return value.trim();
}

function requireEnum<T extends string>(
  value: unknown,
  allowed: ReadonlySet<T>,
  label: string,
): T {
  if (typeof value === "string" && allowed.has(value as T)) return value as T;
  throw new Error(`${label} is invalid`);
}

function requireIdentifier(value: unknown, label: string): string {
  if (typeof value !== "string" || !identifierPattern.test(value)) {
    throw new Error(`${label} must be a lowercase identifier`);
  }
  return value;
}

function requireIsoTimestamp(value: unknown, label: string): string {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value) ||
    Number.isNaN(Date.parse(value))
  ) {
    throw new Error(`${label} must be an ISO timestamp`);
  }
  return value;
}

function requireNonNegativeInteger(value: unknown, label: string): number {
  if (!Number.isSafeInteger(value) || (value as number) < 0) {
    throw new Error(`${label} must be a non-negative integer`);
  }
  return value as number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasExactKeys(
  value: Record<string, unknown>,
  expectedKeys: readonly string[],
): boolean {
  const actualKeys = Object.keys(value).sort();
  return (
    actualKeys.length === expectedKeys.length &&
    [...expectedKeys].sort().every((key, index) => key === actualKeys[index])
  );
}
