FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Aceita VITE_API_URL como build arg para produção
ARG VITE_API_URL=http://localhost:3000
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public/serve.json ./serve.json
RUN npm install -g serve
CMD ["serve", "-s", "dist", "-l", "5173"]
