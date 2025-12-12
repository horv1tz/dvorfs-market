FROM node:18-alpine AS base

WORKDIR /app

COPY services/payments-service/package*.json ./
RUN npm install

FROM base AS development
COPY services/payments-service ./
COPY shared ./shared
CMD ["npm", "run", "dev"]

FROM base AS build
COPY shared ./shared
COPY services/payments-service ./
RUN npm run build

FROM node:18-alpine AS production
WORKDIR /app

RUN apk add --no-cache netcat-openbsd

ENV NODE_ENV=production

COPY --from=build /app/package*.json ./
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/knexfile.ts ./
COPY --from=build /app/shared ./shared
COPY services/payments-service/docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

EXPOSE 3004

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["npm", "start"]
