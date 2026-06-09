# syntax=docker/dockerfile:1
FROM node:24-alpine AS builder

WORKDIR /app
RUN apk add --no-cache git
RUN corepack enable && corepack prepare pnpm@10.19.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps apps/
COPY packages packages/
COPY tooling tooling/

RUN pnpm install

COPY . .
RUN pnpm --filter pwa build

FROM nginx:1.25-alpine AS runner
COPY --from=builder /app/apps/pwa/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
