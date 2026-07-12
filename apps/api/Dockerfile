FROM node:24-alpine AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable

FROM base AS builder
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/shared ./packages/shared
COPY packages/ui ./packages/ui
COPY apps/api ./apps/api
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm --filter @demp/api build

FROM base AS runner
WORKDIR /app
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/prisma ./prisma
COPY --from=builder /app/apps/api/package.json ./
COPY --from=builder /app/node_modules/.pnpm ./node_modules/.pnpm
COPY --from=builder /app/packages ./packages
COPY apps/api/entrypoint.sh ./entrypoint.sh
RUN chmod +x entrypoint.sh
EXPOSE 4000
ENTRYPOINT ["./entrypoint.sh"]
