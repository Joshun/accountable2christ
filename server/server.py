import tornado.ioloop
import tornado.web
import json

import db_query


class MainHandler(tornado.web.RequestHandler):
    def get(self):
        self.write("This server is for making requests to the Accountable2Christ API")
        self.finish()

class UsersHandler(tornado.web.RequestHandler):
    def get(self):
        users = db_query.get_users()
        self.write(json.dumps({"users": users}))

def make_app():
    return tornado.web.Application([
        (r"/", MainHandler),
        (r"/users", UsersHandler)
    ],
    autoreload=True,
    debug=True
)

if __name__ == "__main__":
    app = make_app()
    app.listen(8000)
    tornado.ioloop.IOLoop.current().start()