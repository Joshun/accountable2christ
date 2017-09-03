import db_schema
from db_schema import User
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm.state import InstanceState
from copy import copy

Session = sessionmaker(bind=db_schema.engine)

def sanitise_dict(d):
    if not isinstance(d, dict):
        return d
    
    dellist = []
    for k in d:
        if isinstance(d[k], dict):
            d[k] = sanitise_dict(d)
        else:
            if isinstance(d[k], InstanceState):
                dellist.append(k)
    for k in dellist:
        del d[k]
    return d

def get_users():
    session = Session()
    users = session.query(User).all()

    # users_list = [sanitise_dict(copy(user.__dict__)) for user in users]
    users_list = []

    for user in users:
        user_struggles = []
        for struggle in user.struggles:
            user_struggles.append(sanitise_dict(copy(struggle.__dict__)))
        user_dict = copy(sanitise_dict(user.__dict__))        
        user_dict["struggles"] = user_struggles
        users_list.append(user_dict)


    return users_list