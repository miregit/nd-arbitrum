FROM rabbitmq:3-management

LABEL org.label-schema.name="nd-demo-rabbitmq" \
    org.label-schema.vendor="Noumena Digital" \
    org.label-schema.build-date="${BUILD_DATE}" \
    org.label-schema.vcs-ref="${GIT_REV}" \
    org.label-schema.version="${VERSION}" \
    org.opencontainers.image.source="https://github.com/NoumenaDigital/nd-demo"

# base image runs as non root user
COPY etc/definitions.json /etc/rabbitmq/definitions.json
COPY etc/rabbitmqConf.sh rabbitmqConf.sh

RUN chmod -R 744 rabbitmqConf.sh
RUN rabbitmq-plugins enable rabbitmq_amqp1_0
RUN ./rabbitmqConf.sh
