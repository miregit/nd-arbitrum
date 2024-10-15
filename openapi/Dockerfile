FROM swaggerapi/swagger-ui

LABEL org.label-schema.name="nd-demo-openapi" \
    org.label-schema.vendor="Noumena Digital" \
    org.label-schema.build-date="${BUILD_DATE}" \
    org.label-schema.vcs-ref="${GIT_REV}" \
    org.label-schema.version="${VERSION}" \
    org.opencontainers.image.source="https://github.com/ND-Arbitrum/nd-arbitrum"

# base image runs as non root user

COPY ./api-calls.yml /openapi/api-calls.yml
COPY ./data /openapi/data

ENV SWAGGER_JSON=/openapi/api-calls.yml \
    BASE_URL="/openapi"
