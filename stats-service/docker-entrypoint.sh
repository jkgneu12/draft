#!/bin/bash

sed -i "s@{{LOG_LEVEL}}@$LOG_LEVEL@g" /etc/app/app.conf
sed -i "s@{{DEBUG}}@$DEBUG@g" /etc/app/app.conf
sed -i "s@{{AUTORELOAD}}@$AUTORELOAD@g" /etc/app/app.conf
sed -i "s@{{DB_USER}}@$DB_USER@g" /etc/app/app.conf
sed -i "s@{{DB_PASSWORD}}@$DB_PASSWORD@g" /etc/app/app.conf
sed -i "s@{{DB_DATABASE}}@$DB_DATABASE@g" /etc/app/app.conf

exec "$@"

