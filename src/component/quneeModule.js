'use strict';

var BarUI = function(data){
    Q.doSuperConstructor(this, BarUI, arguments);
}

BarUI.prototype = {
    width: 100,
    height: 12,
    measure: function(){
        this.setMeasuredBounds(this.width, this.height);
    },
    draw: function(g, scale, selected){
        var value = this.data * 100 | 0;
        var data = this.data;
        if(data > 1){
            data = 1;
        }else if(data < 0){
            data = 0;
        }
        var color;
        if(value < 40){
            color = "#0F0";
        }else if(value < 70){
            color = "#FF0";
        }else{
            color = "#F00";
        }
        g.fillStyle = color;
        var w = data * this.width;
        g.fillRect(0, 0, w, this.height);
        g.beginPath();
        g.strokeStyle = "#CCC";
        g.strokeRect(0, 0, this.width, this.height);
        g.fillStyle = "#555";
        g.textBaseline = "middle";
        if(value > 83){
            g.textAlign = "right";
            g.fillText(value, this.width - 1, this.height / 2);
            return;
        }
        g.fillText(value, w + 3, this.height / 2);
    }
}
Q.extend(BarUI, Q.BaseUI);
Q.BarUI = BarUI;

function TaskNode(taskInfo, taskData) {
    Q.doSuperConstructor(this, TaskNode);
    // console.log(taskInfo.taskType);
    // console.log(taskInfo.name);
    // console.log(taskInfo.id);
    // console.log(taskInfo.description);
    // console.log(taskInfo.savePath);
    // console.log(taskInfo.image);
    // console.log(taskData);
    this.init(taskInfo, taskData);
}

TaskNode.prototype = {
    _showDetail: true,
    iconSize: {width: 23},
    shape: Q.Shapes.getRect(-w/2, -h/2, w, h, r, r),
    init: function(taskInfo, taskData) {
        this.set('taskType', taskInfo.taskType);
        this.set('name', taskInfo.name);
        this.set('id', taskInfo.id);
        this.set('positionX', taskInfo.positionX);
        this.set('positionY', taskInfo.positionY);
        this.set('image', taskInfo.image);
        this.set('running', taskData.running);
        this.set('success', taskData.success);
        this.set('fail', taskData.fail);
        this.set('runningColor', taskData.runningColor);
        this.set('successColor', taskData.successColor);
        this.set('failColor', taskData.failColor);

        this.name = taskInfo.name;
        this.image = taskInfo.image;

        var width = 70;
        var height = 50;
        var padding = 4;
        this.size = {width: width, height: height}

        function addUIAt(node, ui, x, y, bindingProperty, value) {
            // ui.position = {x: width - 10, y: -22};
            ui.position = {x: width - x, y: y};
            ui.fontSize = 12;
            ui.fontStyle = 'bold';
            var binding;
            if(bindingProperty){
                binding = {
                    property : bindingProperty,
                    propertyType : Q.Consts.PROPERTY_TYPE_CLIENT,
                    bindingProperty : "data"
                }
            }
            node.addUI(ui, binding);
            return ui;
        }
        function lampUIAt(node, ui, x, y, bindingProperty, value) {
            ui.fillGradient = new Q.Gradient(Q.Consts.GRADIENT_TYPE_RADIAL, [Q.toColor(0xAAFFFFFF), Q.toColor(0x33EEEEEE), Q.toColor(0x44888888), Q.toColor(0x33666666)],
                [0.1, 0.3, 0.7, 0.9], 0, -0.2, -0.2);
            ui.lineWidth = 0.5;
            ui.strokeStyle = '#CCC';
            ui.position = {x: width - x, y: y};
            // ui.position = {x: width - 10, y: -10};

            var binding;
            if(bindingProperty){
                binding = {
                    property : bindingProperty,
                    propertyType : Q.Consts.PROPERTY_TYPE_CLIENT,
                    bindingProperty : "fillColor"
                }
            }
            node.addUI(ui, binding);
            return ui;
        }
        addUIAt(this, new Q.LabelUI(), 50, -22, 'running');
        addUIAt(this, new Q.LabelUI(), 35, -22, 'success');
        addUIAt(this, new Q.LabelUI(), 20, -22, 'fail');
        
        lampUIAt(this, new Q.ImageUI(Q.Shapes.getShape(Q.Consts.SHAPE_CIRCLE, 7, 7, 10.5, 10.5)), 50, -10, 'runningColor');
        lampUIAt(this, new Q.ImageUI(Q.Shapes.getShape(Q.Consts.SHAPE_CIRCLE, 7, 7, 10.5, 10.5)), 35, -10, 'successColor');
        lampUIAt(this, new Q.ImageUI(Q.Shapes.getShape(Q.Consts.SHAPE_CIRCLE, 7, 7, 10.5, 10.5)), 20, -10, 'failColor');
        
    },
    dataUpdate: function(taskData) {
        this.set('running', taskData.running);
        this.set('success', taskData.success);
        this.set('fail', taskData.fail);
    },
    infoUpdate: function(taskInfo) {
        this.set('taskType', taskInfo.taskType);
        this.set('name', taskInfo.name);
        this.set('id', taskInfo.id);
        this.set('positionX', taskInfo.positionX);
        this.set('positionY', taskInfo.positionY);
        this.set('image', taskInfo.image);
    }
}
Q.extend(TaskNode, Q.Node);

var w = 200, h = 80, r = 10;
function TaskGroup(groupInfo, groupData) {
    Q.doSuperConstructor(this, TaskGroup);
    // console.log(groupInfo.name);
    // console.log(groupInfo.id);
    // console.log(groupInfo.description);
    // console.log(groupInfo.savePath);
    // console.log(groupInfo.image);
    // console.log(groupInfo.positionX);
    // console.log(groupInfo.positionY);
    // console.log(groupData);
    this.init(groupInfo, groupData);
}

TaskGroup.prototype = {
    _expanded: true,
    iconSize: {width: 23},
    shape: Q.Shapes.getRect(-w/2, -h/2, w, h, r, r),
    init: function(groupInfo, groupData) {
        this.set('name', groupInfo.name);
        this.set('id', groupInfo.id);
        this.set('description', groupInfo.description);
        this.set('savePath', groupInfo.savePath);
        this.set('positionX', groupInfo.positionX);
        this.set('positionY', groupInfo.positionY);
        this.set('image', groupInfo.image);
        this.set('startDate', groupInfo.startDate);
        this.set('endDate', groupInfo.startDate);
        this.set('progress', groupData.progress);
        this.set('total', groupData.total);
        this.set('waiting', groupData.waiting);
        this.set('running', groupData.running);
        this.set('success', groupData.success);
        this.set('fail', groupData.fail);

        this.image = this.shape;
        this.padding = 30;
        this.expanded = this._expanded;
        this.name = groupInfo.name;
        var gradient = new Q.Gradient(Q.Consts.GRADIENT_TYPE_LINEAR, ["#F4F4F4", "#FFFFFF", "#DFDFDF", "#E9E9E9"]);
        gradient.angle = Math.PI / 2;
        this.setStyle(Q.Styles.SHAPE_FILL_GRADIENT, gradient);
        this.setStyle(Q.Styles.SHAPE_STROKE, 0);
        this.setStyle(Q.Styles.SHAPE_OUTLINE, 1);
        this.setStyle(Q.Styles.SHAPE_OUTLINE_STYLE, "#C9C9C9");
        this.setStyle(Q.Styles.LAYOUT_BY_PATH, false);
        function addUIAt(node, ui, x, y, bindingProperty, value){
            ui.syncSelection = false;
            ui.zIndex = 1;
            ui.position = {x: x, y: y};
            ui.anchorPosition = Q.Position.LEFT_TOP;
            ui.fontSize = 10;
            ui.type = 'GroupLabel';
            ui.visible = false;
            var binding;
            if(bindingProperty){
                binding = {
                    property : bindingProperty,
                    propertyType : Q.Consts.PROPERTY_TYPE_CLIENT,
                    bindingProperty : "data"
                }
            }
            node.addUI(ui, binding);
            return ui;
        }
        var icon = new Q.ImageUI(groupInfo.image);
        icon.size = this.iconSize;
        addUIAt(this, icon, 15, 15, "icon").anchorPosition = Q.Position.CENTER_MIDDLE;

        addUIAt(this, new Q.LabelUI("시작일시: " + groupInfo.startDate), 35, 5);
        addUIAt(this, new Q.LabelUI("종료일시: " + groupInfo.endDate), 35, 20);

        addUIAt(this, new Q.LabelUI("대상서버: "), 60, 47).anchorPosition = Q.Position.RIGHT_MIDDLE;
        var ui = addUIAt(this, new Q.LabelUI(), 65, 47, "total");
        ui.anchorPosition = Q.Position.LEFT_MIDDLE;
        ui.color = "#C20";
        addUIAt(this, new BarUI(), 90, 47, "progress").anchorPosition = Q.Position.LEFT_MIDDLE;

        addUIAt(this, new Q.LabelUI("대기"), 33, 67).anchorPosition = Q.Position.RIGHT_MIDDLE;
        addUIAt(this, new Q.LabelUI("진행"), 73, 67).anchorPosition = Q.Position.RIGHT_MIDDLE;
        addUIAt(this, new Q.LabelUI("성공"), 113, 67).anchorPosition = Q.Position.RIGHT_MIDDLE;
        addUIAt(this, new Q.LabelUI("실패"), 153, 67).anchorPosition = Q.Position.RIGHT_MIDDLE;
        ui = addUIAt(this, new Q.LabelUI(), 36, 67, "waiting");
        ui.anchorPosition = Q.Position.LEFT_MIDDLE;
        ui.color = "#C20";
        ui = addUIAt(this, new Q.LabelUI(), 76, 67, "running");
        ui.anchorPosition = Q.Position.LEFT_MIDDLE;
        ui.color = "#C20";
        ui = addUIAt(this, new Q.LabelUI(), 116, 67, "success");
        ui.anchorPosition = Q.Position.LEFT_MIDDLE;
        ui.color = "#C20";
        ui = addUIAt(this, new Q.LabelUI(), 156, 67, "fail");
        ui.anchorPosition = Q.Position.LEFT_MIDDLE;
        ui.color = "#C20";

        var groupHandle = new Q.LabelUI(this._expanded ? '-' : '+');
        groupHandle.backgroundColor = "#2898E0";
        groupHandle.color = "#FFF";
        groupHandle.padding = new Q.Insets(0, 4);
        groupHandle.borderRadius = 0;
        groupHandle.position = Q.Position.RIGHT_TOP;
        groupHandle.anchorPosition = Q.Position.LEFT_TOP;
        groupHandle.type = "GroupHandle";
        this.addUI(groupHandle, {
            property: 'expanded',
            callback: function(value, ui) {
                ui.data = value ? '-' : '+';
            }
        });
    },
    dataUpdate: function(groupData) {
        this.set('progress', groupData.progress);
        this.set('total', groupData.total);
        this.set('waiting', groupData.waiting);
        this.set('running', groupData.running);
        this.set('success', groupData.success);
        this.set('fail', groupData.fail);
    },
    infoUpdate: function(groupInfo) {
        this.set('name', groupInfo.name);
        this.set('id', groupInfo.id);
        this.set('description', groupInfo.description);
        this.set('savePath', groupInfo.savePath);
        this.set('positionX', groupInfo.positionX);
        this.set('positionY', groupInfo.positionY);
        this.set('image', groupInfo.image);
        this.set('startDate', groupInfo.startDate);
        this.set('endDate', groupInfo.startDate);
    },
    save: function(groupInfo, saveUrl) {

    }, 
    load: function(groupInfo, loadUrl) {

    }
}
Q.extend(TaskGroup, Q.Group);
Object.defineProperties(TaskGroup.prototype, {
    showSummary: {
        get: function(){
            return this._expanded;
        },
        set: function(show){
            if(this._expanded == show){
                return;
            }
            this._expanded = show;
            this.expanded = !this._expanded;
            var isExpanded = this.expanded;
            var uis = this.bindingUIs;
            if(uis){
                uis.forEach(function(ui){
                    if(ui.ui.type === 'GroupHandle') {
                        ui.ui.visible = true;
                    } else {
                        ui.ui.visible = isExpanded;
                    }
                })
            }
        }
    },
    reverseExpanded: {
        get: function(){
            return this._expanded;
        },
        set: function(show){
            if(this._expanded == show){
                return;
            }
            this._expanded = show;
            this.expanded = this._expanded;
            var isExpanded = !this.expanded;
            var uis = this.bindingUIs;
            if(uis){
                uis.forEach(function(ui){
                    if(ui.ui.type === 'GroupHandle') {
                        ui.ui.visible = true;
                    } else {
                        ui.ui.visible = isExpanded;
                    }
                })
            }
        }
    }
});

function Connector(connectorInfo, connectorData) {
    Q.doSuperConstructor(this, Connector);
    console.log(connectorInfo.name);
    console.log(connectorInfo.id);
    console.log(connectorInfo.description);
    console.log(connectorInfo.lineType);
    console.log(connectorInfo.edgeType);
    console.log(connectorInfo.from);
    console.log(connectorInfo.to);
    this.init(connectorInfo, connectorData);
}

Connector.prototype = {
    init: function(connectorInfo, connectorData) {
        this.set('name', connectorInfo.name);
        this.set('id', connectorInfo.id);
        this.set('description', connectorInfo.description);
        this.set('lineType', connectorInfo.lineType);
        this.set('edgeType', connectorInfo.edgeType);
        this.set('from', connectorInfo.from);
        this.set('to', connectorInfo.to);

        this.name = connectorInfo.name;
        this.from = connectorInfo.from;
        this.to = connectorInfo.to;
        this.edgeType = connectorInfo.edgeType;
    }
}
Q.extend(Connector, Q.Edge);

function Gateway(gatewayInfo) {
    Q.doSuperConstructor(this, Gateway);
    // console.log(gatewayInfo.name);
    // console.log(gatewayInfo.id);
    // console.log(gatewayInfo.description);
    // console.log(gatewayInfo.savePath);
    // console.log(gatewayInfo.image);
    // console.log(gatewayInfo.positionX);
    // console.log(gatewayInfo.positionY);
    this.init(gatewayInfo);
}

Gateway.prototype = {
    init: function(gatewayInfo) {
        this.set('name', gatewayInfo.name);
        this.set('id', gatewayInfo.id);
        this.set('description', gatewayInfo.description);
        this.set('savePath', gatewayInfo.savePath);
        this.set('image', gatewayInfo.image);
        this.set('positionX', gatewayInfo.positionX);
        this.set('positionY', gatewayInfo.positionY);

        this.name = gatewayInfo.name;
        this.image = gatewayInfo.image;
    }
}
Q.extend(Gateway, Q.Node);

module.exports = {
    TaskNode: TaskNode,
    TaskGroup: TaskGroup,
    Connector: Connector,
    Gateway: Gateway
}