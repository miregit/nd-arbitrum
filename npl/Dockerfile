FROM ghcr.io/noumenadigital/packages/engine:2024.1.5

LABEL org.opencontainers.image.source = "https://github.com/ND-Arbitrum/nd-arbitrum"

ENV ENGINE_NPL_MIGRATION_DIRECTORY_PATH="/npl"

# base image runs as non root user

COPY src/main/yaml /npl/yaml
COPY src/main/npl  /npl/npl-1.0.0