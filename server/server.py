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

class AuthHandler(tornado.web.RequestHandler):
    def auth(self):
        if "Session-Key" in self.request.headers:
            key_header = self.request.headers["Session-Key"]
            self.auth_user = db_query.get_user_from_key(key_header)
        else:
            self.auth_user = None
        # print("key:", key_header, "user:", self.user)

    # def get(self, *args, **kwargs):
    #     super().get(args, kwargs)
    #     self._auth()
    
    # def post(self, *args, **kwargs):
    #     super().post(args, kwargs)
    #     self._auth()


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
            key = db_query.register_user(username, password)
            self.write(key)
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

class AddStruggleHandler(AuthHandler):
    def post(self):
        self.auth()
        struggle_name = self.get_body_argument("name")
        struggle_description = self.get_body_argument("description")

        add_strug_res = db_query.add_struggle(self.auth_user, struggle_name, struggle_description)
        self.write({"operation_result": add_strug_res})

class AddStruggleEventHandler(AuthHandler):
    def post(self, struggle_id):
        self.auth()
        strug_event_timestamp = self.get_body_argument("timestamp")
        strug_event_desc = self.get_body_argument("description")
        add_strug_event_res = db_query.add_struggle_event(self.auth_user, struggle_id, strug_event_timestamp, strug_event_desc)
        self.write({"operation_result": add_strug_event_res})

class AuthCheckHandler(AuthHandler):
    def get(self):
        self.auth()
        print(self.auth_user)

class GetStrugglesHandler(AuthHandler):
    def get(self):
        self.auth()
        struggle_list = db_query.get_struggles(self.auth_user)
        if struggle_list is not None:
            struggles_name_desc_dict = {}
            for s in struggle_list:
                struggles_name_desc_dict[s["name"]] = struggles_name_desc_dict[s["description"]]
            
            self.write(struggles_name_desc_dict);
        else:
            self.write("ERR")

def make_app():
    return tornado.web.Application([
        (r"/", MainHandler),
        (r"/users", UsersHandler),
        (r"/register", RegistrationHandler),
        (r"/login", LoginHandler),
        (r"/keys", KeyHandler),
        (r"/keyauth", KeyCheckHandler),
        (r"/authcheck", AuthCheckHandler),
        (r"/struggles", GetStrugglesHandler),
        (r"/struggles/new", AddStruggleHandler),
        (r"/struggles/([0-9]+)/new_event", AddStruggleEventHandler),
    ],
    autoreload=True,
    debug=True
)

if __name__ == "__main__":
    app = make_app()
    app.listen(8000)
    tornado.ioloop.IOLoop.current().start()