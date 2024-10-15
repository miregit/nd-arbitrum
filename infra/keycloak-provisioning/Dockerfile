FROM hashicorp/terraform:1.4

ARG VERSION_ARG
ENV VERSION=${VERSION_ARG}

LABEL org.label-schema.name="nd-demo-keycloak-provisioning" \
    org.label-schema.vendor="Noumena Digital" \
    org.label-schema.build-date="${BUILD_DATE}" \
    org.label-schema.vcs-ref="${GIT_REV}" \
    org.label-schema.version="${VERSION}" \
    org.opencontainers.image.source="https://github.com/ND-Arbitrum/nd-arbitrum"

WORKDIR /terraform
COPY *.tf *.sh /terraform/
VOLUME /state

ENTRYPOINT ["/bin/sh", "-c"]

