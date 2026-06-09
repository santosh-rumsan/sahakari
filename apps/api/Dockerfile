FROM node:24-alpine AS builder

WORKDIR /app
RUN apk add --no-cache git python3 make g++
RUN corepack enable && corepack prepare pnpm@10.19.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/
COPY packages/*/package.json packages/*/

RUN pnpm install --frozen-lockfile
COPY . .

RUN pnpm --filter api build

FROM node:24-alpine AS runner
WORKDIR /app/apps/api
ENV NODE_ENV=production
ENV PORT=3000
RUN addgroup -S app && adduser -S app -G app

COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json ./package.json

USER app
EXPOSE 3000
CMD ["node", "dist/main"]
