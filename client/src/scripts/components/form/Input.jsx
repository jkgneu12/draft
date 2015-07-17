/** @jsx React.DOM */

var React = require('react');

var $ = require('jquery');
var typeahead = require('typeahead.js');

var Input = React.createClass({

    getInitialState() {
        return {value: this.props.value};
    },
    componentDidMount() {
        $(this.getDOMNode()).
            bind('typeahead:selected', this.typeaheadSelected).
            bind('typeahead:autocompleted', this.typeaheadCompleted);

        $(this.getDOMNode()).typeahead({
                hint: true,
                highlight: true,
                minLength: 1
            },
            {
                name: 'autocompletes',
                displayKey: this.getAutocompleteDisplay,
                source: this.substringMatcher,
                limit: 20
            }
        );
    },
    componentWillUnmount() {
        $(this.getDOMNode()).typeahead('destroy');
    },
    componentWillReceiveProps(nextProps) {
        this.setState({value: nextProps.value});

    },
    render() {
        return (
            <input type={this.props.type || "text"}
                   className="form-control typeahead"
                   value={this.state.value}
                   placeholder={this.props.placeholder}
                   onChange={this.onChange}
                   onKeyUp={this.onKeyUp}/>
        );
    },
    onChange(event) {
        this.setState({value: event.target.value});
        this.props.onChange(event.target.value);
    },
    onKeyUp(event) {
        if(event.which === 13 && this.props.onEnter) {//enter
            this.props.onEnter();
        }
    },
    substringMatcher(q, cb) {
        var self = this;
        var matches, substrRegex;

        // an array that will be populated with substring matches
        matches = [];

        // regex used to determine if a string contains the substring `q`
        substrRegex = new RegExp(q, 'i');

        if(self.props.autocompletes) {
            // iterate through the pool of strings and for any string that
            // contains the substring `q`, add it to the `matches` array
            self.props.autocompletes.forEach(function(obj) {
                if (substrRegex.test(obj.get(self.props.autocompleteKey))) {
                    // the typeahead jQuery plugin expects suggestions to a
                    // JavaScript object, refer to typeahead docs for more info
                    matches.push(obj);
                }
            });
        }

        cb(matches);
    },
    getAutocompleteDisplay(obj) {
        return obj.get(this.props.autocompleteKey);
    },
    typeaheadSelected(event, suggestion, dataset) {
        this.props.onChange(suggestion.get(this.props.autocompleteKey));
        this.props.onSelected(suggestion);
    },
    typeaheadCompleted(event, suggestion, dataset) {
        this.props.onChange(suggestion.get(this.props.autocompleteKey));
    }
});

module.exports = Input;
