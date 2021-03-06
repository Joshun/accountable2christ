import tornado.ioloop
import tornado.web
from tornado import gen
import json
import datetime

import db_query

# class MyJSONEncoder(json.JSONEncoder):
#     def default(self, obj):
#         if isinstance(obj, datetime.datetime):
#             return obj.isoformat()

        # return json.JSONEncoder.default(self, obj)

class MyJSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, datetime.datetime):
            return o.isoformat()
        elif isinstance(o, datetime.date):
            return str(o)

        return json.JSONEncoder.default(self, o)


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
    @gen.coroutine    
    def get(self):
        self.write("This server is for making requests to the Accountable2Christ API")
        self.finish()

class LoginHandler(tornado.web.RequestHandler):
    @gen.coroutine    
    def post(self):
        username = self.get_body_argument("username", default=None)
        password = self.get_body_argument("password", default=None)
        res = db_query.authenticate_user(username, password)
        if res:
            key = db_query.create_user_key(username)
            self.write({"user": username, "key": key, "result": "success"})
        else:
            self.write({"result": "failure"})
        # self.write(str(res))
        self.finish()

class RegistrationHandler(tornado.web.RequestHandler):
    @gen.coroutine    
    def post(self):
        username = self.get_body_argument("username", default=None)
        password = self.get_body_argument("password", default=None)
        print("Received username =", username, "password =", password)

        if username is not None and password is not None and not db_query.user_exists(username):
            key = db_query.register_user(username, password)
            self.write({"user": username, "key": key, "result": "success"})
        else:
            self.write({"result": "failure"})
        self.finish()


class UsersHandler(tornado.web.RequestHandler):
    @gen.coroutine    
    def get(self):
        users = db_query.get_users()
        self.write(json.dumps({"users": users}))

class KeyHandler(tornado.web.RequestHandler):
    @gen.coroutine    
    def get(self):
        user_keys = db_query.get_user_keys()
        self.write(json.dumps({"keys": user_keys}, cls=MyJSONEncoder))
        self.finish()

class KeyCheckHandler(tornado.web.RequestHandler):
    @gen.coroutine    
    def get(self):
        key = self.get_query_argument("session_key", default=None)
        username = self.get_query_argument("username", default=None)
        print(key, username)
        user_key = db_query.get_user_key(username, key)
        self.write({"key": user_key})

class AddStruggleHandler(AuthHandler):
    @gen.coroutine    
    def post(self):
        self.auth()
        struggle_name = self.get_body_argument("name")
        struggle_description = self.get_body_argument("description")
        if struggle_name is None:
            add_strug_res = "failed"
        else:
            add_strug_res = db_query.add_struggle(self.auth_user, struggle_name, struggle_description)
        self.write({"operation_result": add_strug_res})

class AddStruggleEventHandler(AuthHandler):
    @gen.coroutine    
    def post(self, struggle_name):
        self.auth()
        strug_event_timestamp = self.get_body_argument("timestamp")
        # strug_event_desc = self.get_body_argument("description")
        add_strug_event_res = db_query.add_struggle_event(self.auth_user, struggle_name, strug_event_timestamp)
        self.write({"operation_result": add_strug_event_res})

class AuthCheckHandler(AuthHandler):
    @gen.coroutine    
    def get(self):
        self.auth()
        # print(self.auth_user)
        if "Session-Key" in self.request.headers and self.auth_user is not None:
            key_header = self.request.headers["Session-Key"]
            self.write({"user": self.auth_user, "key": key_header, "result": "success"})
        else:
            self.write({"result": "failure"})

class ManageStruggleHandler(AuthHandler):
    @gen.coroutine    
    def delete(self, struggle_name):
        self.auth()
        db_query.remove_struggle(self.auth_user, struggle_name)

class GetStrugglesHandler(AuthHandler):
    @gen.coroutine    
    def get(self):
        self.auth()
        struggle_list = db_query.get_struggles(self.auth_user)
        if struggle_list is not None:
            struggles_name_desc_dict = {}
            for s in struggle_list:
                struggles_name_desc_dict[s["name"]] = s["description"]

            json_dict = { "result": "successful", "struggles": struggles_name_desc_dict }
            
            # self.write(struggles_name_desc_dict);
        else:
            json_dict = {"result": "failure"}
            # self.write("ERR")
        
        self.write(json_dict)

class AddAccountabilityPartnerHandler(AuthHandler):
    @gen.coroutine
    def post(self):
        self.auth()
        if self.auth_user is None:
            self.write({"result": "failure"})
        accountability_partner = self.get_body_argument("accountability_partner_username", default=None)
        if accountability_partner is None:
            self.write({"result": "failure"})
        else:
            res = db_query.add_accountability_partner(self.auth_user, accountability_partner)

            self.write({"result": res})


class GetAccountabilityPartnersHandler(AuthHandler):
    @gen.coroutine    
    def get(self):
        self.auth()
        res = db_query.get_accountability_partners(self.auth_user)
        if res is not None:
            self.write(res)
        else:
            self.write({"result": "failure"})
    
        self.finish()

class ViewAccountabilityPartnerHandler(AuthHandler):
    @gen.coroutine    
    def get(self):
        self.auth()
        acc_partner_username = self.get_query_argument("accountability_partner", default=None)
        # acc_partner_relation = self.get_query_argument("partner_relation", default=None)
        print("acc_partner!!", acc_partner_username)
        # print("partner_relation!!", acc_partner_relation)
        # if acc_partner_username is None or acc_partner_relation is None:
        self.content_type = 'application/json'
        self.set_header("Content-Type", "application/json")


        if acc_partner_username is None:
            self.write({"result": "failure"})
        else:
            res = db_query.get_accountability_partner_data(self.auth_user, acc_partner_username)
            if res is None:
                self.write({"result": "failure"})
            else:
                # self.write(json.dumps({"result": res}, cls=MyJSONEncoder))
                # print(type(res))
                json_dict = {"result": "successful", "partner_data": res}
                self.write(json.dumps(json_dict, cls=MyJSONEncoder))
        self.finish()

class ConfirmAccountabilityPartnerHandler(AuthHandler):
    @gen.coroutine    
    def post(self):
        self.auth()

        accountability_partner = self.get_body_argument("accountability_partner", default=None)
        print("accountability_partner:", accountability_partner)
        if accountability_partner is None:
            self.write("ERR")
        else:
            res = db_query.confirm_partner(accountability_partner, self.auth_user)
            self.write({"result": res})
        
        self.finish()

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
        (r"/struggles/([0-9a-zA-Z]+)", ManageStruggleHandler),
        (r"/struggles/([0-9a-zA-Z]+)/new_event", AddStruggleEventHandler),
        (r"/partners/new", AddAccountabilityPartnerHandler),
        (r"/partners/confirm", ConfirmAccountabilityPartnerHandler),
        (r"/partners", GetAccountabilityPartnersHandler),
        (r"/partners/view", ViewAccountabilityPartnerHandler),
    ],
    autoreload=True,
    debug=True
)

if __name__ == "__main__":
    app = make_app()
    app.listen(8000)
    tornado.ioloop.IOLoop.current().start()