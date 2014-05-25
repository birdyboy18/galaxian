---
layout: post
categories:
- html5
excerpt: "This post is about setting up the basics of the game and how I modified the tutorial I was following so that I had a cool parallax background effect going on afterwards"
---

# The code we were given is uncool and confusing

I don't have anything against the game we've been tasked with making. I do have a problem with the code we've been given. It's confusing and I find the naming conventions inside of it confusing. It does make sense to split it up into multiple files for readability but the engine and game seem similar and I feel should be placed into one big file and that the level stuff should be kept seperate. That makes total Logical sense.

My next problem with it, is that it's outright confusing and also nearly 4 years out of date. The guy uses `setTimeout` to control the game loop, thats bad for performance and continues to run even when you're not on the tab. Browser vendors know of this and made a feature called request animation frame. This is much better for performance. That said, I can't blame the guy. He did make this when canavs had just come into existance and did a good job with what he had.

This however, is bad for us. Most of the group look at this and are really truly confused, even I am and I have a fairly good understanding of Javascript.

# Making my own version

Because of this, I've decided to make my own version from scratch, well. I say from scrath, more like I'm going to follow a tutorial and make modifications as need. This is what the post is about. The documentation of my understanding of making this game and where i've made changes that are out of the scope of the tutorial i'm following. Expect code snippets and the rest now, and in future posts.

[The tutorial i'm following to make this game can be found here](http://blog.sklambert.com/html5-canvas-game-panning-a-background/) and is seperated into 4 parts. At this moment in time i'm only upto part 2 but plan on doing more soon. After that it's up to me to code in all the new stuff.

# Panning the background

The first part of the tutorial explains how to set up most of the building blocks of the game and then how to make a panning background, to save me having to explain it all, if you head to the tutorial then you'll find that my code is very similar to this, albiet certain things such as the naming of things such as my `imageRepositry` is call `imgRepo` in my code just for personal preference and `context` is often abreviated to `ctx`.

# making the background object

The background object works by inheriting from the Drawable object which you should be able to see in the following code snippet. The difference in my version of background over the tutorial is that I passed in two parameters, in this case the image I want to draw to the canvas, and the speed and which I want it to be moved at. This was so that I could have more than one background being drawn at any moment and then move them at different speeds in its draw method.
{% highlight javascript %}
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
{% endhighlight %}

# Using the object in the game

Now that we've made the background object, we just need to define and use them. The following codes shows you that I have set it up in the `Game.init()` method of the game and that I actually make two backgrounds called `background1` and `background2`. These are defined by the images stored in the `imgRepo` and then I pass them different speeds that I want to draw them at, in this case the first background is drawn 10 times faster than the second one creating a sense of depth or parallax effect.
{% highlight javascript %}
/**
	A Game object which will hold all the objects and data for the game
*/

function Game() {

	//First check to see if canvas is supported and if so get everything, if not stop the script
	this.init = function() {
		//Get the background canvas
		this.bgCanvas = document.getElementById('background');

		// Test if it can get the context
		if (this.bgCanvas.getContext) {
			this.bgCtx = this.bgCanvas.getContext('2d');

			//Intialise all the objects we shall need
			Background.prototype.ctx = this.bgCtx;
			Background.prototype.canvasWidth = this.bgCanvas.width;
			Background.prototype.canvasHeight = this.bgCanvas.height;

			//Initilise the new background objects
			this.background1 = new Background(imgRepo.background1,10);
			this.background1.init(0,0);

			this.background2 = new Background(imgRepo.background2,1);
			this.background2.init(0,0);

			return true;
		} else {
			return false;
		}
	}

	this.start = function() {
		animate();
	}
}
{% endhighlight %}

# Whats next?

Next time in my blog post, i'm going to be drawing the player ship and drawing that to the canvas, specifically, it's own canvas for performance and speed.
