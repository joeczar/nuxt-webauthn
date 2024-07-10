FROM node:20 as base
WORKDIR /usr/src/app

# Install pnpm
RUN npm install -g pnpm

# Set the pnpm store location
ENV PNPM_STORE_PATH="/root/.pnpm-store"
RUN pnpm config set store-dir $PNPM_STORE_PATH

# Development stage
FROM base AS development
COPY package.json pnpm-lock.yaml .npmrc ./
# Remove existing node_modules and pnpm store if any
RUN rm -rf node_modules $PNPM_STORE_PATH .nuxt .output

# Install all dependencies, including devDependencies
RUN pnpm install --frozen-lockfile
COPY . .
ENV NODE_ENV=development
ARG STRAPI_URL
ARG STRAPI_TOKEN
ENV STRAPI_URL=${STRAPI_URL}
ENV STRAPI_TOKEN=${STRAPI_TOKEN}
# Instead of adding packages, update existing ones
RUN rm -rf node_modules $PNPM_STORE_PATH && pnpm install --frozen-lockfile && pnpm update @simplewebauthn/browser @simplewebauthn/server sequelize uuid @prisma/client @sendgrid/mail
RUN rm -rf .nuxt .output
RUN pnpm run build
EXPOSE 3000
ENV HOST=0.0.0.0
ENV PORT=3000
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
