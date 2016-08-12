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
    console.log(taskInfo.taskType);
    console.log(taskInfo.name);
    console.log(taskInfo.id);
    console.log(taskInfo.description);
    console.log(taskInfo.savePath);
    console.log(taskInfo.image);
    console.log(taskData);
    this.init(taskInfo, taskData);
}

var w = 140, h = 90, r = 10;
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
        this.set('progress', taskData.progress);
        this.set('waiting', taskData.waiting);
        this.set('running', taskData.running);
        this.set('success', taskData.success);
        this.set('fail', taskData.fail);

        this.image = this.shape;

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
        // addUIAt(this, new Q.LabelUI(taskInfo.name), 15, 45);
        var icon = new Q.ImageUI(taskInfo.image);
        icon.size = this.iconSize;
        addUIAt(this, icon, 15, 12, "icon").anchorPosition = Q.Position.CENTER_MIDDLE;

        addUIAt(this, new Q.LabelUI(taskInfo.name + ' (' + taskInfo.taskType + ')'), 30, 5);

        addUIAt(this, new Q.LabelUI("진행률"), 33, 37).anchorPosition = Q.Position.RIGHT_MIDDLE;
        addUIAt(this, new BarUI(), 36, 37, "progress").anchorPosition = Q.Position.LEFT_MIDDLE;

        addUIAt(this, new Q.LabelUI("대기"), 33, 60).anchorPosition = Q.Position.RIGHT_MIDDLE;
        addUIAt(this, new Q.LabelUI("진행"), 33, 76).anchorPosition = Q.Position.RIGHT_MIDDLE;
        addUIAt(this, new Q.LabelUI("성공"), 90, 60).anchorPosition = Q.Position.RIGHT_MIDDLE;
        addUIAt(this, new Q.LabelUI("실패"), 90, 76).anchorPosition = Q.Position.RIGHT_MIDDLE;
        var ui = addUIAt(this, new Q.LabelUI(), 40, 60, "waiting");
        ui.anchorPosition = Q.Position.LEFT_MIDDLE;
        ui.color = "#C20";
        ui = addUIAt(this, new Q.LabelUI(), 40, 76, "running");
        ui.anchorPosition = Q.Position.LEFT_MIDDLE;
        ui.color = "#C20";
        ui = addUIAt(this, new Q.LabelUI(), 97, 60, "success");
        ui.anchorPosition = Q.Position.LEFT_MIDDLE;
        ui.color = "#C20";
        ui = addUIAt(this, new Q.LabelUI(), 97, 76, "fail");
        ui.anchorPosition = Q.Position.LEFT_MIDDLE;
        ui.color = "#C20";
    },
    dataUpdate: function(taskData) {
        this.set('progress', taskData.progress);
        this.set('waiting', taskData.waiting);
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

Object.defineProperties(TaskNode.prototype, {
    showDetail: {
        get: function(){
            return this._showDetail;
        },
        set: function(show){
            if(this._showDetail == show){
                return;
            }
            this._showDetail = show;
            this.image = show ? this.shape : this.get("image");
            this.name = show ? '' : (this.get("name"));
            var uis = this.bindingUIs;
            if(uis){
                uis.forEach(function(ui){
                    ui.ui.visible = show;
                })
                this.invalidate();
            }
        }
    }
})

function TaskGroup(groupInfo) {
    this.init(groupInfo);
}

TaskGroup.prototype = {
    init: function(groupInfo) {
        this.set('name', groupInfo.name);
        this.set('id', groupInfo.id);
        this.set('description', groupInfo.description);
        this.set('savePath', groupInfo.savePath);
        this.set('positionX', groupInfo.positionX);
        this.set('positionY', groupInfo.positionY);
        this.set('image', groupInfo.image);

        this.name = groupInfo.name;
        this.image = groupInfo.image;
    }
}
Q.extend(TaskGroup, Q.Group);

function Connector() {

}

Connector.prototype = {

}
Q.extend(Connector, Q.Edge);

function Gateway() {

}

Gateway.prototype = {

}
Q.extend(Gateway, Q.Node);

module.exports = {
    TaskNode: TaskNode,
    TaskGroup: TaskGroup,
    Connector: Connector,
    Gateway: Gateway
}