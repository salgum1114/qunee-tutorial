'use strict';

var React = require('react');
var ReactDom = require('react-dom');

var ComponentList = React.createClass({
    getInitialState: function() {
        return {
            graph: null
        }
    },
    componentDidMount: function() {
    },
    render: function() {
        var clientWidth = {
            width: '500px',
            height: '600px',
        }

        return (
            <div style={clientWidth} id="property"/>
        );
    }
});

module.exports = ComponentList;