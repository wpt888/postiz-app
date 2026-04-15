FROM node:22.20-bookworm-slim
ARG NEXT_PUBLIC_VERSION
ENV NEXT_PUBLIC_VERSION=$NEXT_PUBLIC_VERSION

RUN apt-get update && apt-get install -y --no-install-recommends \
    g++ \
    make \
    python3-pip \
    bash \
    nginx \
&& rm -rf /var/lib/apt/lists/*

RUN addgroup --system www \
 && adduser --system --ingroup www --home /www --shell /usr/sbin/nologin www \
 && mkdir -p /www \
 && chown -R www:www /www /var/lib/nginx

RUN npm --no-update-notifier --no-fund --global install pnpm@10.6.1 pm2

WORKDIR /app

# Copy only dependency manifests first — this layer is cached as long as
# package.json / pnpm-lock.yaml don't change, so pnpm install is skipped
# on code-only changes.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/frontend/package.json ./apps/frontend/
COPY apps/orchestrator/package.json ./apps/orchestrator/
COPY apps/commands/package.json ./apps/commands/
COPY apps/extension/package.json ./apps/extension/
COPY apps/sdk/package.json ./apps/sdk/

RUN pnpm install --frozen-lockfile

# Now copy the rest of the source and build
COPY . /app
COPY var/docker/nginx.conf /etc/nginx/nginx.conf

RUN NODE_OPTIONS="--max-old-space-size=4096" pnpm run build

CMD ["sh", "-c", "nginx && pnpm run pm2"]
