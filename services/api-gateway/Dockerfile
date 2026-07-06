FROM node:20-alpine AS build
WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json ./
COPY packages ./packages
COPY services ./services
COPY apps ./apps

RUN npm install -g pnpm && pnpm install --no-frozen-lockfile
RUN pnpm --filter @sentinel/schemas build
RUN pnpm --filter @sentinel/api-gateway build

FROM node:20-alpine AS runtime
WORKDIR /app
COPY --from=build /app ./

EXPOSE 4000
CMD ["node", "services/api-gateway/dist/index.js"]
