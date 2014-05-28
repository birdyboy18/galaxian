/**
	An object that holds all the images for the game so that they are loaded only once
	This object is created around teh singleton pattern
*/

var imgRepo = new function() {
	// Define Images
	this.background1 = new Image();
	this.background2 = new Image();
	this.ship = new Image();
	this.bullet = new Image();
	this.enemy = new Image();
	this.enemyBullet = new Image();

	var numImgs = 6;
	var numLoaded = 0;

	function imgLoaded() {
		numLoaded++;
		if (numLoaded === numImgs) {
			window.init();
		}
	}

	this.background1.onload = function() {
		imgLoaded();
	}

	this.background2.onload = function() {
		imgLoaded();
	}

	this.ship.onload = function() {
		imgLoaded();
	}

	this.bullet.onload = function() {
		imgLoaded();
	}

	this.enemy.onload = function() {
		imgLoaded();
	}

	this.enemyBullet.onload = function() {
		imgLoaded();
	}

	//Set img source
	this.background1.src = "images/bg1.png";
	this.background2.src = "images/bg2.png";
	this.ship.src = "images/ship.png";
	this.bullet.src = "images/bullet.png";
	this.enemy.src = "images/alienShip.png";
	this.enemyBullet.src = "images/alienBullet.png";

}

/**
	Create an object that is the base class for anything else I want to be drawable
	This sets default variables and child objects
	This is known as an abstract object pattern
*/

function Drawable() {
	this.init = function(x,y, width, height) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	};
	this.speed = 0;
	this.canvasWidth = 0;
	this.canvasHeight = 0;

	this.draw = function() {

	};
}

/**
	QuadTree Object
	The Quadtree allows faster collision detection in the game by reducing the amount of
	check the game nees to do based on what quadrant the object is in and any surrouding
	objects that it could collide with.

	The quadrant indexes are as followed:

			|
		1	|	0
	--------|-------
		2	|	3
			|
*/

function QuadTree(boundBox,lvl) {
	var maxObjects = 10;
	this.bounds = boundBox || {
		x:0,
		y:0,
		width: 0,
		height:0
	};
	var objects = [];
	this.nodes = [];
	var level = lvl || 0;
	var maxLevels = 5;
	/**
		Clears all the nodes of the QuadTree except for the objects, we want to keep those
	*/
	this.clear = function() {
		objects = [];
		for ( var i = 0; i < this.nodes.length; i++) {
			this.nodes[i].clear();
		}
		this.nodes = [];
	};
	/**
		This function will get all of the objects in the quadtree and return them
		passing it back to the function so that you can use it
	*/
	this.getAllObjects = function(returnedObjects) {
		for (var i = 0; i < this.nodes.length; i++) {
			this.nodes[i].getAllObjects(returnedObjects);
		}
		for (var i = 0; len = objects.length; i < len; i++) {
			returnedObjects.push(objects[i]);
		}
		return returnedObjects;
	};
	/**
		This function returns all the objects that the given object might actually collide with
	*/
	this.findObjects = function(returnedObjects, obj) {
		if (typeof obj === 'undefined') {
			console.log("UNDEFINED OBJECT");
			return;
		}
		var index = this.getIndex(obj);
		if (index != -1 && this.nodes.length) {
			this.nodes[index].findObjects(returnedObjects, obj);
		}
		for (var i = 0; len = objects.length; i < len; i++) {
			returnedObjects.push(objects[i]);
		}
		return returnedObjects;
	};
	/**
		This will insert an object into a QuadTree. If the tree is
		bigger than the capacity then it will split it up and add all the objects to the right nodes in the tree
	*/
	this.insert = function(obj) {
		if (typeof obj === 'undefined') {
			return;
		}
		if (obj instanceof Array) {
			for (var i = 0; len = obj.length; i < len; i++) {
				this.insert(obj[i]);
			}
			return;
		}
		if (this.nodes.length) {
			var index = this.getIndex(obj);
			if (index != -1) {
				this.nodes[index].insert(obj);
				return;
			}
		}
		objects.push(obj);
		//Prevent infinite splitting
		if (objects.length > maxObjects && level < maxLevels) {
			if (this.nodes[0] = null) {
				this.split();
			}
			var i = 0;
			while (i < objects.length) {
				var index = this.getIndex(objects[i]);
				if (index != -1) {
					this.nodes[index].insert((objects.splice(i,1))[0]);
				} else {
					i++;
				}
			}
		}
	};
	/**
		A function that determines which node the object belongs to, -1 means it doesn't fit
		and is part of the current node
	*/
	this.getIndex = function(obj) {
		var index = -1;
		var verticalMidpoint = this.bounds.x + this.bounds.width/2;
		var horizontalMidpoint = this.bounds.y + this.bounds.height/2;
		// The Object can fit completely into the top quadrant
		var topQuadrant = (obj.y < horizontalMidpoint && obj.y + obj.height < horizontalMidpoint);
		// The object can fit completlty into the bottom quadrant
		var bottomQuadrant = (obj.y > horizontalMidpoint);
		// The object is capable of fitting completely within the left quadrants
		if (obj.x < verticalMidpoint && obj.x + obj.width < verticalMidpoint) {
			if (topQuadrant) {
				index = 1;
			}
			else if (bottomQuadrant) {
				index = 2;
			}
		}

		//The Object can fit into the right quadrant
		else if (obj.x > verticalMidpoint) {
			if (topQuadrant) {
				index = 0;
			}
			else if (bottomQuadrant) {
				index = 3;
			}
		}
		return index;
	};
	/**
		This function splits a node into 4 more subnodes
	*/
	this.split = function() {
		var subWidth = (this.bounds.width / 2) | 0;
		var subHeight = (this.bounds.height / 2) | 0;

		this.nodes[0] = new QuadTree({
			x: this.bounds.x + subWidth,
			y: this.bounds.y,
			width: subWidth,
			height: subHeight
		}, level+1);
		this.nodes[1] = new QuadTree({
			x: this.bounds.x,
			y: this.bounds.y,
			width: subWidth,
			height: subHeight
		}, level+1);
		this.nodes[2] = new QuadTree({
			x: this.bounds.x,
			y: this.bounds.y + subHeight,
			width: subWidth,
			height: subHeight
		}, level+1);
		this.nodes[3] = new QuadTree({
			x: this.bounds.x + subWidth,
			y: this.bounds.y + subHeight,
			width: subWidth,
			height: subHeight
		}, level+1);
	};
}

/**
	Create a background object that is a child of drawable.
	This will be drawn onto the background canvas and creates the illusion of a panning background
	This is able to create multiple backgroun images, so it takes two parameters, the speed to move it at and which image we want to draw
*/

function Background(img,speed) {
	this.speed = speed;

	this.draw = function() {
		this.y += this.speed;
		//Draw the first layer on
		this.ctx.drawImage(img, this.x, this.y);
		//This enables the creation of an infinite feel
		this.ctx.drawImage(img, this.x, this.y - this.canvasHeight);

		if (this.y >= this.canvasHeight) {
			this.y = 0;
		}
	}
}

Background.prototype = new Drawable();

/**
	Make an object pool object. In this case this holds the bullets for the game
	they can be reused when off the screen, this will make it easier and run much faster
*/

function Pool(maxSize) {
	var size = maxSize;
	var pool = [];

	//Put bullets in the pool
	this.init = function(object) {
		if (object == "bullet") {
			for (i = 0; i < size; i++) {
				var bullet = new Bullet("bullet");
				bullet.init(0,0, imgRepo.bullet.width, imgRepo.bullet.height);
				pool[i] = bullet;
			}
		} else if (object == "enemy") {
			for (i = 0; i < size; i++) {
				var enemy = new Enemy();
				enemy.init(0,0, imgRepo.enemy.width, imgRepo.enemy.height);
				pool[i] = enemy;
			}
		} else if (object == "enemyBullet") {
			for (i = 0; i < size; i++) {
				var bullet = new Bullet("enemyBullet");
				bullet.init(0,0, imgRepo.enemyBullet.width, imgRepo.enemyBullet.height);
				pool[i] = bullet;
			}
		}
	};

	this.get = function(x,y,speed) {
		if(!pool[size - 1].alive) {
			pool[size - 1].spawn(x,y,speed);
			pool.unshift(pool.pop());
		}
	};

	this.getTwo = function(x1,y1,speed,x2,y2,speed2) {
		if(!pool[size - 1].alive && !pool[size - 2].alive) {
			this.get(x1,y1,speed);
			this.get(x2,y2,speed2);
		}
	};

	this.animate = function() {
		for (i = 0; i < size; i++) {
			//if the bullet is alive then draw it
			if (pool[i].alive) {
				if (pool[i].draw()) {
					pool[i].clear();
					pool.push((pool.splice(i,1))[0]);
				}
			}
			else
				break;
		}
	};
}

function Bullet(object) {
	this.alive = false; //If it is alive then its in use - we can't use it
	var self = object;

	this.spawn = function(x,y,speed) {
		this.x = x;
		this.y = y;
		this.speed = speed;
		this.alive = true;
	}

	this.draw = function() {
		//The reason we deduct the starting position of the rectangle and add double that onto the width
		//is so that we don't get an anoying streky trail effect where it's not properly being cleared - 
		//I think this is due to automatic anti-analising
		this.ctx.clearRect(this.x-1,this.y-1,this.width+2,this.height+2);
		this.y -= this.speed;
		if (self === "bullet" && this.y <= 0 - this.height) {
			return true;
		} else if (self === "enemyBullet" && this.y >= this.canvasHeight) {
			return true;
		} else {
			if (self === "bullet") {
				this.ctx.drawImage(imgRepo.bullet, this.x, this.y);
			}

			if (self === "enemyBullet") {
				this.ctx.drawImage(imgRepo.enemyBullet, this.x, this.y);
			}
			return false;
		}
	};

	this.clear = function() {
		this.x = 0;
		this.y = 0;
		this.speed = 0;
		this.alive = false;
	};
}

Bullet.prototype = new Drawable();

function Ship() {
	this.speed = 5;
	this.bulletPool = new Pool(30);
	this.bulletPool.init("bullet");
	var fireRate = 10;
	var counter = 0;
	this.draw = function() {
		this.ctx.drawImage(imgRepo.ship, this.x,this.y);
	};

	this.move = function() {
		counter++;

		if (KEY_STATUS.left || KEY_STATUS.right || KEY_STATUS.down || KEY_STATUS.up) {
			this.ctx.clearRect(this.x,this.y,this.width,this.height);

			if (KEY_STATUS.right) {
				this.x += this.speed;
				if (this.x >= this.canvasWidth - this.width) {
					this.x = this.canvasWidth - this.width;
				}
			} else if (KEY_STATUS.left) {
				this.x -= this.speed;
				if (this.x <= 0) {
					this.x = 0;
				}
			} else if (KEY_STATUS.up) {
				this.y -= this.speed;
				if (this.y <= this.canvasHeight/4*3) {
					this.y = this.canvasHeight/4*3;
				}
			} else if (KEY_STATUS.down) {
				this.y += this.speed;
				if (this.y >= this.canvasHeight - this.height) {
					this.y = this.canvasHeight - this.height;
				}
			}
			this.draw();
		}
		if (KEY_STATUS.space && counter >= fireRate) {
			this.fire();
			counter = 0;
		}
	};

	this.fire = function() {
		this.bulletPool.getTwo(this.x+5,this.y+20,10,this.x+40,this.y+20,10);
	}
}

Ship.prototype = new Drawable();

/**
	An enemy ship object
*/

function Enemy() {
	var percentFire = 0.0001;
	var chance = 0;
	this.alive = false;

	this.spawn= function(x,y,speed) {
		this.x = x;
		this.y = y;
		this.speed = speed;
		this.speedX = 0;
		this.speedY = speed;
		this.alive = true;
		this.leftEdge = this.x -200;
		this.rightEdge = this.x + 100;
		this.bottomEdge = this.y + this.height*5 + 30;
	};
	/**
		Move the enemy
	*/
	this.draw = function() {
		this.ctx.clearRect(this.x-1,this.y,this.width+1,this.height);
		this.x += this.speedX;
		this.y += this.speedY;
		if (this.x <= this.leftEdge) {
			this.speedX = this.speed;
		} else if (this.x >= this.rightEdge + this.canvasWidth) {
			this.speedX = -this.speed;
		} else if (this.y >= this.bottomEdge) {
			this.speed = 1.5;
			this.speedY = 0;
			this.y -= 5;
			this.speedX = -this.speed;
		}

		this.ctx.drawImage(imgRepo.enemy, this.x,this.y);
		//Enemy has a chance to shoot everytime it moves
		chance = Math.floor(Math.random()*101);
		if (chance/100 <= percentFire) {
			this.fire();
		}
	};

	/**
		Fire a bullet
	*/
	this.fire = function() {
		//Grab a bullet and place it at the center of the ships 
		//position and at the front. It's negative speed because we want to go down the screen.
		game.enemyBulletPool.get(this.x+this.width/2,this.y+this.height, -2.5);
	}
	/**
		Clear and reset the position of the enemy
	*/
	this.clear = function() {
		this.x = 0;
		this.y =0;
		this.speed = 0;
		this.speedX = 0;
		this.speedY = 0;
		this.alive = false;
	}
}

Enemy.prototype = new Drawable();

/**
	Key codes mapped to a string when pressed
*/

KEY_CODES = {
	32: 'space',
	37: 'left',
	38: 'up',
	39: 'right',
	40: 'down'
}

KEY_STATUS = {};
for (code in KEY_CODES) {
	KEY_STATUS[KEY_CODES[code]] = false;
}

document.onkeydown = function(e) {
	var keyCode = (e.keyCode) ? e.keyCode : e.charCode;
	if (KEY_CODES[keyCode]) {
		e.preventDefault();
		KEY_STATUS[KEY_CODES[keyCode]] = true;
	}
}

document.onkeyup = function(e) {
	var keyCode = (e.keyCode) ? e.keyCode : e.charCode;
	if (KEY_CODES[keyCode]) {
		e.preventDefault();
		KEY_STATUS[KEY_CODES[keyCode]] = false;
	}
}



/**
	A Game object which will hold all the objects and data for the game
*/

function Game() {

	//First check to see if canvas is supported and if so get everything, if not stop the script
	this.init = function() {
		//Get the background canvas
		this.bgCanvas = document.getElementById('background');
		this.shipCanvas = document.getElementById('ship');
		this.mainCanvas = document.getElementById('main');
		// Test if it can get the context
		if (this.bgCanvas.getContext) {
			this.bgCtx = this.bgCanvas.getContext('2d');
			this.shipCtx = this.shipCanvas.getContext('2d');
			this.mainCtx = this.mainCanvas.getContext('2d');
			//Intialise all the objects we shall need
			Background.prototype.ctx = this.bgCtx;
			Background.prototype.canvasWidth = this.bgCanvas.width;
			Background.prototype.canvasHeight = this.bgCanvas.height;

			Ship.prototype.ctx = this.shipCtx;
			Ship.prototype.canvasWidth = this.shipCanvas.width;
			Ship.prototype.canvasHeight = this.shipCanvas.height;

			Bullet.prototype.ctx = this.mainCtx;
			Bullet.prototype.canvasWidth = this.mainCanvas.width;
			Bullet.prototype.canvasHeight = this.mainCanvas.height;

			Enemy.prototype.ctx = this.mainCtx;
			Enemy.prototype.canavsWidth = this.mainCanvas.width;
			Enemy.prototype.canvasHeight = this.mainCanvas.height;

			//Initilise the new background objects
			this.background1 = new Background(imgRepo.background1,1);
			this.background1.init(0,0);

			this.background2 = new Background(imgRepo.background2,10);
			this.background2.init(0,0);
			//Initilise the ship object
			this.ship = new Ship();

			var shipStartX = this.shipCanvas.width/2 - imgRepo.ship.width;
			var shipStartY = (this.shipCanvas.height/4*3) + imgRepo.ship.height/2;
			this.ship.init(shipStartX,shipStartY,imgRepo.ship.width,imgRepo.ship.height);

			//Make an enemy object pool
			this.enemyPool = new Pool(30);
			this.enemyPool.init("enemy");
			var height = imgRepo.enemy.height;
			var width = imgRepo.enemy.width;
			var x = 200;
			var y = -height;
			var spacer = y -10;
			for (i = 1; i <= 30; i++) {
				this.enemyPool.get(x,y,2);
				x += width + 10;
				if (i % 10 == 0) {
					x = 200;
					y += spacer;
				}
			}
			this.enemyBulletPool = new Pool(50);
			this.enemyBulletPool.init("enemyBullet");

			return true;
		} else {
			return false;
		}
	}

	this.start = function() {
		this.ship.draw();
		animate();
	}
}

/**
	The animation loop
*/

function animate() {
	requestAnimFrame(animate);
	//Since we are drawing two backgrounds we need to clear the canvas only once
	game.bgCtx.clearRect(0,0,game.bgCanvas.width,game.bgCanvas.height);
	game.background1.draw();
	game.background2.draw();
	game.ship.move();
	game.ship.bulletPool.animate();
	game.enemyPool.animate();
	game.enemyBulletPool.animate();
}

window.requestAnimFrame = (function(){
	return  window.requestAnimationFrame   ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame    ||
			window.oRequestAnimationFrame      ||
			window.msRequestAnimationFrame     ||
			function(/* function */ callback, /* DOMElement */ element){
				window.setTimeout(callback, 1000 / 60);
			};
})();

/**
	Initialise the game and start it
*/

var game = new Game();

function init() {
	if(game.init()) {
		game.start();
	}
}














