FROM node:20-slim AS builder
WORKDIR /app
RUN apt-get update -y && apt-get install -y openssl ca-certificates
COPY package*.json ./
COPY prisma ./prisma/
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

FROM node:20-slim AS production
WORKDIR /app
RUN apt-get update -y && apt-get install -y openssl ca-certificates
COPY package*.json ./
COPY prisma ./prisma/
RUN npm install --omit=dev --legacy-peer-deps
COPY --from=builder /app/dist ./dist
RUN npx prisma generate
EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
