FROM python:3.5

ENV APP_DIR=/app \
    CONF_DIR=/etc/app \
    LOG_DIR=/var/log/app \
    TMP_DIR=/tmp/app

RUN mkdir -p $APP_DIR $CONF_DIR $LOG_DIR $TMP_DIR

VOLUME ["$LOG_DIR"]

EXPOSE 80

WORKDIR $APP_DIR
ADD ./api/requirements.txt $APP_DIR/
RUN pip install -r requirements.txt

ADD ./api/conf/app.conf $CONF_DIR/app.conf
ADD . $APP_DIR

RUN python setup.py install

ADD ./docker-entrypoint.sh /

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["api", "--config", "/etc/app/app.conf"]
