#!/usr/bin/env python
from sqlalchemy import engine_from_config
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm import scoped_session
import tornado.httpserver
import tornado.ioloop
import tornado.options
import tornado.web
from tornado.options import define, options

from api import DraftsHandler, TeamsHandler, PlayersHandler, CorePlayersHandler, RostersHandler
from models import Base

define("port", default=9000, help="run on the given port", type=int)
define("proxy", default="", help="prefix your endpoints with a string", type=str)
define("msurl", default="mysql+pymysql://root:%s@localhost/draft?charset=utf8", help="mysql url", type=str)
define("mspwd", default="", help="mysql password", type=str)


class App(tornado.web.Application):

    def __init__(self, options):
        engine = engine_from_config({
            'sqlalchemy.url': options.msurl % options.mspwd,
            'sqlalchemy.echo': False
            })
        self.db = scoped_session(sessionmaker(bind=engine))

        ##TODO: remove in production
        Base.metadata.create_all(engine)

        handlers = []
        handlers.append((r"%s/drafts/(.*)/teams/?(.*)" % options.proxy, TeamsHandler))
        handlers.append((r"%s/drafts/(.*)/players/?(.*)" % options.proxy, PlayersHandler))
        handlers.append((r"%s/draftroster/?(.*)" % options.proxy, RostersHandler))
        handlers.append((r"%s/drafts/?(.*)" % options.proxy, DraftsHandler))

        handlers.append((r"%s/players/?(.*)" % options.proxy, CorePlayersHandler))

        settings = {
            'debug': True if 'debug' in options and options.debug == 1 else False
        }
      
        tornado.web.Application.__init__(self, handlers, **settings)


def main():
    tornado.options.parse_command_line()
    application = App(options)
    http_server = tornado.httpserver.HTTPServer(application)
    http_server.listen(options.port)
    tornado.ioloop.IOLoop.instance().start()


if __name__ == "__main__":
    main()