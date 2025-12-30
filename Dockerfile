# Dockerfile for InventoryPro
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --production=false
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --production
COPY --from=builder /app/.next .next
COPY --from=builder /app/public public
COPY --from=builder /app/prisma prisma
COPY --from=builder /app/node_modules node_modules
COPY --from=builder /app/.next .next
COPY . .
EXPOSE 3000
CMD ["npm", "run", "start"]
