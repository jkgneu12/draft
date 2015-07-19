/** @jsx React.DOM */

var React = require('react');

var BlurTextArea = React.createClass({

    getInitialState() {
        return {value: this.props.value};
    },
    componentWillReceiveProps(nextProps) {
        this.setState({value: nextProps.value});
    },
    render() {
        return (
            <textarea type="text" className="form-control typeahead"
                   value={this.state.value || ''}
                   onChange={this.onChange}
                   onBlur={this.onBlur}
                   onFocus={this.onFocus}
                   rows={this.props.rows} />
        );
    },
    onChange(event) {
        this.setState({value: event.target.value});
    },
    onBlur(event) {
        if(this.props.value !== this.state.value) {
            this.props.value = this.state.value;
            this.props.onChange(this.state.value);
        }
    },
    onFocus(event) {
        if(this.props.onFocus)
            this.props.onFocus(this.state.value);
    }

});

module.exports = BlurTextArea;