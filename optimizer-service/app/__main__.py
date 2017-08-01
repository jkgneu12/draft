import os
import logging
import logging.config
import argparse
import configparser

import tornado.httpserver
import tornado.ioloop
import tornado.options
import tornado.web
from tornado.options import options

from app.handlers import *

import logging
logger = logging.getLogger(__name__)

class App(tornado.web.Application):

    def __init__(self, config):
        handlers = []

        handlers.append((r"/optimize", OptimizeHandler))

        settings = {
            'debug': config.getboolean('main', 'debug'),
            'autoreload': config.getboolean('main', 'autoreload')
        }

        logger.info('Settings: {}'.format(settings))

        tornado.web.Application.__init__(self, handlers, **settings)

        logger.info('Server started')

def main():
    parser = argparse.ArgumentParser(description='init')
    parser.add_argument('--config', dest='config', required=True)
    args = parser.parse_args()
    if not args.config:
        parser.print_help()
        sys.exit(1)
    config = configparser.ConfigParser(os.environ)
    config.read(args.config)

    logging.config.fileConfig(config, disable_existing_loggers=0)
    logging.getLogger('tornado').setLevel(config.getint('main', 'logging'))

    application = App(config)
    http_server = tornado.httpserver.HTTPServer(application)
    http_server.listen(config.getint('main', 'port', fallback=80))

    tornado.ioloop.IOLoop.instance().start()

if __name__ == "__main__":
    main()
