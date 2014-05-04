define(['jquery','TEnvironment', 'TGraphicalObject', 'objects/sprite/Sprite', 'TUtils'], function($, TEnvironment, TGraphicalObject, Sprite, TUtils) {
    var Walker = function(name) {
        Sprite.call(this,name);
    };
    
    Walker.prototype = Object.create(Sprite.prototype);
    Walker.prototype.constructor = Walker;
    Walker.prototype.className = "Walker";
    
    var qInstance = Walker.prototype.qInstance;
    
    qInstance.TSprite.extend("TWalker", {
        init: function(props,defaultProps) {
            this._super(qInstance._extend({
                type:TGraphicalObject.TYPE_WALKER,
                collisionMask:TGraphicalObject.TYPE_BLOCK,
                mayFall:false,
                jumping:false,
                vy:0,
                gravity:9.8*100,
                jumpSpeed: -300,
            },props),defaultProps);
            this.on("hit", this, "checkBlocks");
            this.blocks = new Array();
        },
        step: function(dt) {
            if (this.p.mayFall && (this.p.direction === Sprite.DIRECTION_UP || this.p.direction === Sprite.DIRECTION_DOWN)) {
                // cannot move upward or downward when walker may fall
                this.p.direction = Sprite.DIRECTION_NONE;
            }
            this._super(dt);
            if (this.p.mayFall) {
                if (this.p.jumping) {
                    if (this.p.vy === 0) {
                        // perform a jump
                        this.p.vy = this.p.jumpSpeed;
                    }
                    this.p.jumping = false;
                } else {
                    this.p.vy += this.p.gravity * dt;
                }
                this.p.y += this.p.vy * dt;
                // no destinationY other than y can be set
                this.p.destinationY = this.p.y;
            }
            this.stage.collide(this, {collisionMask:TGraphicalObject.TYPE_BLOCK, maxCol:1});
        },
        checkBlocks: function(col) {
            var object = col.obj;
            if (object.p.type === TGraphicalObject.TYPE_BLOCK && this.blocks.indexOf(object)>-1) {
                // block encountered
                this.p.x -= col.separate[0];
                this.p.y -= col.separate[1];                
                if(this.p.mayFall) {
                    if (col.normalY < -0.3 && this.p.vy>0 ) {
                        // landed
                        this.p.vy = 0;
                    } else if (col.normalY > 0.3 && this.p.vy<0) {
                        // bumped top
                        this.p.vy = 0;
                    }
                }
            }
        },
        addBlock: function(block) {
            var obj = block.getQObject();
            if (this.blocks.indexOf(obj) === -1) {
                this.blocks.push(obj);
            }
        },
        mayFall: function(value) {
            this.perform(function(){
                this.p.mayFall = value;
            });
        },
        setJumpSpeed: function(value) {
            this.perform(function(){
                this.p.jumpSpeed = -3*value;
            });
        },
        setGravity: function(value) {
            this.perform(function(){
                this.p.gravity = 9.8*value;
            });
        },
        jump: function() {
            this.perform(function(){
                this.p.jumping = true;
            });
        }
    });
    
    Walker.prototype.qSprite = qInstance.TWalker;

    Walker.prototype._addBlock = function(block) {
        if (TUtils.checkObject(block)) {
            this.qObject.addBlock(block);
        }
    };
    
    Walker.prototype._mayFall = function(value) {
        if (TUtils.checkBoolean(value)) {
            this.qObject.mayFall(value);
        }
    };

    Walker.prototype._setJumpSpeed = function(value) {
        if (TUtils.checkInteger(value)) {
            this.qObject.setJumpSpeed(value);
        }
    };

    Walker.prototype._jump = function() {
        this.qObject.jump();
    };

    Walker.prototype._setGravity = function(value) {
        if (TUtils.checkInteger(value)) {
            this.qObject.setGravity(value);
        }
    };

    TEnvironment.internationalize(Walker, true);
    
    return Walker;
});