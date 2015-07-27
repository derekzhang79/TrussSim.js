var ForceLine=require('./ForceLine');

var Node = fabric.util.createClass(fabric.Circle, {
    type: 'node',

    initialize: function(options) {
        if (!options) {
            options = {};
        }

        this.callSuper('initialize', options);

        //settings default values of the most important properties
        this.set({
            showCoords: false,
            left: options.left || -100,
            top: options.top || -100,
            strokeWidth: options.strokeWidth || 5,
            radius: options.radius || 12,
            fill: options.fill || '#FFFFFF',
            stroke: options.stroke || '#666',
            selectable: options.selectable || true,
            hasControls: false,
            hasBorders: false,
            support: options.support || false,
            floor_beam: options.floor_beam || false,
            external_force: [0,0],
            connected_members: []
        });
    },
    
    toObject: function() {
        return {
            support: this.get('support'),
            floor_beam: this.get('floor_beam'),
            left: this.get('left'),
            top: this.get('top'),
        };
    },

    _render: function(ctx) {
        this.callSuper('_render', ctx);
        var yOff;
        if (this.floor_beam) {
            yOff = -30;
        } else {
            yOff = 12;
        }
        if (this.showCoords) {
            // ctx.fillStyle = 'hsla(0, 100%, 100%, 1)'; //color of the font
            // ctx.fillRect(-10, yOff, 150, 22);
            ctx.font = '20px Arial';
            ctx.fillStyle = 'hsla(87, 100%, 24%, 1)'; //color of the font
            ctx.fillText('('+Math.round(this.left*100)/100+', ' +Math.round(this.top*100)/100+')', 12,yOff+18);
        }
    }
});

Node.prototype.copyProp=function(nodeObj) {
    this.top = nodeObj.top;
    this.left = nodeObj.left;
    this.support = nodeObj.support;
    this.floor_beam = nodeObj.floor_beam;
    if (this.floor_beam) {
        this.lockMovementY = true;
    } else {
        this.lockMovementY = false;
    }
    if (this.support) {
        this.stroke = '#F41313';
        this.lockMovementX=true;
    } else if (this.floor_beam) {
        this.stroke = '#000000';
        this.lockMovementX=false;
    } //else default
};

module.exports=Node;
var E=require('./EntityController');

//functions for car

//Moves the connected members of the node to its position
Node.prototype.moveMembers = function(canvas) {
    for (var i = 0; i < this.connected_members.length; i++) {
        if (this.connected_members[i].start_node == this) { //if the start of the member is connected to the this
            this.connected_members[i].set({
                x1: this.left,
                y1: this.top
            });
        } else if (this.connected_members[i].end_node == this) { //if the end of the member is connected to the this
            this.connected_members[i].set({
                x2: this.left,
                y2: this.top
            });
        }
        //Re-adding the members to avoing weird glitchiness (if canvas object available)
        if(canvas){
            canvas.remove(this.connected_members[i]);
            canvas.add(this.connected_members[i]);
            canvas.sendToBack(this.connected_members[i]); //sending the connected members to the back of the canvas
        }
    }
};

Node.prototype.setForce=function(x,y,canvas){

    this.external_force[0]=x || 0;
    this.external_force[1]=y || 0;
    roundedX=Math.round(x*100)/100;
    roundedY=Math.round(y*100)/100;
    if(this.forceLine){ //if a force line already exists
        this.forceLine.set({
            x1: this.left,
            y1: this.top,
            label: roundedY,
            x2: this.left,
            y2: this.top-y*200/E.car_weight
        });
    }
    else{ //if the forceline doesnt yet exist
        this.forceLine=new ForceLine({
            x1: this.left,
            y1: this.top,
            label: roundedY,
            x2: this.left,
            y2: this.top-y*200/E.car_weight
        });
        canvas.add(this.forceLine);
    }
};

Node.prototype.isCarOn=function(){
    if(E.car){
        if(this.left>=E.car.left-E.car_length_px/2 && this.left<=E.car.left+E.car_length_px/2){
            return true;
        }
    }
    return false;
};

