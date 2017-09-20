import db_schema
from db_schema import User, UserKey, Struggle, StruggleEvent
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm.state import InstanceState
from copy import copy
import bcrypt
import os
import binascii
import arrow

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

def register_user(username, password):
    session = Session()
    user = User(username=username, bcrypt_password=bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8"))
    print(user.bcrypt_password)
    session.add(user)
    session.commit()

    return create_user_key(username)

def user_exists(user):
    session = Session()
    user = session.query(User).filter(User.username == user).first()
    return user is not None

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

def get_struggles(username):
    print("username:", username)
    session = Session()
    user = session.query(User).filter(User.username == username).first()
    print("user:", user)
    if user is not None:
        struggles = user.struggles
        struggle_list = []
        for s in struggles:
            struggle_events_list = []
            for e in s.struggle_events:
                struggle_events_list.append(sanitise_dict(e.__dict__))
            
            struggle_dict = sanitise_dict(s.__dict__)
            struggle_dict["events"] = struggle_events_list
            struggle_list.append(struggle_dict)
        return struggle_list

    else:
        return None


def authenticate_user(username, password):
    session = Session()
    user = session.query(User).filter(User.username == username).first()

    if user is None or user.bcrypt_password is None:
        return False
    else:
        return bcrypt.hashpw(password.encode("utf-8"), user.bcrypt_password.encode("utf-8")) == user.bcrypt_password.encode("utf-8")

def create_user_key(username):
    session = Session()
    user = session.query(User).filter(User.username == username).first()

    if user is None:
        return None

    else:
        key = binascii.hexlify(os.urandom(24)).decode("utf-8")
        expiry = arrow.utcnow().replace(days=40).datetime
        user_key = UserKey(key=key, expiry=expiry, user=user)
        session.add(user_key)
        # user.user_keys.append(user_key)
        session.commit()

        return key


def get_user_keys():
    session = Session()
    users = session.query(User).all()

    users_list = []
    for user in users:
        user_keys = []
        for key in user.user_keys:
            user_keys.append(sanitise_dict(copy(key.__dict__)))
        user_dict = sanitise_dict(copy(user.__dict__))
        user_dict["user_keys"] = user_keys
        
        users_list.append(user_dict)
    print(users_list)
    return users_list

def get_user_from_key(key):
    session = Session()
    db_key = session.query(UserKey).filter(UserKey.key == key).first()
    if db_key is not None and db_key.user is not None:
        db_user = db_key.user
        return db_user.username
    else:
        return None


def get_user_key(username, key):
    session = Session()
    # user = session.query(User).filter((User.username == username) & (User.user_keys.contains(key) )).first()
    # key = session.query(UserKey).filter((UserKey.user.username == username) & (UserKey.key == key)).first()
    key = session.query(UserKey).join(User).filter((User.username == username) & (UserKey.key == key)).first()
    return key.key if key is not None else None

def add_struggle(username, struggle_name, struggle_description):
    session = Session()
    struggle_user = session.query(User).filter(User.username == username).first()

    if struggle_user is None:
        return "err_invalid_user"
    else:
        struggle = Struggle(name=struggle_name, description=struggle_description, user=struggle_user)
        session.add(struggle)
        session.commit()
        return "ok"

# def add_struggle_event(username, struggle_id, timestamp, description):
def add_struggle_event(username, struggle_id, timestamp):
    session = Session()

    user = session.query(User).filter(User.username == username).first()
    if user is None:
        return "err_invalid_user"

    struggle = session.query(Struggle).filter(
        (Struggle.id == struggle_id)
        & (Struggle.user == user)).first()

    if struggle is None:
        return "err_invalid_struggle"

    formatted_ts = arrow.get(timestamp).datetime
    # struggle_event = StruggleEvent(timestamp=formatted_ts, description=description, struggle=struggle)
    struggle_event = StruggleEvent(timestamp=formatted_ts, struggle=struggle)

    session.add(struggle_event)
    session.commit()

def remove_struggle(username, struggle_name):
    session = Session()
    # res = session.query(Struggle).join(Struggle.user).filter((Struggle.user.username == username) & (Struggle.name == struggle_name)).first()
    user = session.query(User).filter(User.username == username).first()
    if user is not None:
        struggle = session.query(Struggle).filter((Struggle.user == user ) & (Struggle.name == struggle_name)).first()

        if struggle is not None:
            session.delete(struggle)
            session.commit()