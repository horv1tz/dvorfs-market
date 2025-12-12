FROM node:18-alpine AS base

WORKDIR /app

COPY services/api-gateway/package*.json ./
RUN npm install

FROM base AS development
COPY services/api-gateway ./
CMD ["npm", "run", "dev"]

FROM base AS build
COPY services/api-gateway ./
RUN npm run build

FROM node:18-alpine AS production
WORKDIR /app

ENV NODE_ENV=production

COPY --from=build /app/package*.json ./
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules

EXPOSE 3000

CMD ["npm", "start"]
