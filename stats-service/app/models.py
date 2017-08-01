import datetime
import math

from sqlalchemy import Column, String, Boolean, Text, Integer
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

PRICE_OFFSET = .1

class BaseModel(Base):
    __abstract__ = True

    def to_dict(self, deep_fields=[]):
        ret = {c.name: getattr(self, c.name) for c in self.__table__.columns}
        for key in ret:
            if isinstance(ret[key], datetime.date):
                ret[key] = ret[key].isoformat() + "Z"
        for key in deep_fields:
            val = getattr(self, key) if hasattr(self, key) else None
            if val is not None:
                if isinstance(val, list):
                    l = []
                    for item in val:
                        if hasattr(item, "to_dict"):
                            l.append(item.to_dict(deep_fields))
                    ret[key] = l
                else:
                    ret[key] = val.to_dict(deep_fields)
        return ret

    def clone(self, data, deep=True):
        ret = type(self)()
        for c in self.__table__.columns:
            if c.name != 'id':
                if c.name in data:
                    setattr(ret, c.name, data[c.name])
                else:
                    setattr(ret, c.name, getattr(self, c.name))
        if deep:
            for key in vars(self):
                val = getattr(self, key) if hasattr(self, key) else None
                if val is not None and isinstance(val, list):
                    l = []
                    for item in val:
                        if hasattr(item, "clone"):
                            l.append(item.clone(True))
                    if len(l) > 0:
                        ret[key] = l
        return ret


class Player(BaseModel):
    __tablename__ = 'player'
    id = Column(Integer, primary_key=True)

    notes = Column(Text)

    name = Column(String(128))
    position = Column(String(4))
    team_name = Column(String(128))

    target_price = Column(Integer)

    rank = Column(Integer)
    adp = Column(Integer)
    tier = Column(Integer)
    position_rank = Column(Integer)
    likes = Column(Boolean)
    dislikes = Column(Boolean)
    dropoff = Column(Integer)
    risk = Column(Integer)
    points = Column(Integer)
    ceil = Column(Integer)
    floor = Column(Integer)
    ecr = Column(Integer)

    bye = Column(Integer)

    def to_dict(self, deep_fields=[]):
        ret = super(PlayerCore, self).to_dict(deep_fields)
        price = self.target_price if self.target_price else 1
        ret['adj_price'] = math.floor(price + (price * PRICE_OFFSET))
        return ret
