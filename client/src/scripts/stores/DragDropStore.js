var EventEmitter = require('events').EventEmitter;

var assign = require('object-assign');

var PlayerStore = require('./PlayerStore');

var _draggedItem = null;
var _draggedType = null;


var DragDropStore = assign({}, EventEmitter.prototype, {

    getDraggedItem: function() {
        return _draggedItem;
    },
    getDraggedType: function() {
        return _draggedType;
    },
    dragged: function(item, type) {
        _draggedItem = item;
        _draggedType = type;
    },
    dropped: function(item, type) {
        if(type === "teamListItem") {
            var team = item.team;
            var player = this.getDraggedItem().player;

            player.save({team_id: team.get('id'), paid_price: PlayerStore.getValue()}, {
                success: function() {
                    team.fetch();
                }
            });
        }
    }
});

module.exports = DragDropStore;