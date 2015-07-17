/** @jsx React.DOM */

var React = require('react');

var Input = React.createClass({

    getInitialState: function() {
        return {value: this.props.value};
    },
    componentWillReceiveProps: function(nextProps) {
        this.setState({value: nextProps.value});

    },
    render: function() {
        return (
            <input type={this.props.type || "text"}
                   className="form-control typeahead"
                   value={this.state.value}
                   placeholder={this.props.placeholder}
                   onChange={this.onChange}
                   onKeyUp={this.onKeyUp}/>
        );
    },
    onChange: function(event) {
        this.setState({value: event.target.value});
        this.props.onChange(event.target.value);
    },
    onKeyUp: function(event) {
        if(event.which === 13) {//enter
            this.props.onEnter();
        }
    }

});

module.exports = Input;
