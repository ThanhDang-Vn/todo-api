## Stage 1: install dependencies
FROM node:20-alpine AS deps 

WORKDIR /app 

COPY package.json package-lock.json ./ 
COPY prisma ./prisma/ 

RUN npm ci 

RUN npx prisma generate

## Stage 2: build the application 
FROM node:20-alpine AS builder 

WORKDIR /app 

COPY --from=deps /app/node_modules ./node_modules
COPY . . 

RUN npm run build 

## Stage 3: production image 

FROM node:20-alpine AS runner 

WORKDIR /app 

COPY --from=builder /app/dist ./dist 
COPY --from=builder /app/node_modules ./node_modules 
COPY --from=builder /app/package.json ./package.json 
COPY --from=builder /app/prisma ./prisma 

USER nestjs 

EXPOSE 3001 
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
