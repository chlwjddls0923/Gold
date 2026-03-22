FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# 브라우저용 (클라이언트) - localhost 사용
ENV NEXT_PUBLIC_API_URL=http://localhost:4000/api
# 서버용 (SSR) - Docker 내부 서비스명 사용
ENV API_INTERNAL_URL=http://backend:4000/api
RUN npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_PUBLIC_API_URL=http://localhost:4000/api
ENV API_INTERNAL_URL=http://backend:4000/api
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["npm", "start"]
