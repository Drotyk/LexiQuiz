# Stage 1: Build stage
FROM node:22-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
COPY packages/shared-types/package*.json ./packages/shared-types/
COPY apps/backend/package*.json ./apps/backend/

RUN npm ci

COPY packages/shared-types ./packages/shared-types
COPY apps/backend ./apps/backend

RUN npm run build:shared
RUN npm run build --workspace=apps/backend

# Stage 2: Production runtime stage
FROM node:22-alpine AS runner

WORKDIR /usr/src/app

ENV NODE_ENV=production

COPY package*.json ./
COPY packages/shared-types/package*.json ./packages/shared-types/
COPY apps/backend/package*.json ./apps/backend/

RUN npm ci --omit=dev

COPY --from=builder /usr/src/app/packages/shared-types/dist ./packages/shared-types/dist
COPY --from=builder /usr/src/app/apps/backend/dist ./apps/backend/dist

EXPOSE 3001

CMD ["node", "apps/backend/dist/main.js"]
