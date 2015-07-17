/** @jsx React.DOM */

'use strict';

var React = require('react');

var DummyStore = require('../../stores/DummyStore');
var NavStore = require('../../stores/NavStore');

var DummysPage = React.createClass({
    displayName: 'DummysPage',
    getInitialState() {
        return {
            dummys: DummyStore.getAll()
        };
    },

    componentDidMount() {
        DummyStore.addChangeAllListener(this.onDummysChange);
    },
    componentWillUnmount() {
        DummyStore.removeChangeListener(this.onDummysChange);
    },

    onDummysChange() {
        this.setState({
            dummys: DummyStore.getAll()
        });
    },

    gotoDummy(id) {
        NavStore.emitNavigate('dummy', {dummyId: id});
    },

    render() {
        var self = this;
        var dummys = this.state.dummys.map(function(dummy){
            var navigate = function() {
                self.gotoDummy(dummy.get('id'));
            };
            return <div key={dummy.get('id')}><a onClick={navigate}>{dummy.get('name')}</a></div>;
        });

        return (
            <div className="fill-height">
                {dummys}
            </div>
        );
    }

});

module.exports = DummysPage;
