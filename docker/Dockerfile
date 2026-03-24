ARG NODE_VERSION=22.22-alpine3.23

FROM node:${NODE_VERSION} AS base
ARG PNPM_VERSION
RUN corepack enable
RUN corepack prepare pnpm@${PNPM_VERSION} --activate

FROM base AS builder
RUN apk add --no-cache libc6-compat
RUN apk update

WORKDIR /app
ARG TURBO_VERSION
RUN npm install -g turbo@^${TURBO_VERSION}
COPY . .
RUN turbo prune --scope=explorer --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
RUN apk add --no-cache libc6-compat
RUN apk add --update --no-cache python3 build-base gcc && ln -sf /usr/bin/python3 /usr/bin/python
RUN apk update
WORKDIR /app

# First install the dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

# Build the project
COPY --from=builder /app/out/full/ .
ARG ENVIRONMENT=localhost
# Remove any local env files accidentally copied.
RUN rm -f ./apps/explorer/.env.*
# Generate one based on docker argument + builder stage.
COPY --from=builder /app/out/full/apps/explorer/.env.${ENVIRONMENT} ./apps/explorer/.env
RUN ls -la ./apps/explorer/
RUN pnpm build --filter=explorer

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=installer /app/apps/explorer/next.config.ts .
COPY --from=installer /app/apps/explorer/package.json .

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=installer --chown=nextjs:nodejs /app/apps/explorer/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/explorer/.next/static ./apps/explorer/.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "apps/explorer/server.js"]
