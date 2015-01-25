import logging
import signal
import time

from urlparse import urlparse
from collections import defaultdict

from tornado.ioloop import IOLoop
from tornado.options import define, parse_command_line, options
from tornado.web import Application
from tornado.websocket import WebSocketHandler
from tornado.httpserver import HTTPServer


define('debug', default=False, type=bool, help="run in debug mode")
define('port', default=8080, type=int, help="port for the tornado server")
define('allowed_hosts', default="localhost:8080", multiple=True,
	help="allowed hosts for cross domain requests")

class SprintHandler(WebSocketHandler):
	"""handle real time updates to the sprint"""

	def check_origin(self, origin):
		allowed = super(SprintHandler, self).check_origin(origin)
		parsed = urlparse(origin.lower())
		matched = any(parsed.netloc == host for host in options.allowed_hosts)
		return options.debug or allowed or matched

	def open(self, sprint):
		"""subscribe to sprint updates"""
		self.sprint = sprint
		self.application.add_subscriber(self.sprint, self)

	def on_message(self, message):
		self.application.broadcast(message, channel=self.sprint, sender=self)

	def on_close(self):
		"""remove subscription"""
		self.application.remove_subscriber(self.sprint, self)


class ScrumApp(Application):
	def __init__(self, **kw):
		routes = [
			(r'/(?P<sprint>[0-9]+)', SprintHandler)
		]
		super(ScrumApp, self).__init__(routes, **kw)
		self.subscriptions = defaultdict(list)

	def add_subscriber(self, channel, subscriber):
		self.subscriptions[channel].append(subscriber)

	def remove_subscriber(self, channel, subscriber):
		self.subscriptions[channel].remove(subscriber)

	def get_subscribers(self, channel):
		return self.subscriptions[channel]

	def broadcast(self, message, channel=None, sender=None):
		if channel is None:
			for ch in self.subscriptions.keys():
				self.broadcast(message, ch, sender)
		else:
			peers = self.get_subscribers(channel)
			for peer in peers:
				if peer != sender:
					try:
						peer.write_message(message)
					except WebSocketClosedError:
						self.remove_subscriber(channel, peer)


def shutdown(server):
	ioloop = IOLoop.instance()
	logging.info('Stopping server...')
	server.stop()

	def finalize():
		ioloop.stop()
		logging.info('Stopped')

	ioloop.add_timeout(time.time() + 1.5, finalize)


if __name__ == "__main__":
	parse_command_line()

	application = ScrumApp(debug=options.debug)

	server = HTTPServer(application)
	server.listen(options.port)
	signal.signal(signal.SIGINT, lambda sig, frame: shutdown(server))
	logging.info("Starting server on localhost:{}".format(options.port))
	IOLoop.instance().start()
