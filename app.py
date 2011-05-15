# -*- coding: utf-8 -*-

import tornado.ioloop
import tornado.web
from tornado.template import escape
import pymongo
from datetime import datetime
import logging
import os
from optparse import OptionParser
import pusher
import config

pusher.app_id = config.PUSHER_APP_ID
pusher.key = config.PUSHER_KEY
pusher.secret = config.PUSHER_SECRET

# Handler.
class AppHandler(tornado.web.RequestHandler):
    def initialize(self):
        self.mongo = pymongo.Connection()
        self.db = self.mongo.pushercast
        
    def get(self):
        messages = self.db.messages.find().sort([ ('created_at', -1) ]).limit(10)
        self.render('templates/index.html', messages=messages, appKey=config.PUSHER_KEY)
        
    def _postCallback(self, response):
        if self.request.connection.stream.closed():
            return
            
        if response.error:
            self.write('Pusher error: %d' % (response.code, ))
        else:
            self.write('OK')
        self.finish()
        
    @tornado.web.asynchronous
    def post(self):
        message = {
            'author': self.get_argument('author'),
            'content': self.get_argument('content'),
            'created_at': datetime.now()
        }
        self.db.messages.save(message)
        
        pusher.channel_type = pusher.TornadoChannel
        p = pusher.Pusher()
        pusherMessage = {
            'author': escape.xhtml_escape(message['author']),
            'content': escape.xhtml_escape(message['content']),
            'created_at': message['created_at'].strftime('%a, %d %b %Y %H:%M:%S')
        }
        p['PusherCast'].trigger('message', pusherMessage, callback=self._postCallback)

application = None

settings = {
    'static_path': os.path.join(os.path.dirname(__file__), 'static')
}

routes = [
    (r'/', AppHandler)
]

if __name__ in ('main', '__main__'):
    parser = OptionParser()
    parser.add_option('-p', '--port', dest="port", help="port to bind to. Defaults to 8888.", action="store", type="int", default=8888)
    parser.add_option('-d', '--debug', dest="debug", help="debugging", action="store_true", default=False)
    options, args = parser.parse_args()
    
    settings['debug'] = options.debug
    
    logging.info('PusherCast backend starting at port %d', options.port)
    
    application = tornado.web.Application(routes, **settings)
    application.listen(options.port)
    tornado.ioloop.IOLoop.instance().start()