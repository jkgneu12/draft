import datetime
import math

from sqlalchemy import Column, String, ForeignKey, Boolean, Text
from sqlalchemy import Integer
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

import constants

Base = declarative_base()


class BaseModel(Base):
    __abstract__ = True

    def to_dict(self, deep_fields=[], **kwargs):
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
                            l.append(item.to_dict(deep_fields, **kwargs))
                    ret[key] = l
                else:
                    ret[key] = val.to_dict(deep_fields, **kwargs)
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
    consistency = Column(Integer)

    bye = Column(Integer)

    def to_dict(self, deep_fields=[], available_players=[], draft=None):
        ret = super(PlayerCore, self).to_dict(deep_fields, available_players=available_players, draft=None)
        price = self.target_price if self.target_price else 1
        ret['adj_price'] = self.adjusted_price(available_players)
        ret['adj_points'] = self.adjusted_points()
        ret['adp_round'] = self.adp_round(draft)
        return ret

    def adjusted_points(self):
        base = self.points * .9

        # if self.likes == True:
        #     base *= 1.1

        base -= self.risk * 2
        base -= self.consistency * 3 / 100 if self.consistency else 0

        if self.position == 'QB':
            base /= 5

        if self.position == 'TE':
            base /= 1.5

        # if self.dislikes == True:
        #     base /= 1.2

        return base

    def adjusted_price(self, available_players=[]):
        offset = constants.PRICE_OFFSET
        if self.position == 'RB':
            offset = constants.RB_PRICE_OFFSET;
        # if self.target_price > 10:
        #     for player in available_players:
        #         if player.core.adp > self.adp:
        #             break
        #         if player.core != self and player.core.position == self.position:
        #             offset *= .98

        return max(1, math.floor(self.target_price + (self.target_price * offset)))

    def adp_round(self, draft):
        teams = len(draft.teams) if draft else 12
        return '{}-{}'.format(math.ceil(self.adp / teams) , ((self.adp-1) % teams) + 1)


class Draft(BaseModel):
    __tablename__ = 'draft'
    id = Column(Integer, primary_key=True)

    name = Column(String(128))
    round = Column(Integer, default=0)

    teams = relationship('Team')


class Team(BaseModel):
    __tablename__ = 'team'
    id = Column(Integer, primary_key=True)

    name = Column(String(128))
    money = Column(Integer, default=constants.MAX_BUDGET)
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
    bench = Column(Boolean, default=False)

    core_id = Column(Integer, ForeignKey('player_core.id'))
    core = relationship(PlayerCore, lazy='subquery')

    draft_id = Column(Integer, ForeignKey('draft.id'))
    draft = relationship(Draft)

    team_id = Column(Integer, ForeignKey('team.id'))
    team = relationship(Team)
