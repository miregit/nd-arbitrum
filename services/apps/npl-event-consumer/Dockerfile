FROM node:16

ARG VERSION
ARG BUILD_DATE
ARG GIT_REV
ARG VERSION_ARG
ENV VERSION=${VERSION_ARG}
LABEL org.label-schema.name="nd-demo-npl-event-consumer" \
    org.label-schema.vendor="Noumena Digital" \
    org.label-schema.build-date="${BUILD_DATE}" \
    org.label-schema.vcs-ref="${GIT_REV}" \
    org.label-schema.version="${VERSION}" \
    org.opencontainers.image.source="https://github.com/ND-Arbitrum/nd-arbitrum"


RUN groupadd -r ndusers

RUN useradd -r -g ndusers appuser

WORKDIR /usr/src/app
RUN chown -R appuser:ndusers /usr/src/app
USER appuser
COPY ./dist/apps/npl-event-consumer /usr/src/app/dist
COPY ./node_modules /usr/src/app/node_modules
CMD node dist/main.js
