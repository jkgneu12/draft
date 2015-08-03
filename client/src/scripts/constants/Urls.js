'use strict';

var BASE_URL = 'http://127.0.0.1:9000';

var Urls = {
    drafts: '/drafts',
    players: '/drafts/:draftId/players',
    teams: '/drafts/:draftId/teams',
    roster: '/draftroster',
    player_cores: '/players'
};

Object.keys(Urls).forEach(function(key){Urls[key] = BASE_URL + Urls[key]; });

module.exports = Urls;
