/** @jsx React.DOM */

var React = require('react');

var Checkbox = React.createClass({

    getInitialState: function() {
        return {
            checked: this.props.checked,
            indeterminate: this.props.indeterminate
        };
    },
    componentDidMount: function() {
        this.getDOMNode().indeterminate = this.state.indeterminate && this.state.checked;
    },
    componentWillReceiveProps: function(nextProps) {
        this.setState({
            checked: nextProps.checked,
            indeterminate: nextProps.indeterminate
        });
        this.getDOMNode().indeterminate = nextProps.indeterminate;
    },
    render: function() {
        return (
            <input type="checkbox" checked={this.state.checked} onChange={this.onChange} />
        );
    },
    onChange: function(event) {
        var checked = event.target.checked;
        this.getDOMNode().indeterminate = this.state.indeterminate && checked;
        this.props.onChange(checked, this.props.value);
        this.setState({checked: checked});
    }
});

module.exports = Checkbox;
