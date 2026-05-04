FROM node:22 AS build

WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci
COPY . .
RUN npm run build

FROM node:22 AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_URL=mysql://heroes_app:heroes_app@mysql:3306/nest_api
ENV JSON_SEED_ENABLED=false
ENV JSON_SEED_DATA_PATH=/app/.data

COPY package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/dist ./dist
COPY .data ./.data

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
