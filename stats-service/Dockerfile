FROM python:3.5

ENV APP_DIR=/app \
    CONF_DIR=/etc/app \
    LOG_DIR=/var/log/app

RUN mkdir -p $APP_DIR $CONF_DIR $LOG_DIR

VOLUME ["$LOG_DIR"]

EXPOSE 80

WORKDIR $APP_DIR

ADD . $APP_DIR
ADD ./conf/app.conf $CONF_DIR/app.conf
ADD ./docker-entrypoint.sh /

RUN pip install -r requirements.txt

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["python", "-m", "app", "--config", "/etc/app/app.conf"]
