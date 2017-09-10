import sqlalchemy
from sqlalchemy import Column, ForeignKey, Integer, String, DateTime, create_engine
from sqlalchemy.orm import relationship, sessionmaker
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

engine = create_engine('sqlite:///:memory:', echo=True)

class UserKey(Base):
    __tablename__ = "user_keys"
    id = Column(Integer, primary_key=True)
    key = Column(String(45))
    expiry = Column(DateTime)
    users_id = Column(ForeignKey("users.id"))

    user = relationship("User", back_populates="user_keys")



class StruggleEvent(Base):
    __tablename__ = "struggle_events"
    id = Column(Integer, primary_key=True)
    timestamp = Column(DateTime)
    description = Column(String(45))
    struggles_id = Column(ForeignKey("struggles.id"))

    struggle = relationship("Struggle", back_populates="struggle_events")

class Struggle(Base):
    __tablename__ = "struggles"
    id = Column(Integer, primary_key=True)
    name = Column(String(45))
    description = Column(String(45))
    users_id = Column(ForeignKey("users.id"))

    user = relationship("User", back_populates="struggles")
    struggle_events = relationship("StruggleEvent", back_populates="struggle")

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String(45))
    bcrypt_password = Column(String(45))

    struggles = relationship("Struggle", back_populates="user")
    user_keys = relationship("UserKey", back_populates="user")


Base.metadata.create_all(engine)

Session = sessionmaker(bind=engine)
session = Session()
user1 = User(username="User1", bcrypt_password="changeme")

struggle = Struggle()

user1.struggles.append(struggle)
# struggle.user = user1

session.add(user1)
session.add(struggle)
session.commit()
