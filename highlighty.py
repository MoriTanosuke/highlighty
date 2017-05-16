import os
import json
import json
import logging

from google.appengine.api import urlfetch
# Imports the NDB data modeling API
from google.appengine.ext import ndb

import jinja2
import webapp2

JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__)),
    extensions=['jinja2.ext.autoescape'],
    autoescape=True)
BRUSHES = map(lambda s: s.lower(), ["AppleScript", "AS3", "Bash", "ColdFusion", "Cpp", "CSharp", "Css", "Delphi", "Diff", "Erlang", "Groovy", "JavaFX", "Java", "JScript", "Perl", "Php", "Plain", "PowerShell", "Python", "Ruby", "Sass", "Scala", "Sql", "Vb", "Xml", "Html"])
JINJA_ENVIRONMENT.globals['brushes'] = BRUSHES


# [START highlight]
class Highlight(ndb.Model):
    """Contains the code to highlight and the highlight settings."""
    title = ndb.StringProperty(indexed=True, required=True)
    content = ndb.StringProperty(indexed=False, required=True)
    date = ndb.DateTimeProperty(auto_now_add=True, required=True)
    brush = ndb.StringProperty(indexed=True, required=True, choices=set(BRUSHES))
# [END highlight]


# [START main_page]
class MainPage(webapp2.RequestHandler):
    def get(self):
        highlights = get_highlights(10)

        model = {
            'highlights': highlights,
            'recaptcha_public_key': os.getenv('RECAPTCHA_PUBLIC_KEY', ''),
        }

        template = JINJA_ENVIRONMENT.get_template('index.html')
        self.response.write(template.render(model))
# [END main_page]


# [START save]
class Save(webapp2.RequestHandler):
    def post(self):
        title = self.request.get('title')
        content = self.request.get('content')
        brush = self.request.get('brush')
        captcha_response = self.request.get('g-recaptcha-response')
        # verify captcha
        verify_url = 'https://www.google.com/recaptcha/api/siteverify?secret=' + os.getenv('RECAPTCHA_SECRET_KEY', '') + '&response=' + captcha_response
        response = urlfetch.fetch(verify_url)
        # parse JSON response
        data = json.loads(response.content)
        # break if response.success != True
        if response.status_code == 200 and data['success'] == True:
            if not title:
                title = 'No title set'
            highlight = Highlight()
            highlight.title = title
            highlight.content = content
            highlight.brush = brush
            highlight.put()
            self.redirect('/')
        else:
            # TODO redirect to / with model to remove duplication
            highlights = get_highlights(10)
            model = {
                'highlights': highlights,
                'content': content,
                'title': title,
                'brush': brush,
                'recaptcha_public_key': os.getenv('RECAPTCHA_PUBLIC_KEY', ''),
                'error': 'Captcha failed: ' + ", ".join(map(get_error_message, data['error-codes'])),
            }
            template = JINJA_ENVIRONMENT.get_template('index.html')
            self.response.write(template.render(model))
# [END save]


# [START show]
class Show(webapp2.RequestHandler):
    def get(self, search):
        k = ndb.Key(urlsafe=search)
        highlight = k.get()
        if highlight == None:
            error = 'No highlight found!'
            highlight = {
                'title': 'Not found',
                'content': 'Not found',
                'brush': 'java'
            }
        else:
            error = None

        model = {
            'error': error,
            'highlight': highlight
        }
        template = JINJA_ENVIRONMENT.get_template('show.html')
        self.response.write(template.render(model))
# [END show]


###
def get_highlights(count):
    highlight_query = Highlight.query()
    highlights = highlight_query.fetch(count)
    return highlights


def get_error_message(code):
    if code == 'missing-input-response':
        return 'Missing input. Did you answer the captcha?'
    elif code == 'invalid-input-secret':
        return 'Wrong captcha response! Are you really a human?'
    else:
        return 'Unknown error: ' + code
###

application = webapp2.WSGIApplication([
    ('/', MainPage),
    ('/new', Save),
    ('/show/([A-Za-z0-9\-]+)', Show)
], debug=True)

