FROM node:24-alpine AS builder

WORKDIR /app
RUN apk add --no-cache git
RUN corepack enable && corepack prepare pnpm@10.19.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json apps/web/
COPY packages/*/package.json packages/*/

RUN pnpm install --frozen-lockfile
COPY . .

RUN pnpm --filter web build

FROM nginx:1.25-alpine AS runner
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
