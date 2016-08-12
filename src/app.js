'use strict';

var React = require('react');
var ReactDom = require('react-dom');
var ComponentList = require('./component/componentlist');
var Property = require('./component/property')
var QuneeModule = require('./component/quneeModule');

function formatNumber(number, decimal, unit){
    return number.toFixed(decimal);
}

var Main = React.createClass({
    getInitialState: function() {
        return {
            graph: null,
            nodes: [],
            groups: [],
            taskIndex: 1,
            groupIndex: 1
        }
    },
    componentDidMount: function() {
        var canvasDiv = 'canvas';
        var graph = new Q.Graph('canvas');
        this.setState({graph: graph});
        graph.callLater(function(){
            graph.editable = true;
        }, this);
        graph.ondblclick = function(evt){
            var element = evt.getData();
            if(element){
                element.showDetail = !element.showDetail;
            }
        }
        var addTask = this.addTask;
        $("#toolbox div img").draggable({helper: "clone"});
        $('#' + canvasDiv).droppable({
            accept: 'img',
            drop: function(event, ui) {
                
                addTask(graph, canvasDiv, event);
            }
        });
        setInterval(this.timer, 2000);
        this.handleNodeClick(graph);
    },
    handleEdgeClick: function(event) {
        var graph = this.state.graph;
        var target = event.target;
        var selectType = target.getAttribute('selectType');
        var lineType = target.getAttribute('lineType');

        if(selectType === 'edge') {
            graph.interactionMode = Q.Consts.INTERACTION_MODE_CREATE_EDGE;
            if(lineType === 'arrow') {
                this.addConnector(graph, lineType);
            } else if(lineType === 'line1') {
                this.addConnector(graph, lineType);
            } else if(lineType === 'line2') {
                this.addConnector(graph, lineType);
            }
        } else if(selectType === 'default') {
            graph.interactionMode = Q.Consts.INTERACTION_MODE_DEFAULT;
        } else if(selectType === 'selection') {
            graph.interactionMode = Q.Consts.INTERACTION_MODE_SELECTION;
        }
    },
    handleNodeClick: function(graph) {
        var setSelectionStyle = function (element) {
            if (!(element instanceof Q.Node)) {
                return;
            }
            var property = document.getElementById('property');
            var selected = graph.isSelected(element);
            if (selected) {
                property.style.display = 'block';
                element.setStyle(Q.Styles.RENDER_COLOR, "#2898E0");
                element.setStyle(Q.Styles.PADDING, 5);
                element.setStyle(Q.Styles.BORDER, 1);
            } else {
                property.style.display = 'none';
                element.setStyle(Q.Styles.RENDER_COLOR, null);
                element.setStyle(Q.Styles.PADDING, 0);
                element.setStyle(Q.Styles.BORDER, 0);
            }
        }
        graph.selectionChangeDispatcher.addListener(function (evt) {
            var data = evt.data;
            
            if (!data) {
                return;
            }
            if (Q.isArray(data)) {
                for (var i = 0, l = data.length; i < l; i++) {
                    setSelectionStyle(data[i]);
                }
            } else {
                setSelectionStyle(data);
            }
        }, this);
    },
    addConnector: function(graph, lineType) {
        graph.graphModel.listChangeDispatcher.addListener({
            onEvent: function(evt) {
                if(evt.kind === 'add' && (Q.Consts.INTERACTION_MODE_CREATE_EDGE === graph.interactionMode)) {
                    var edge = evt.data;
                    if(lineType === 'arrow') {
                        edge.setStyle(Q.Styles.ARROW_TO, true);
                        edge.setStyle(Q.Styles.EDGE_LINE_DASH, false);
                    } else if(lineType === 'line1'){
                        edge.setStyle(Q.Styles.ARROW_TO, false);
                        edge.setStyle(Q.Styles.EDGE_LINE_DASH, false);
                    } else if(lineType === 'line2') {
                        edge.setStyle(Q.Styles.ARROW_TO, false);
                        edge.setStyle(Q.Styles.EDGE_LINE_DASH, [5, 3]);
                    }
                }
            }
        });
    },
    addTaskGroup: function(graph, canvasDiv, event) {
        var canvasDiv = $("#" + canvasDiv);
        var positionX = parseInt((event.pageX - canvasDiv.offset().left - graph.tx) / graph.scale);
	    var positionY = parseInt((event.pageY - canvasDiv.offset().top  - graph.ty) / graph.scale);
        
        var taskGroup = new QuneeModule.TaskGroup(this.testGroupInfo(positionX, positionY));
        var model = graph.graphModel.add(taskGroup);
        var groups = this.state.groups;
        this.setState({groups: groups.concat(taskGroup)});
        model.x = positionX;
        model.y = positionY;
    },
    addTask: function(graph, canvasDiv, event) {
        var canvasDiv = $("#" + canvasDiv);
        var positionX = parseInt((event.pageX - canvasDiv.offset().left - graph.tx) / graph.scale);
	    var positionY = parseInt((event.pageY - canvasDiv.offset().top  - graph.ty) / graph.scale);

        var taskNode = new QuneeModule.TaskNode(this.testInfo(positionX, positionY), this.testData());
        var model = graph.graphModel.add(taskNode);
        var nodes = this.state.nodes;
        this.setState({nodes: nodes.concat(taskNode)});
        model.x = positionX;
        model.y = positionY;
    },
    uuid: function () {
			/*jshint bitwise:false */
			var i, random;
			var uuid = '';

			for (i = 0; i < 32; i++) {
				random = Math.random() * 16 | 0;
				if (i === 8 || i === 12 || i === 16 || i === 20) {
					uuid += '-';
				}
				uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random))
					.toString(16);
			}

			return uuid;
    },
    timer: function() {
        var nodes = this.state.nodes;
        nodes.forEach(function(node) {
            node.set('progress', this.testData().progress);
            node.set('waiting', this.testData().waiting);
            node.set('running', this.testData().running);
            node.set('success', this.testData().success);
            node.set('fail', this.testData().fail);
        }, this);
    },
    testInfo: function(positionX, positionY) {
        var length = this.state.nodes.length;
        var index = this.state.taskIndex;
        if(length == 0) {
            this.setState({taskIndex: 1});
            index = this.state.taskIndex;
        } else {
            this.setState({taskIndex: index+1});
            index = this.state.taskIndex;
        }
        var taskInfo = {
            taskType: 'Script',
            name: 'new task' + index,
            id: this.uuid(),
            description: 'test description',
            savePath: 'C:\programfiles',
            image: "images/executescript.png",
            positionX: positionX,
            positionY: positionY
        }
        return taskInfo;
    },
    testGroupInfo: function(positionX, positionY) {
        var length = this.state.groups.length;
        var index = this.state.groupIndex;
        if(length == 0) {
            this.setState({groupIndex: 1});
            index = this.state.groupIndex;
        } else {
            this.setState({groupIndex: index+1});
            index = this.state.groupIndex;
        }
        var groupInfo = {
            name: 'new group' + index,
            id: this.uuid(),
            description: 'test group description',
            savePath: 'C:\programfiles',
            image: "images/executescript.png",
            positionX: positionX,
            positionY: positionY
        }
        return groupInfo;
    },
    testData: function() {
        var taskData = {
            progress: Math.random(),
            waiting: formatNumber(Math.random() * 100, ''),
            running: formatNumber(Math.random() * 100, ''),
            success: formatNumber(Math.random() * 100, ''),
            fail: formatNumber(Math.random() * 100, '')
        }
        return taskData;
    },
    addGateway: function() {

    },
    render: function() {
        var clientWidth = {
            width: '1000px',
            height: '600px'
        }

        return (
            <div id="container">
                <ComponentList onEdgeClick={this.handleEdgeClick}/>
                <div style={clientWidth} id="canvas" />
                <Property />
            </div>
        );
    }
});

ReactDom.render(<Main />, document.getElementById("quneeapp"));