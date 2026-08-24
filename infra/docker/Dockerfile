# syntax=docker/dockerfile:1.7@sha256:a57df69d0ea827fb7266491f2813635de6f17269be881f696fbfdf2d83dda33e

ARG BUILD_NODE_IMAGE=node:24.18.0-bookworm-slim@sha256:6f7b03f7c2c8e2e784dcf9295400527b9b1270fd37b7e9a7285cf83b6951452d
ARG RUNTIME_NODE_IMAGE=gcr.io/distroless/nodejs24-debian13:nonroot@sha256:ffab599740d4aaa66029d02b9e6d3de4f622fefb7410081c5ef69c86430f364d

FROM ${BUILD_NODE_IMAGE} AS toolchain
ENV PNPM_HOME=/pnpm
ENV PATH=${PNPM_HOME}:${PATH}
ENV NEXT_TELEMETRY_DISABLED=1
RUN corepack enable && corepack prepare pnpm@10.34.5 --activate
WORKDIR /workspace

FROM toolchain AS dependencies
COPY . .
RUN --mount=type=cache,id=argent-pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile \
      --filter @argent/admin... \
      --filter @argent/web... \
      --filter @argent/api... \
      --filter @argent/worker...

FROM dependencies AS build
RUN pnpm --filter @argent/domain build \
    && pnpm --filter @argent/admin build \
    && pnpm --filter @argent/web build \
    && pnpm --filter @argent/api build \
    && pnpm --filter @argent/worker build \
    && pnpm --filter @argent/api deploy --prod /output/api --legacy \
    && pnpm --filter @argent/worker deploy --prod /output/worker --legacy

FROM ${RUNTIME_NODE_IMAGE} AS web
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
WORKDIR /app
COPY --from=build --chown=65532:65532 /workspace/apps/web/.next/standalone/ ./
USER 65532:65532
EXPOSE 3000
CMD ["apps/web/server.js"]

FROM ${RUNTIME_NODE_IMAGE} AS admin
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3002
WORKDIR /app
COPY --from=build --chown=65532:65532 /workspace/apps/admin/.next/standalone/ ./
USER 65532:65532
EXPOSE 3002
CMD ["apps/admin/server.js"]

FROM ${RUNTIME_NODE_IMAGE} AS api
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3001
WORKDIR /app
COPY --from=build --chown=65532:65532 /output/api/ ./
USER 65532:65532
EXPOSE 3001
CMD ["dist/server.js"]

FROM ${RUNTIME_NODE_IMAGE} AS worker
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build --chown=65532:65532 /output/worker/ ./
USER 65532:65532
CMD ["dist/main.js"]
