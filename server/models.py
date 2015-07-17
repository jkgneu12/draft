import datetime
from sqlalchemy import Column, String, ForeignKey, Boolean, Float
from sqlalchemy import Integer
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()


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


class PlayerCore(BaseModel):
    __tablename__ = 'player_core'
    id = Column(Integer, primary_key=True)

    name = Column(String(128))
    position = Column(String(4))
    team_name = Column(String(128))

    min_price = Column(Integer)
    max_price = Column(Integer)
    target_price = Column(Integer)

    rank = Column(Integer)
    position_rank = Column(Integer)
    risk = Column(String(128))
    fire_points = Column(Float)
    fire_factor = Column(Float)


class Draft(BaseModel):
    __tablename__ = 'draft'
    id = Column(Integer, primary_key=True)

    name = Column(String(128))
    round = Column(Integer, default=0)
    rounds = Column(Integer)

    teams = relationship('Team')


class Team(BaseModel):
    __tablename__ = 'team'
    id = Column(Integer, primary_key=True)

    name = Column(String(128))
    money = Column(Integer)
    is_owner = Column(Boolean)
    is_turn = Column(Boolean)
    order = Column(Integer)

    draft_id = Column(Integer, ForeignKey('draft.id'))
    draft = relationship(Draft)

    players = relationship('Player')


class Player(BaseModel):
    __tablename__ = 'player'
    id = Column(Integer, primary_key=True)

    paid_price = Column(Integer)

    core_id = Column(Integer, ForeignKey('player_core.id'))
    core = relationship(PlayerCore)

    draft_id = Column(Integer, ForeignKey('draft.id'))
    draft = relationship(Draft)

    team_id = Column(Integer, ForeignKey('team.id'))
    team = relationship(Team)
