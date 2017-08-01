#!/bin/bash

sed -i "s@{{LOG_LEVEL}}@$LOG_LEVEL@g" /etc/app/app.conf
sed -i "s@{{DEBUG}}@$DEBUG@g" /etc/app/app.conf
sed -i "s@{{AUTORELOAD}}@$AUTORELOAD@g" /etc/app/app.conf

exec "$@"

