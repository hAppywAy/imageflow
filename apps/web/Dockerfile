FROM node:22-alpine AS base

ARG VITE_API_URL

FROM base AS builder

RUN apk update && apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare yarn@4.4.1

WORKDIR /app

RUN yarn global add turbo
COPY . .
RUN turbo prune web --docker

FROM base AS installer
RUN apk update && apk add --no-cache libc6-compat
WORKDIR /app

ENV VITE_API_URL=${VITE_API_URL}

COPY --from=builder /app/out/json/ .
RUN yarn install

COPY --from=builder /app/out/full/ .


RUN yarn turbo run build --filter=web...


FROM nginx:1.27.2-alpine AS runner

WORKDIR /app

COPY --from=installer /app/apps/web/dist /var/www/html/
COPY --from=installer /app/apps/web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3001

CMD ["nginx", "-g", "daemon off;"]

