# Stage 1: Base
FROM node:22-alpine AS base

# Stage 2: Dependencies
FROM base AS deps
WORKDIR /app
# bcrypt ships prebuilt binaries but falls back to node-gyp on musl.
RUN apk add --no-cache build-base python3
COPY package.json package-lock.json* ./
RUN npm ci

# Stage 3: Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Prisma's generated client is gitignored, so it must be built here.
RUN npx prisma generate

# NEXT_PUBLIC_* vars are inlined at build time, not read from .env at runtime.
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_UMAMI_WEBSITE_ID
ENV NEXT_PUBLIC_UMAMI_WEBSITE_ID=$NEXT_PUBLIC_UMAMI_WEBSITE_ID
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# Stage 4: Runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Schema only, for reference/debugging. The Prisma CLI is intentionally not
# shipped here: migrations run on the host via ./deploy.sh, which keeps this
# image lean and makes schema changes a deliberate deploy step.
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# Admin uploads land here; docker-compose bind-mounts it so they survive rebuilds.
RUN mkdir -p /app/public/uploads && chown -R nextjs:nodejs /app/public/uploads

COPY --chown=nextjs:nodejs startup.sh .
RUN sed -i 's/\r$//' startup.sh && chmod +x startup.sh

USER nextjs
EXPOSE 3006
ENV PORT=3006
ENV HOSTNAME="127.0.0.1"
CMD ["./startup.sh"]
