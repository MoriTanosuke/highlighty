import os

# Imports the NDB data modeling API
from google.appengine.ext import ndb

import jinja2
import webapp2

JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__)),
    extensions=['jinja2.ext.autoescape'],
    autoescape=True)

DEFAULT_TITLE = 'a new highlight'

# [START highlight]
class Highlight(ndb.Model):
	"""Contains the code to highlight and the highlight settings."""
	title = ndb.StringProperty(indexed=True)
	content = ndb.StringProperty(indexed=False)
	date = ndb.DateTimeProperty(auto_now_add=True)
	brush = ndb.StringProperty(indexed=True)
# [END highlight]

# [START main_page]
class MainPage(webapp2.RequestHandler):
	def get(self):
		# [START query]
		highlight_query = Highlight.query()
		highlights = highlight_query.fetch(10)
		# [END query]
		
		model = {
			'highlights': highlights
		}

		template = JINJA_ENVIRONMENT.get_template('index.html')
		self.response.write(template.render(model))
# [END main_page]

class Save(webapp2.RequestHandler):
	def post(self):
		highlight = Highlight()
		highlight.title = self.request.get('title', DEFAULT_TITLE)
		highlight.content = self.request.get('content')
		highlight.brush = self.request.get('brush', 'java')
		highlight.put()
		self.redirect('/')

class Show(webapp2.RequestHandler):
	def get(self, search):
		highlight = Highlight.get_by_id(search)
		if highlight == None:
			model = {
				'error': 'No highlight found!',
				'highlight': {
					'title': 'Not found',
					'content': 'Not found',
					'brush': 'java'
				}
			}
		else:
			model = {
				'highlight': highlight
			}
		template = JINJA_ENVIRONMENT.get_template('show.html')
		self.response.write(template.render(model))

application = webapp2.WSGIApplication([
	('/', MainPage),
	('/new', Save),
	('/(\d+)', Show)
], debug=True)

