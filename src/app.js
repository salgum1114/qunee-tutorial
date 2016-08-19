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
            gateways: [],
            connectors: [],
            gatewayIndex: 1,
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
            if(element instanceof Q.Group) {
                var target = graph.hitTest(evt);
                if(target.type == 'GroupLabel') {
                    return;
                } else {
                    element.showSummary = !element.showSummary;
                }
            }
        }
        graph.onclick = function(evt) {
            var data = evt.getData();
            if(data instanceof Q.Group) {
                var target = graph.hitTest(evt);
                if(target && target.type == 'GroupHandle') {
                    data.reverseExpanded = !data.reverseExpanded;
                }
            }
        }
        var addTask = this.addTask;
        var addTaskGroup = this.addTaskGroup;
        var addGateway = this.addGateway;
        $("#toolbox div img").draggable({helper: "clone"});
        $('#' + canvasDiv).droppable({
            accept: 'img',
            drop: function(event, ui) {
                var type = ui.draggable.attr('draginfo');
                var jsonData = JSON.parse(type);
                if(jsonData.type === 'Node') {
                    addTask(graph, canvasDiv, event);
                } else if(jsonData.type === 'Group') {
                    addTaskGroup(graph, canvasDiv, event);
                } else if(jsonData.type === 'Gateway') {
                    addGateway(graph, canvasDiv, event);
                }
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
        var edgeType = target.getAttribute('edgeType');
        if(selectType === 'edge') {
            graph.interactionMode = Q.Consts.INTERACTION_MODE_CREATE_SIMPLE_EDGE;
            graph.interactionProperties = {
                edgeType: Q.Consts.EDGE_TYPE_VERTICAL_HORIZONTAL
            };
            this.addConnector(graph, lineType, Q.Consts.EDGE_TYPE_VERTICAL_HORIZONTAL);
        } else if(selectType === 'default') {
            graph.interactionMode = Q.Consts.INTERACTION_MODE_DEFAULT;
        } else if(selectType === 'selection') {
            graph.interactionMode = Q.Consts.INTERACTION_MODE_SELECTION;
        } else if(selectType === 'viewmode') {
            graph.interactionMode = Q.Consts.INTERACTION_MODE_VIEW;
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
    addConnector: function(graph, lineType, edgeType) {
        var testConnectorInfo = this.testConnectorInfo;
        graph.graphModel.listChangeDispatcher.addListener({
            onEvent: function(evt) {
                console.log(evt);
                if(evt.kind === 'add' && (Q.Consts.INTERACTION_MODE_CREATE_EDGE === graph.interactionMode
                || Q.Consts.INTERACTION_MODE_CREATE_SIMPLE_EDGE === graph.interactionMode)) {
                    var edge = evt.data;
                    console.log(evt.data);
                    var connectorInfo = {
                        name: lineType,
                        lineType: lineType,
                        edgeType: edgeType,
                        from: edge.from,
                        to: edge.to
                    };
                    var connector = new QuneeModule.Connector(testConnectorInfo(connectorInfo));
                    console.log(connector);
                    edge.name = lineType;
                    console.log(evt.data);
                    // if(lineType === 'success') {
                    //     edge.name = '성공';
                    //     edge.setStyle(Q.Styles.ARROW_TO, true);
                    //     // edge.setStyle(Q.Styles.EDGE_LINE_DASH, false);
                    // } else if(lineType === 'fail'){
                    //     edge.name = '실패';
                    //     edge.setStyle(Q.Styles.ARROW_TO, true);
                    //     // edge.setStyle(Q.Styles.EDGE_LINE_DASH, false);
                    // } else if(lineType === 'normal') {
                    //     edge.setStyle(Q.Styles.ARROW_TO, false);
                    //     // edge.setStyle(Q.Styles.EDGE_LINE_DASH, [5, 3]);
                    // }
                }
            }
        });
    },
    addTaskGroup: function(graph, canvasDiv, event) {
        var canvasDiv = $("#" + canvasDiv);
        var positionX = parseInt((event.pageX - canvasDiv.offset().left - graph.tx) / graph.scale);
	    var positionY = parseInt((event.pageY - canvasDiv.offset().top  - graph.ty) / graph.scale);
        
        var taskGroup = new QuneeModule.TaskGroup(this.testGroupInfo(positionX, positionY), this.testGroupData());
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
        var taskNode = new QuneeModule.TaskNode(this.testInfo(positionX, positionY), this.testTaskData());
        var model = graph.graphModel.add(taskNode);
        var nodes = this.state.nodes;
        this.setState({nodes: nodes.concat(taskNode)});
        model.x = positionX;
        model.y = positionY;
    },
    addGateway: function(graph, canvasDiv, event) {
        var canvasDiv = $("#" + canvasDiv);
        var positionX = parseInt((event.pageX - canvasDiv.offset().left - graph.tx) / graph.scale);
	    var positionY = parseInt((event.pageY - canvasDiv.offset().top  - graph.ty) / graph.scale);
        var gateway = new QuneeModule.Gateway(this.testGatewayInfo(positionX, positionY));
        var model = graph.graphModel.add(gateway);
        var gateways = this.state.gateways;
        this.setState({gateways: gateways.concat(gateway)});
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
        var groups = this.state.groups;
        nodes.forEach(function (task) {
            if (!(task instanceof Q.Node)) {
                return;
            }
            task.set('runningColor', Q.toColor(0x7D847D));
            task.set('successColor', Q.toColor(0x00FF00));
            task.set('failColor', Q.toColor(0xFF0000));
            task.dataUpdate(this.testTaskData());
        }, this)
        groups.forEach(function(group) {
            if (!(group instanceof Q.Group)) {
                return;
            }
            group.dataUpdate(this.testGroupData());
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
            image: "images/MultiTaskJob.png",
            positionX: positionX,
            positionY: positionY,
            startDate: '2016-08-17',
            endDate: '2016-08-18'
        }
        return groupInfo;
    },
    testConnectorInfo: function(connectorInfo) {
        var connectorInfo = {
            name: connectorInfo.name,
            id: this.uuid(),
            description: 'test edge description',
            lineType: connectorInfo.lineType,
            edgeType: connectorInfo.edgeType,
            from: connectorInfo.from,
            to: connectorInfo.to
        }
        return connectorInfo;
    },
    testGatewayInfo: function(positionX, positionY) {
        var length = this.state.gateways.length;
        var index = this.state.gatewayIndex;
        if(length == 0) {
            this.setState({gatewayIndex: 1});
            index = this.state.gatewayIndex;
        } else {
            this.setState({gatewayIndex: index+1});
            index = this.state.gatewayIndex;
        }
        var gatewayInfo = {
            name: 'new gateway' + index,
            id: this.uuid(),
            description: 'test gateway description',
            savePath: 'C:\programfiles',
            image: "images/diamond.png",
            positionX: positionX,
            positionY: positionY,
        }
        return gatewayInfo;
    },
    testGroupData: function() {
        var groupData = {
            progress: Math.random(),
            total: formatNumber(Math.random() * 100, ''),
            waiting: formatNumber(Math.random() * 100, ''),
            running: formatNumber(Math.random() * 100, ''),
            success: formatNumber(Math.random() * 100, ''),
            fail: formatNumber(Math.random() * 100, '')
        }
        return groupData;
    },
    testTaskData: function() {
        var taskData = {
            running: formatNumber(Math.random() * 10, ''),
            success: formatNumber(Math.random() * 10, ''),
            fail: formatNumber(Math.random() * 10, '')
        }
        return taskData;
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