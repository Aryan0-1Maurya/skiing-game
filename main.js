/* 

    #############################################################
      
          @@@@@@@@@@    &&&&&&&&&&&&&&&&&&&    %%%%%%%%%%

(   By ~Aryan Maurya Mr.perfect https://amsrportfolio.netlify.app  )

          @@@@@@@@@@    &&&&&&&&&&&&&&&&&&&    %%%%%%%%%%

    #############################################################

*/

window.onload = function() {
    attributes = {
        context: document.getElementById("c1").getContext("2d"),
        pressed: false,
        lastTime: 0,
        highScore: 0,
        helpTimer: 150
    };
    
    attributes.context.canvas.width = innerWidth*devicePixelRatio;
    attributes.context.canvas.height = innerHeight*devicePixelRatio;
    
    let factor = (attributes.context.canvas.width*attributes.context.canvas.height/(220*400))**0.5;
    
    attributes.context.scale(factor, factor);
    
    attributes.game = new Game(0, 0, attributes.context.canvas.width/factor, attributes.context.canvas.height/factor);
    

    if(isTouchDevice()) {
        document.addEventListener("touchstart", down);
        document.addEventListener("touchend", up);
        document.addEventListener("touchcancel", up);
    } else {
        document.addEventListener("mousedown", down);
        document.addEventListener("mouseup", up);
        document.addEventListener("keydown", down);
        document.addEventListener("keyup", up);
    }
    
    requestAnimationFrame(update);
};

function isTouchDevice() {
  return (('ontouchstart' in window) ||
     (navigator.maxTouchPoints > 0) ||
     (navigator.msMaxTouchPoints > 0));
}

function down() {
    if(!attributes.pressed && attributes.game.screen == 1) {
        attributes.game.player.dir *= -1;
        attributes.pressed = true;
    }
}

function up() {
    attributes.pressed = false;
    
    if(attributes.game.screen == 0) {
        attributes.game.screen = 1;
        attributes.game.score = 0;
    }
}

function update(time) {
    if(time != attributes.lastTime) {
        attributes.lastTime = time;

        attributes.game.update();
    
        draw();
        
        requestAnimationFrame(update);
    }
}

function draw() {
    attributes.game.draw(attributes.context);
}

function Game(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    
    this.player = new Player(this);
    
    this.reset();
    
    this.screen = 0; // 0: start, 1: play
    this.score = 0;
}
Game.prototype.update = function() {
    if(this.screen == 1) {
        this.player.update();
        for(var t of this.trees) {
            t.update();
        }
    } else {
        this.scroll = 0;
    }
    this.scroll = Math.min(this.scroll, this.h/2-this.player.y);
};
Game.prototype.draw = function(ctx) {
    ctx.save();
    
    ctx.fillStyle = "#FFF";
    ctx.beginPath();
    ctx.rect(this.x, this.y, this.w, this.h);
    ctx.fill();
    
    ctx.clip();
    
    for(var t of this.trees) {
        t.draw1(ctx);
    }
    
    ctx.fillStyle = "#0008";
    ctx.textAlign = "center";
    ctx.font = "bold 16px sans-serif";
    let tw1 = ctx.measureText("Leave a like if you enjoy the game!").width;
    ctx.font = "bold "+(16*0.6*this.w/tw1)+"px sans-serif";
    ctx.fillText("Leave a like if you enjoy the game!", this.x+this.w/2, 1000+this.scroll);
    
    this.player.drawTail(ctx);
    for(var t of this.trees) {
        t.draw2(ctx);
    }
    
    this.player.drawBody(ctx);
    
    for(var t of this.trees) {
        t.draw3(ctx);
    }
    
    if(this.player.dieCounter > 0) {
        ctx.fillStyle = "rgba(255, 255, 255, "+(1-this.player.dieCounter/this.player.deathDuration)+")";
        ctx.fillRect(this.x, this.y, this.w, this.h);
    }
    
    ctx.fillStyle = "#08F";
    ctx.font = "bold 32px sans-serif";
    ctx.fillText(Math.floor(this.score), this.x+this.w/2, this.y+this.h/8);
    
    if(this.screen == 0 && attributes.highScore > 0) {
        ctx.font = "bold 16px sans-serif";
        ctx.fillText("Highscore: "+attributes.highScore, this.x+this.w/2, this.y+3*this.h/16);
    }
    
    if(attributes.helpTimer > 0) {
        ctx.fillStyle = "rgba(0, 0, 0, "+(0.25-0.25*Math.cos(attributes.helpTimer*Math.PI*2*2/150))+")";
        attributes.helpTimer--;
        if(attributes.helpTimer <= 0 && attributes.highScore == 0 && this.screen == 0) {
            attributes.helpTimer += 75;
        }
        ctx.font = "bold 32px sans-serif";
        let tw = ctx.measureText("Tap to play").width;
        ctx.font = "bold "+(32*0.9*this.w/tw)+"px sans-serif";
        ctx.fillText("Tap to play", this.x+this.w/2, this.y+this.h/2);
    }
    
    ctx.restore();
};
Game.prototype.reset = function() {
    this.scroll = 0;
    
    this.trees = [];
    for(var i=0; i<60; i++) {
        this.trees.push(new Tree(this));
        this.trees[i].y = this.h/2+Math.random()*(this.h+50);
    }
    
    this.trees.sort((a,b)=>a.y-b.y);
};

function Player(g) {
    this.game = g;
    
    this.deathDuration = 40;
    
    this.reset();
}
Player.prototype.update = function() {
    if(this.dieCounter < 1) {
        if((attributes.pressed || this.vx*this.dir < 0.5) && this.vx*this.dir < 2) {
            this.vx += this.dir*0.05;
        }
        
        this.vx *= 1/this.vy;
        this.vy = 1;
        
        this.x += this.vx*2;
        this.y += this.vy*2;
        
        this.tail.push([this.x, this.y]);
        if(this.tail.length > 200) {
            this.tail.shift();
        }
        
        if(this.x < 0 || this.x > this.game.w) {
            this.die();
        }
        
        this.closeCool ++;
        if(this.closeCool > 40) {
            this.closeCounter = 0;
        }
        
        for(var t of this.game.trees) {
            if(Math.hypot(t.x-this.x, t.y-this.y) < 2) {
                this.die();
            }
            if(!t.close && Math.hypot(t.x-this.x, t.y-this.y) < 20) {
                this.closeCounter ++;
                this.closeCool = 0;
                this.game.score += 10*this.closeCounter;
                t.close = true;
                t.highlight = t.highlightDuration;
            }
        }
        
        this.game.score += 0.1;
    } else if(this.dieCounter > 1) {
        this.dieCounter --;
    } else {
        if(Math.floor(this.game.score) > attributes.highScore) {
            attributes.highScore = Math.floor(this.game.score);
        }
        
        this.game.screen = 0;
        this.reset();
        this.game.reset();
    }
};
Player.prototype.drawTail = function(ctx) {
    ctx.strokeStyle = "#8CF8";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(this.tail[0][0]+this.game.x, this.tail[0][1]+this.game.y+this.game.scroll);
    for(var p of this.tail) {
        ctx.lineTo(p[0]+this.game.x, p[1]+this.game.y+this.game.scroll);
    }
    ctx.stroke();
};
Player.prototype.drawBody = function(ctx) {
    ctx.fillStyle = "#08C";
    ctx.beginPath();
    ctx.arc(this.game.x+this.x, this.game.y+this.y+this.game.scroll, 5, 0, 2*Math.PI);
    ctx.fill();
};
Player.prototype.die = function() {
    if(this.dieCounter < 1) {
        this.dieCounter = this.deathDuration;
    }
};

/* 

    #############################################################
      
          @@@@@@@@@@    &&&&&&&&&&&&&&&&&&&    %%%%%%%%%%

(   By ~Aryan Maurya Mr.perfect https://amsrportfolio.netlify.app  )

          @@@@@@@@@@    &&&&&&&&&&&&&&&&&&&    %%%%%%%%%%

    #############################################################

*/

Player.prototype.reset = function() {
    this.x = this.game.w/2;
    this.y = this.game.h/4;
    this.vx = -0.7;
    this.vy = 1;
    
    this.dir = -1;
    
    this.dieCounter = 0;
    this.closeCounter = 0;
    this.closeCool = 60;
    
    this.tail = [[this.x, this.y]];
};

function Tree(g) {
    this.game = g;
    
    this.highlightDuration = 15;
    
    this.reset();
}
Tree.prototype.update = function() {
    if(this.game.scroll+this.y < 0) {
        this.reset();
    }
    
    if(this.highlight > 0) {
        this.highlight --;
    }
};
Tree.prototype.draw1 = function(ctx) {
    if(this.highlight > 0) {
        ctx.strokeStyle = "#0008";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.game.x+this.x, this.game.y+this.game.scroll+this.y, Math.sin(this.highlight*Math.PI/this.highlightDuration)*5+3, 0, 2*Math.PI);
        ctx.stroke();
    }
    
    ctx.fillStyle = "#888";
    ctx.beginPath();
    ctx.moveTo(this.game.x+this.x, this.game.y+this.game.scroll+this.y-5);
    ctx.lineTo(this.game.x+this.x+20, this.game.y+this.game.scroll+this.y-7);
    ctx.lineTo(this.game.x+this.x+5, this.game.y+this.game.scroll+this.y);
    ctx.lineTo(this.game.x+this.x+3, this.game.y+this.game.scroll+this.y-2);
    ctx.lineTo(this.game.x+this.x, this.game.y+this.game.scroll+this.y);
    ctx.lineTo(this.game.x+this.x+2, this.game.y+this.game.scroll+this.y-3);
    ctx.fill();
};
Tree.prototype.draw2 = function(ctx) {
    ctx.fillStyle = "#520";
    ctx.fillRect(this.game.x+this.x-1, this.game.y+this.game.scroll+this.y-5, 2, 5);
};
Tree.prototype.draw3 = function(ctx) {
    ctx.fillStyle = "#080";
    ctx.fillStyle = "hsl("+Math.floor(2+this.y/5000)*60+", 100%, 40%)";
    ctx.beginPath();
    ctx.moveTo(this.game.x+this.x, this.game.y+this.game.scroll+this.y-(Math.sin(this.highlight*Math.PI/this.highlightDuration)*0.5+1)*20-5);
    ctx.lineTo(this.game.x+this.x+(Math.sin(this.highlight*Math.PI/this.highlightDuration)*0.4+1)*8, this.game.y+this.game.scroll+this.y-5);
    ctx.lineTo(this.game.x+this.x-(Math.sin(this.highlight*Math.PI/this.highlightDuration)*0.4+1)*8, this.game.y+this.game.scroll+this.y-5);
    ctx.fill();
};
Tree.prototype.reset = function() {
    this.x = Math.random()*this.game.w;
    this.y = this.game.h-this.game.scroll+20+60*Math.random();
    if(this.y > 985 && this.y < 1025 && this.x > this.game.w*0.15 && this.x < this.game.w*0.85) {
        this.x = Math.random()*this.game.w;
        this.y += 40;
    }
    this.close = false;
    this.highlight = 0;
};


/* 

    #############################################################
      
          @@@@@@@@@@    &&&&&&&&&&&&&&&&&&&    %%%%%%%%%%

(   By ~Aryan Maurya Mr.perfect https://amsrportfolio.netlify.app  )

          @@@@@@@@@@    &&&&&&&&&&&&&&&&&&&    %%%%%%%%%%

    #############################################################

*/