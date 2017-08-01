var React = require('react');

var DragDropStore = require('../../stores/DragDropStore');

var DragDrop = {

    //Must implement:
    //getType()
    //canDrop(type, item)

    onDrag(ev) {
        ev.dataTransfer.setData("draggedItem", JSON.stringify(this.state));
        DragDropStore.dragged(this.state, this.getType());
        ev.stopPropagation();
    },
    onDragOver(ev) {
        if(this.canDrop(DragDropStore.getDraggedType(), DragDropStore.getDraggedItem())) {
            ev.preventDefault();
            this.setState({canDrop:true});
        }

        ev.stopPropagation();
    },
    onDragLeave(ev) {
        this.setState({canDrop:false});
    },
    onDrop(ev) {
        ev.preventDefault();
        if(this.canDrop(DragDropStore.getDraggedType(), DragDropStore.getDraggedItem())) {
            DragDropStore.dropped(this.state, this.getType());
        }
        this.setState({canDrop:false});
        ev.stopPropagation();
    }
};

module.exports = DragDrop;
