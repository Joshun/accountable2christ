import tornado.ioloop
import tornado.web
import json
import datetime

import db_query

class MyJSONEncoder(json.JSONEncoder):
      def default(self, obj):
        if isinstance(obj, datetime.datetime):
            return obj.isoformat()

        return json.JSONEncoder.default(self, obj)

class MainHandler(tornado.web.RequestHandler):
    def get(self):
        self.write("This server is for making requests to the Accountable2Christ API")
        self.finish()

class LoginHandler(tornado.web.RequestHandler):
    def post(self):
        username = self.get_body_argument("username", default=None)
        password = self.get_body_argument("password", default=None)
        res = db_query.authenticate_user(username, password)
        if res:
            key = db_query.create_user_key(username)
            self.write(key)
        else:
            self.write("ERR")
        # self.write(str(res))
        self.finish()

class RegistrationHandler(tornado.web.RequestHandler):
    def post(self):
        username = self.get_body_argument("username", default=None)
        password = self.get_body_argument("password", default=None)
        print("Received username =", username, "password =", password)

        if username is not None and password is not None:
            db_query.register_user(username, password)
            self.write("OK")
        else:
            self.write("ERR")
        self.finish()


class UsersHandler(tornado.web.RequestHandler):
    def get(self):
        users = db_query.get_users()
        self.write(json.dumps({"users": users}))

class KeyHandler(tornado.web.RequestHandler):
    def get(self):
        user_keys = db_query.get_user_keys()
        self.write(json.dumps({"keys": user_keys}, cls=MyJSONEncoder))
        self.finish()

class KeyCheckHandler(tornado.web.RequestHandler):
    def get(self):
        key = self.get_query_argument("session_key", default=None)
        username = self.get_query_argument("username", default=None)
        print(key, username)
        user_key = db_query.get_user_key(username, key)
        self.write({"key": user_key})


def make_app():
    return tornado.web.Application([
        (r"/", MainHandler),
        (r"/users", UsersHandler),
        (r"/register", RegistrationHandler),
        (r"/auth", LoginHandler),
        (r"/keys", KeyHandler),
        (r"/keyauth", KeyCheckHandler),
    ],
    autoreload=True,
    debug=True
)

if __name__ == "__main__":
    app = make_app()
    app.listen(8000)
    tornado.ioloop.IOLoop.current().start()