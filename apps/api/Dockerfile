FROM node:22-alpine AS base

ARG YARN_VERSION=4.4.1
ARG PORT=3000

FROM base AS builder

RUN apk update && apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare yarn@$YARN_VERSION

WORKDIR /app

RUN yarn global add turbo
COPY . .
RUN turbo prune api --docker

FROM base AS installer
RUN apk update && apk add --no-cache libc6-compat

WORKDIR /app

COPY --from=builder /app/out/json/ .
RUN yarn install

COPY --from=builder /app/out/full/ .
RUN yarn generate
RUN yarn turbo run build --filter=api...

FROM base AS production

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

USER nestjs

COPY --from=installer --chown=nodejs:nestjs /app .

CMD ["node", "apps/api/dist/main.js"]

EXPOSE $PORT
