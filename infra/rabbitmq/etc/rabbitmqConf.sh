#!/bin/sh
echo "default_user = admin
default_pass = adminpass
amqp1_0.default_user  = guest
amqp1_0.default_vhost = nd-demo
amqp1_0.protocol_strict_mode = false


management.load_definitions = $BASE_PATH/etc/rabbitmq/definitions.json" | tee >  $BASE_PATH/etc/rabbitmq/rabbitmq.conf | chmod 644 "$BASE_PATH/etc/rabbitmq/rabbitmq.conf"

echo "check rabbitmq.conf!!"
cat $BASE_PATH/etc/rabbitmq/rabbitmq.conf