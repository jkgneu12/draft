/** @jsx React.DOM */

var React = require('react');
var ReactDOM = require('react-dom');

var $ = require('jquery');

var Checkbox = React.createClass({

    getInitialState: function() {
        return {
            checked: this.props.checked,
            indeterminate: this.props.indeterminate
        };
    },
    componentDidMount: function() {
        ReactDOM.findDOMNode(this).indeterminate = this.state.indeterminate && this.state.checked;
    },
    componentWillReceiveProps: function(nextProps) {
        this.setState({
            checked: nextProps.checked,
            indeterminate: nextProps.indeterminate
        });
        ReactDOM.findDOMNode(this).indeterminate = nextProps.indeterminate;
    },
    render: function() {
        return (
            <input type="checkbox" checked={this.state.checked} onChange={this.onChange} />
        );
    },
    onChange: function(event) {
        var checked = event.target.checked;
        $(ReactDOM.findDOMNode()).indeterminate = this.state.indeterminate && checked;
        this.props.onChange(checked, this.props.value);
        this.setState({checked: checked});
    }
});

module.exports = Checkbox;
