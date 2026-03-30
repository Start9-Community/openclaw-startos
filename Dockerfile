FROM node:22-bookworm-slim

ARG STARTOS_VERSION
ARG GH_VERSION=2.87.3
ARG OPENCLAW_VERSION=2026.3.28

# Install dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    git \
    jq \
    python3 \
    ripgrep \
    tmux \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Install GitHub CLI (direct binary)
RUN ARCH="$(dpkg --print-architecture)" && \
    curl -fsSL "https://github.com/cli/cli/releases/download/v${GH_VERSION}/gh_${GH_VERSION}_linux_${ARCH}.tar.gz" \
    | tar -xz --strip-components=1 -C /usr/local

# Install uv (Python package manager)
RUN curl -LsSf https://astral.sh/uv/install.sh | UV_INSTALL_DIR=/usr/local/bin sh

# Install openclaw using the official install script (non-interactive)
ENV HOME=/opt/openclaw-home
RUN mkdir -p /opt/openclaw-home && \
    curl -fsSL https://openclaw.bot/install.sh | bash -s -- --no-prompt --no-onboard --version "${OPENCLAW_VERSION}"

# Install start-cli from StartOS release
RUN curl -fsSL "https://github.com/Start9Labs/start-os/releases/download/v${STARTOS_VERSION}/start-cli_$(uname -m)-linux" -o /usr/local/bin/start-cli \
    && chmod +x /usr/local/bin/start-cli

# Stage skill files (loaded via extraDirs in openclaw.json)
COPY skills/start-cli/SKILL.md /opt/skills/start-cli/SKILL.md

# Stage workspace bootstrap files
COPY workspace/SOUL.md /opt/workspace/SOUL.md
COPY workspace/IDENTITY.md /opt/workspace/IDENTITY.md
COPY workspace/MEMORY.md /opt/workspace/MEMORY.md
COPY workspace/HEARTBEAT.md /opt/workspace/HEARTBEAT.md

# Set runtime environment variables
ENV NODE_ENV=production
ENV HOME=/data
ENV OPENCLAW_STATE_DIR=/data/.openclaw
# Include openclaw binary paths - both npm global and where openclaw may install its native binary
ENV PATH="/opt/openclaw-home/.openclaw/bin:/usr/local/lib/node_modules/openclaw/bin:/usr/local/bin:$PATH"

WORKDIR /data

# The entrypoint will be provided by the StartOS daemon configuration
# Default command runs the gateway
CMD ["openclaw", "gateway", "--port", "18789", "--bind", "lan"]
