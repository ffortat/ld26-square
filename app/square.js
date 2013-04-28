function Square(x, y, lives, level) {
	var self = this;

	this.level = level;

	this.tilewidth = level.tile.width;
	this.tileheight = level.tile.height;

	this.x = x * this.tilewidth + this.tilewidth / 2;
	this.y = y * this.tileheight + this.tileheight / 2;

	this.animations = {};
	this.currentanimation = '';
	this.currentframe = 0;
	this.mirror = false;
	this.forward = true;
	this.animationrunning = false;
	this.animationtimer = 0;
	this.framelength = 0;
	this.tilesets = [];
	this.tiles = {};

	this.jump = {
		height : 0,
		length : 0
	}
	this.falling = false;
	this.fall = {
		height : 0,
		length : 0,
		gravity : 1500,
		velocity : 0
	};
	this.state = states.standing;

	this.lives = lives;
	this.dead = false;
	this.loaded = false;

	load.json('animations/square.json', function (data) {self.init(data);});
}

Square.prototype.init = function(data) {
	var self = this;

	this.animations = data.animations;
	this.currentanimation = this.animations[data.default];

	data.tilesets.forEach(function (tileset, index) {
		this.tilesets[index] = {
			image : new Image(),
			width : tileset.tilewidth,
			height : tileset.tileheight
		}

		load.image('images/' + tileset.file, function (image) {
			self.tilesets[index].image = image;
		});

		for (var i = 0; i < tileset.imageheight; i += tileset.tileheight) {
			for (var j = 0; j < tileset.imagewidth; j += tileset.tilewidth) {
				this.tiles[tileset.firstgid + i / tileset.tileheight * (tileset.imagewidth / tileset.tilewidth) + j / tileset.tilewidth] = {
					x : j,
					y : i,
					set : index
				};
			}
		}

	}, this);

	load.ready(function () {
		self.loaded = true;
	});
};

Square.prototype.switchtoanim = function(state, mirror) {
	var canswitch = false;

	if (state === states.running) {
		this.forward = !mirror;
		canswitch = (this.state === states.standing);
	} else if (state === states.standing) {
		canswitch = true;
	} else if (state === states.jumping) {
		if (this.state !== states.jumping) {
			this.jump.height = 0;
			this.jump.length = 0;
			canswitch = (this.state !== states.running);
			if (canswitch) {
				keydown[keys.x] = false;
			}
		}
	} else if (state === states.falling) {
		state = states.standing;
		if (!this.falling) {
			this.fall.height = this.y;
			this.fall.length = 0;
			this.fall.velocity = 0;
			this.falling = true;
		}
		canswitch = true;
	} else if (state === states.attacking) {
		mirror = !this.forward;
		canswitch = (this.state !== states.running && this.state !== states.attacking);
		if (canswitch) {
			keydown[keys.c] = false;
		}
	}

	if (canswitch) {
		this.state = state;
		this.currentanimation = this.animations[state];
		this.currentframe = 0;
		this.animationtimer = 0;
		this.framelength = 1000 / this.currentanimation.speed;
		this.animationrunning = true;
		this.mirror = !(!mirror);
	}
};

Square.prototype.kill = function() {
	this.dead = true;
	this.lives -= 1;
	this.switchtoanim(states.standing);
	this.animationrunning = false;
	this.falling = false;
	this.level.listeners.kill.forEach(function (listener) {
		listener('square');
	});
};

Square.prototype.tick = function(length) {
	if (this.loaded && !this.dead && !this.level.ending && !this.level.over) {
		var frame = this.currentanimation.frames[this.currentframe];
		this.animationtimer += length;

		if (keydown[keys.x]) {
			this.switchtoanim(states.jumping);
		} else if (keydown[keys.c]) {
			this.switchtoanim(states.attacking);
		} else if (keydown[keys.right]) {
			var x = this.x - frame.points[0].x + this.tilesets[this.tiles[frame.tile].set].width;
			var collision = this.level.collides(x, this.y, {right:true, bottom:this.falling});

			if (!collision.collides) {
				if (this.state !== states.running) {
					this.switchtoanim(states.running);
				}
			}
		} else if (keydown[keys.left]) {
			var x = this.x - frame.points[0].x;
			var collision = this.level.collides(x, this.y, {left:true, bottom:this.falling});

			if (!collision.collides) {
				if (this.state !== states.running) {
					this.switchtoanim(states.running, true);
				}
			}
		}

		if (this.animationrunning) {
			if (this.animationtimer >= this.framelength) {
				this.animationtimer = 0;
				this.currentframe += 1;
				frame = this.currentanimation.frames[this.currentframe];

				if (this.currentframe >= this.currentanimation.frames.length) {
					if (this.currentanimation.loop) {
						this.currentframe = this.currentanimation.loopto;
					} else {
						this.currentframe -= 1;
						frame = this.currentanimation.frames[this.currentframe];
						this.animationrunning = false;
					}
				}

				if (this.state === states.running) {
					if (this.mirror) {
						this.x -= this.tilewidth / this.currentanimation.frames.length;
					} else {
						this.x += this.tilewidth / this.currentanimation.frames.length;
					}
	
					if (!this.animationrunning) {
						var y = this.y - frame.points[0].y + this.tilesets[this.tiles[frame.tile].set].height;
						var collision = this.level.collides(this.x, y, {right:true,left:true,bottom:true});

						if (collision.collides || this.falling) {
							this.switchtoanim(states.standing);
						} else {
							this.switchtoanim(states.falling);
						}
					}
				} else if (this.state === states.jumping) {
					frame = this.currentanimation.frames[this.currentframe];
					var y = this.y - frame.points[0].y + this.tilesets[this.tiles[frame.tile].set].height;
					var collision = this.level.collides(this.x, y, {bottom:true});
			
					this.level.circles.forEach(function (circle) {
						var x = this.x - frame.points[0].x;
						var y = this.y + frame.points[0].y;

						if (circle.collides(x, y, this.tilewidth, this.tileheight)) {
							circle.kill();
						}
					}, this);

					if (collision.collides) {
						var previousy = this.y;
						this.y = collision.height - this.tilesets[this.tiles[frame.tile].set].height + frame.points[0].y;
						this.jump.height += (this.y - previousy);
						this.jump.length += (1000 / this.currentanimation.speed);
					}

					if (!this.animationrunning) {
						this.switchtoanim(states.falling);
						if (this.jump.length > 0) {
							this.fall.velocity = this.jump.height / (this.jump.length / 1000);
						}
					}
				} else if (this.state === states.attacking) {
					this.level.circles.forEach(function (circle) {
						frame = this.currentanimation.frames[this.currentframe];
						var x = this.x + (this.forward ? (this.tilewidth - frame.points[0].x) : -(frame.points[0].x + this.tilewidth));

						if (circle.collides(x, this.y, this.tilewidth, this.tileheight)) {
							circle.kill();
						}
					}, this);

					if (!this.animationrunning) {
						this.switchtoanim(states.standing);
					}
				}
			}
		}

		if (this.falling) {
			this.fall.length += length;
			this.y = this.fall.height + this.fall.velocity * this.fall.length / 1000 + this.fall.gravity * Math.pow(this.fall.length / 1000, 2) / 2;

			frame = this.currentanimation.frames[this.currentframe];
			var y = this.y - frame.points[0].y + this.tilesets[this.tiles[frame.tile].set].height;
			var collision = this.level.collides(this.x, y, {bottom:true});

			if (collision.collides) {
				this.y = collision.height - this.tilesets[this.tiles[frame.tile].set].height + frame.points[0].y;
				this.falling = false;
			}
		}

		this.level.circles.some(function (circle) {
			frame = this.currentanimation.frames[this.currentframe];
			var x = this.x - frame.points[0].x;
			var y = this.y - frame.points[0].y;

			if (circle.collides(x, y, this.tilewidth, this.tileheight)) {
				this.kill();
			}
		}, this);

		this.level.checkfinish(this.x, this.y);
		this.level.updatecamera(this.x, this.y);
	}

	if (this.level.ending || (this.level.ending && this.level.over)) {
		var frame = this.currentanimation.frames[this.currentframe];
		this.animationtimer += length;

		if (this.animationrunning) {
			if (this.animationtimer >= this.framelength) {
				this.animationtimer = 0;
				this.currentframe += 1;
				frame = this.currentanimation.frames[this.currentframe];

				if (this.currentframe >= this.currentanimation.frames.length) {
					this.currentframe = 0;
					frame = this.currentanimation.frames[this.currentframe];

					if (this.level.over) {
						this.animationrunning = false;
						this.level.ending = false;
					}
				}

				if (this.state === states.running) {
					if (this.mirror) {
						this.x -= this.tilewidth / this.currentanimation.frames.length;
					} else {
						this.x += this.tilewidth / this.currentanimation.frames.length;
					}
	
					if (!this.animationrunning) {
						var y = this.y - frame.points[0].y + this.tilesets[this.tiles[frame.tile].set].height;
						var collision = this.level.collides(this.x, y, {right:true,left:true,bottom:true});

						if (collision.collides || this.falling) {
							this.switchtoanim(states.standing);
						} else {
							this.switchtoanim(states.falling);
						}
					}
				}
			}
		}

		if (this.falling) {
			this.fall.length += length;
			this.y = this.fall.height + this.fall.velocity * this.fall.length / 1000 + this.fall.gravity * Math.pow(this.fall.length / 1000, 2) / 2;

			frame = this.currentanimation.frames[this.currentframe];
			var y = this.y - frame.points[0].y + this.tilesets[this.tiles[frame.tile].set].height;
			var collision = this.level.collides(this.x, y, {bottom:true});

			if (collision.collides) {
				this.y = collision.height - this.tilesets[this.tiles[frame.tile].set].height + frame.points[0].y;
				this.falling = false;
			}
		}

		this.level.checkend(this.x, this.y);
		this.level.updatecamera(this.x, this.y);
	}
};

Square.prototype.draw = function(gamewindow) {
	if (this.loaded && !this.dead) {
		var frame = this.currentanimation.frames[this.currentframe];
		var tile = this.tiles[frame.tile];
		var tileset = this.tilesets[tile.set];
		var width = tileset.width;
		var height = tileset.height;
		var x = this.x - frame.points[0].x - gamewindow.x;
		var y = this.y - frame.points[0].y - gamewindow.y;

		if (this.mirror) {
			context.save();
			context.scale(-1, 1);
			x = -x - 1.5 * this.tilewidth;
		}

		context.drawImage(tileset.image, tile.x, tile.y, width, height, x, y, width, height);

		if (this.mirror) {
			context.restore();
		}
	}
};