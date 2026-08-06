# Stage 1: Build stage
FROM node:22-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
COPY packages/shared-types/package*.json ./packages/shared-types/
COPY apps/frontend/package*.json ./apps/frontend/

RUN npm ci

COPY packages/shared-types ./packages/shared-types
COPY apps/frontend ./apps/frontend

ARG NEXT_PUBLIC_API_URL=http://localhost:3001
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build:shared
RUN npm run build --workspace=apps/frontend

# Stage 2: Production runtime stage
FROM node:22-alpine AS runner

WORKDIR /usr/src/app

ENV NODE_ENV=production

COPY package*.json ./
COPY packages/shared-types/package*.json ./packages/shared-types/
COPY apps/frontend/package*.json ./apps/frontend/

RUN npm ci --omit=dev

COPY --from=builder /usr/src/app/packages/shared-types/dist ./packages/shared-types/dist
COPY --from=builder /usr/src/app/apps/frontend/.next ./apps/frontend/.next
COPY --from=builder /usr/src/app/apps/frontend/public ./apps/frontend/public

EXPOSE 3000

CMD ["npm", "run", "start", "--workspace=apps/frontend"]
