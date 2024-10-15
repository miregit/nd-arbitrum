FROM quay.io/keycloak/keycloak:18.0.2

ARG VERSION_ARG
ENV VERSION=${VERSION_ARG}

LABEL org.label-schema.name="nd-demo-keycloak" \
    org.label-schema.vendor="Noumena Digital" \
    org.label-schema.build-date="${BUILD_DATE}" \
    org.label-schema.vcs-ref="${GIT_REV}" \
    org.label-schema.version="${VERSION}" \
    org.opencontainers.image.source="https://github.com/ND-Arbitrum/nd-arbitrum"

COPY email-base ./opt/keycloak/themes/email-base
COPY kecloak-frontend ./opt/keycloak/themes/kecloak-frontend