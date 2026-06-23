# syntax=docker/dockerfile:1

FROM node:22.13.0-alpine AS deps
WORKDIR /app
RUN corepack enable
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

FROM node:22.13.0-alpine AS builder
WORKDIR /app
RUN corepack enable
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Build-only placeholder — lib/mongoose.ts throws at import time if MONGODB_URI is unset.
# It also fires an unawaited client.connect() at import; that promise is never awaited
# during the build, so it does not block it. Real values are injected at runtime.
ARG MONGODB_URI=mongodb://localhost:27017/devflow-build
ENV MONGODB_URI=$MONGODB_URI
RUN yarn build

FROM node:22.13.0-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
