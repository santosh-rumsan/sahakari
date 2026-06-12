FROM node:24-alpine AS builder
WORKDIR /app

RUN apk add --no-cache git python3 make g++
RUN corepack enable && corepack prepare pnpm@10.19.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps apps/
COPY packages packages/
COPY tooling tooling/

RUN pnpm install
RUN pnpm --filter @rs/db build && pnpm --filter api build

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production PORT=4082

RUN addgroup -S app && adduser -S app -G app
RUN mkdir -p /app/.uploads && chown -R app:app /app/.uploads  

COPY --from=builder /app/node_modules ./node_modules

# API app
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules

COPY --from=builder /app/packages ./packages

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml

USER app
EXPOSE 4082
CMD ["node", "apps/api/dist/main"]
