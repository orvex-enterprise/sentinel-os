FROM node:20-alpine AS build
WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json ./
COPY packages ./packages
COPY services ./services
COPY apps ./apps

RUN npm install -g pnpm && pnpm install --no-frozen-lockfile
RUN pnpm --filter @sentinel/schemas build
RUN pnpm --filter @sentinel/dashboard build

FROM nginx:alpine AS runtime
COPY --from=build /app/apps/dashboard/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
