'use strict';

var React = require('react');
var DRAGINFO_PREFIX = "draginfo";

var ComponentList = React.createClass({
    getInitialState: function() {
        return {
            graph: this.props.graph
        }
    },
    componentDidMount: function() {
        this.initToolBox();
    },
    createNodeImage: function(parent, src, title, info) {
        var img = document.createElement("img");
        img.src = src;
        img.setAttribute('draggable', 'true');
        img.setAttribute('title', title);
        info = info || {};
        if (!info.image && (!info.type || info.type == "Node")) {
            info.image = src;
        }
        info.label = info.label || title;
        info.title = title;
        img.setAttribute(DRAGINFO_PREFIX, JSON.stringify(info));
        parent.appendChild(img);
        return img;
    },
    createEdgeImage: function(parent, src, title, info, selectType, lineType) {
        var img = document.createElement("img");
        img.src = src;
        img.setAttribute('title', title);
        img.setAttribute('selectType', selectType);
        img.setAttribute('lineType', lineType);
        info = info || {};
        if (!info.image && (!info.type || info.type == "Edge")) {
            info.image = src;
        }
        info.label = info.label || title;
        info.title = title;
        img.setAttribute(DRAGINFO_PREFIX, JSON.stringify(info));
        img.onclick = this.onClick;
        parent.appendChild(img);
        return img;
    },
    initToolBox: function() {
        this.initTaskList();
        this.initTaskGroupList();
        this.initGatewayList();
        this.initConnectorList();
        
    },
    initTaskList: function() {
        var obj = document.getElementById('task');
        this.createNodeImage(obj, "images/executescript.png", "Mac", {type: "Node", label: "Mac", image: "Q.Graphs.node"});
        this.createNodeImage(obj, "images/executescript.png", "Exchanger", {type: "Node", label: "Exchanger", image: "Q.Graphs.exchanger2"});
        this.createNodeImage(obj, "images/executescript.png", "Server", {type: "Node", label: "Server", image: "Q.Graphs.server"});
        this.createNodeImage(obj, "images/executescript.png", "Text", {type: "Text", label: "Text"});
    },
    initConnectorList: function() {
        var obj = document.getElementById('connector');
        this.createEdgeImage(obj, "images/default.png", "Default", {type: "Edge", label: "text"}, 'default', 'default');
        this.createEdgeImage(obj, "images/selection.png", "Selection", {type: "Edge", label: "text"}, 'selection', 'selection');
        this.createEdgeImage(obj, "images/linearrow.png", "Arrow", {type: "Edge", label: "Text"}, 'edge', 'arrow');
        this.createEdgeImage(obj, "images/linetype1.png", "Line1", {type: "Edge", label: "Text"}, 'edge', 'line1');
        this.createEdgeImage(obj, "images/linetype2.png", "Line2", {type: "Edge", label: "Text"}, 'edge', 'line2');
    },
    initTaskGroupList: function() {
        var obj = document.getElementById('taskgroup');
        this.createNodeImage(obj, "images/group_icon.png", "Group", {type: "Group", label: "Group"});
        this.createNodeImage(obj, "images/subnetwork_icon.png", "SubNetwork", {image: "Q-subnetwork", label: "SubNetwork", properties: {enableSubNetwork: true}}).style.width = '24px';
    },
    initGatewayList: function() {
        var obj = document.getElementById('gateway');
        this.createNodeImage(obj, "images/diamond.png", "And", {type: "Node", label: "And"});
    },
    onClick: function(event) {
        this.props.onEdgeClick(event);
    },
    render: function() {
        var clientWidth = {
            width: '200px',
            height: '600px'
        }
        return (
            <div style={clientWidth} id="toolbox">
                <div id="taskgroup"/>
                <div id="task"/>
                <div id="connector"/>
                <div id="gateway"/>
            </div>
        );
    }
});

module.exports = ComponentList;