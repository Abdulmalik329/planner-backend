FROM node:20-slim AS builder

WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl ca-certificates

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build
RUN npx prisma generate

FROM node:20-slim AS production

WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl ca-certificates

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install --legacy-peer-deps --ignore-scripts

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
