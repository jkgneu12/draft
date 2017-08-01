import json
from tornado import gen
from tornado.httpclient import AsyncHTTPClient, HTTPRequest
from tornado.web import HTTPError

import logging
logger = logging.getLogger(__name__)

class Service:

    def __init__(self, name, service_uri):
        self.name = name
        self.service_uri = service_uri

        self.http_client = AsyncHTTPClient()

    @gen.coroutine
    def get(self, path, **kwargs):
        resp = yield self._send('GET', path, **kwargs)
        return self._parse_response(resp)

    @gen.coroutine
    def put(self, path, **kwargs):
        resp = yield self._send('PUT', path, **kwargs)
        return self._parse_response(resp)

    @gen.coroutine
    def post(self, path, **kwargs):
        resp = yield self._send('POST', path, **kwargs)
        return self._parse_response(resp)

    @gen.coroutine
    def delete(self, path, **kwargs):
        (yield self._send('DELETE', path, **kwargs))

    @gen.coroutine
    def _send(self, verb, path, **kwargs):
        logger.debug('Making {} "{}" request to {} service'.format(verb, path, self.name))
        kwargs['body'] = json.dumps(kwargs['body']) if 'body' in kwargs else None
        request = HTTPRequest(self.service_uri + path, method=verb, **kwargs)
        response = yield self.http_client.fetch(request, raise_error=False)
        if response.code not in [200, 204]:
            logger.info('{} response from {} service'.format(response.code, self.name))
            raise HTTPError(response.code)
        return response

    def _parse_response(self, response):
        return json.loads(response.body.decode())
