# Use the official Node.js image for all stages
FROM node:18 as base
WORKDIR /usr/src/app

# Install pnpm
RUN npm install -g pnpm

# Development stage
FROM base AS development
COPY package.json pnpm-lock.yaml ./
RUN pnpm install
COPY . .
ENV NODE_ENV=development
ARG STRAPI_URL
ARG STRAPI_TOKEN
ENV STRAPI_URL=${STRAPI_URL}
ENV STRAPI_TOKEN=${STRAPI_TOKEN}
EXPOSE 3000
CMD ["pnpm", "run", "dev"]

# Build stage for production
FROM base AS build
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
ARG STRAPI_URL
ARG STRAPI_TOKEN
ENV NODE_ENV=production
ENV STRAPI_URL=${STRAPI_URL}
ENV STRAPI_TOKEN=${STRAPI_TOKEN}
RUN pnpm run build

# Production stage
FROM base AS production
WORKDIR /usr/src/app
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/.output ./.output
COPY package.json ./
USER node
EXPOSE 3000
ENV NUXT_HOST=0.0.0.0
ENV STRAPI_URL=${STRAPI_URL}
ENV STRAPI_TOKEN=${STRAPI_TOKEN}
CMD ["sh", "-c", "pnpm run /usr/src/app/.output/server/index.mjs"]
