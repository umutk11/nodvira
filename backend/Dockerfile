FROM node:20-alpine AS dependencies

WORKDIR /app/backend

RUN corepack enable \
    && corepack prepare pnpm@10.15.0 --activate

COPY backend/package.json backend/pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

FROM node:20-alpine AS runtime

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000

WORKDIR /app/backend

COPY --from=dependencies --chown=node:node /app/backend/node_modules ./node_modules
COPY --chown=node:node backend/package.json backend/pnpm-lock.yaml ./
COPY --chown=node:node backend/src/ ./src/
COPY --chown=node:node backend/scripts/ ./scripts/
COPY --chown=node:node backend/migrations/ ./migrations/

# Static import commands resolve these files from /app/assets.
COPY --chown=node:node assets/data/ /app/assets/data/
COPY --chown=node:node assets/site.js /app/assets/site.js

RUN mkdir -p /app/backend/uploads \
    && chown -R node:node /app/backend/uploads

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then((response) => { if (!response.ok) process.exit(1); }).catch(() => process.exit(1));"

CMD ["node", "src/server.js"]
