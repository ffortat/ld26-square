function Square(x, y, lives, level) {
	var self = this;

	this.level = level;

	this.tilewidth = level.tile.width;
	this.tileheight = level.tile.height;

	this.x = x * this.tilewidth + this.tilewidth / 2;
	this.y = y * this.tileheight + this.tileheight / 2;

	this.sfx = new Audio();
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
		height : -1.8 * this.tileheight,
		length : 166
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

	this.runstart = 0;
	this.runlast = 0;

	load.json('animations/square.json', function (data) {self.init(data);});
}

Square.prototype.init = function(data) {
	var self = this;

	// audio.sfx('audio/run.wav', function (sfx) {
	// 	self.sfx = sfx;
	// });

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
					set : index,
					width : tileset.tilewidth,
					height : tileset.tileheight
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
		if (canswitch) {
			this.runstart = new Date().getTime();
			this.runlast = this.runstart;
		}
	} else if (state === states.standing) {
		canswitch = true;
	} else if (state === states.jumping) {
		if (this.state !== states.jumping) {
			canswitch = (this.state !== states.running);
			if (canswitch) {
				keydown[keys.x] = false;
			}
		}
	} else if (state === states.falling) {
		state = states.standing;
		if (!this.falling) {
			this.resetfall();
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

Square.prototype.resetfall = function() {
	this.fall.height = this.y;
	this.fall.length = 0;
	this.fall.velocity = 0;
	this.falling = true;
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
		var tile = this.tiles[frame.tile];
		var x = this.x - this.tilewidth / 2;
		var y = this.y - this.tileheight / 2;
		var dx = 0;
		var dy = 0;
		var width = 0;
		var height = 0;
		var collision = {};
		this.animationtimer += Math.min(1000/60, length);

		if (keydown[keys.x]) {
			dy = this.tileheight / 2;
			collision = this.level.collides(x, y - dy, this.tileheight, this.tilewidth)

			if (!collision.collides) {
				this.switchtoanim(states.jumping);
			}
		} else if (keydown[keys.c]) {
			this.switchtoanim(states.attacking);
		} else if (keydown[keys.right]) {
			dx = this.tilewidth / this.animations['running'].frames.length;
			collision = this.level.collides(x + dx, y, this.tilewidth, this.tileheight);

			if (!collision.collides) {
				if (this.state !== states.running) {
					this.switchtoanim(states.running);
				}
			}
		} else if (keydown[keys.left]) {
			dx = - this.tilewidth / this.animations['running'].frames.length;
			collision = this.level.collides(x + dx, y, this.tilewidth, this.tileheight);

			if (!collision.collides) {
				if (this.state !== states.running) {
					this.switchtoanim(states.running, true);
				}
			}
		}

		if (this.animationrunning) {
			if (this.animationtimer >= this.framelength) {
				this.animationtimer -= 1000/60;
				this.currentframe += 1;

				if (this.currentframe >= this.currentanimation.frames.length) {
					if (this.currentanimation.loop) {
						this.currentframe = this.currentanimation.loopto;
					} else {
						this.currentframe -= 1;
						this.animationrunning = false;
					}
				}

				frame = this.currentanimation.frames[this.currentframe];
				tile = this.tiles[frame.tile];

				if (this.state === states.running) {
					this.runlast = new Date().getTime();
					if (this.mirror) {
						this.x -= this.tilewidth / this.currentanimation.frames.length;
					} else {
						this.x += this.tilewidth / this.currentanimation.frames.length;
					}

					if (!this.animationrunning) {
						x = this.x - this.tilewidth / 2;
						dy = this.tileheight / 2;
						collision = this.level.collides(x, y + dy, this.tilewidth, this.tileheight);

						if (collision.collides || this.falling) {
							this.switchtoanim(states.standing);
							if (collision.collides) {
								this.sfx.play();
							}
						} else {
							this.switchtoanim(states.falling);
						}
					} else if (!this.falling) {
						if ((this.forward && this.x % this.tilewidth < this.tilewidth / 2) ||
								(!this.forward && this.x % this.tilewidth > this.tilewidth / 2)) {
							this.resetfall();
						}
					}
				} else if (this.state === states.jumping) {
					height = tile.height - frame.points[0].y + this.tileheight / 2;
					collision = this.level.collides(x, y, this.tilewidth, height);
					var hitx = x + 1;
					var hity = y + this.tileheight;
			
					this.level.circles.forEach(function (circle) {
						if (circle.collides(hitx, hity, this.tilewidth - 2, height - this.tileheight)) {
							circle.kill();
						}
					}, this);

					if (collision.collides) {
						var row = 0;
						collision.tiles.some(function (line, index) {
							row = index;
							return line.some(function (col) {
								return col;
							}, this);
						}, this);

						if (row === 0) {
							var realy = (Math.floor(Math.round(y) / this.tileheight) + 1) * this.tileheight;
							this.y = realy + this.tileheight / 2;
						} else {
							var realy = (Math.floor(Math.round(y) / this.tileheight) + row) * this.tileheight;
							this.y = realy - tile.height + frame.points[0].y;
							this.falling = false;
						}

						y = this.y - this.tileheight / 2;
					} else if (!this.falling) {
						this.falling = true;
						this.resetfall();
						if (this.jump.length > 0) {
							this.fall.velocity = this.jump.height / (this.jump.length / 1000);
						}
					}

					if (!this.animationrunning) {
						if (this.falling) {
							this.switchtoanim(states.standing);
						} else {
							this.switchtoanim(states.falling);
							if (this.jump.length > 0) {
								this.fall.velocity = this.jump.height / (this.jump.length / 1000);
							}
						}
					}
				} else if (this.state === states.attacking) {
					width = tile.width - frame.points[0].x + this.tilewidth / 2;

					if (this.mirror) {
						x -= (width - this.tilewidth)
					}

					collision = this.level.collides(x, y, width, this.tileheight);

					if (collision.collides) {
						var col = 0;
						collision.tiles.some(function (line) {
							return line.some(function (column, index) {
								col = index;
								return column;
							}, this);
						}, this);

						if (col === 0) {
							if (this.mirror) {
								var realx = (Math.floor(Math.round(x) / this.tilewidth) + 1) * this.tilewidth;
								this.x = realx + width - this.tilewidth / 2;
								x = realx;
							}
						} else {
							var realx = (Math.floor(Math.round(x) / this.tilewidth) + col) * this.tilewidth;
							this.x = realx - tile.width + frame.points[0].x;
							x = this.x - this.tilewidth / 2;
						}
					}

					var hitx = x + this.tilewidth;
					var hity = y + 1

					if (this.mirror) {
						hitx = x - this.tilewidth;
					}

					this.level.circles.forEach(function (circle) {
						if (circle.collides(hitx, hity, width - this.tilewidth, this.tileheight - 2)) {
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
			y = this.y - this.tileheight / 2;

			collision = this.level.collides(x, y, this.tilewidth, this.tileheight);

			if (collision.collides) {
				var row = 0;
				collision.tiles.some(function (line, index) {
					row = index;
					return line.some(function (col) {
						return col;
					}, this);
				}, this);

				if (row === 0) {
					var realy = (Math.floor(Math.round(y) / this.tileheight) + 1) * this.tileheight;
					this.y = realy + this.tileheight / 2;
					this.resetfall();
				} else {
					var realy = (Math.floor(Math.round(y) / this.tileheight) + row) * this.tileheight;
					this.y = realy - tile.height + frame.points[0].y;
					this.falling = false;
					this.sfx.play();
				}

				y = this.y - this.tileheight / 2;
			}
		}

		this.level.circles.some(function (circle) {
			if (circle.collides(x, y, this.tilewidth, this.tileheight)) {
				this.kill();
			}
		}, this);

		this.level.checkfinish(this.x, this.y);
		this.level.updatecamera(this.x, this.y);
	}

	if (this.level.ending || (this.level.ending && this.level.over)) {
		var frame = this.currentanimation.frames[this.currentframe];
		var tile = this.tiles[frame.tile];
		this.animationtimer += length;

		if (this.animationrunning) {
			if (this.animationtimer >= this.framelength) {
				this.animationtimer = 0;
				this.currentframe += 1;

				if (this.currentframe >= this.currentanimation.frames.length) {
					this.currentframe = 0;

					if (this.level.over) {
						this.animationrunning = false;
						this.level.ending = false;
					}
				}

				frame = this.currentanimation.frames[this.currentframe];

				if (this.state === states.running) {
					if (this.mirror) {
						this.x -= this.tilewidth / this.currentanimation.frames.length;
					} else {
						this.x += this.tilewidth / this.currentanimation.frames.length;
					}
	
					if (!this.animationrunning) {
						var y = this.y - frame.points[0].y + tile.height;
						var collision = this.level.collides(this.x, y, this.tilewidth, this.tileheight);

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

			var x = this.x - this.tilewidth / 2;
			var y = this.y - this.tileheight / 2;
			var collision = this.level.collides(x, y, this.tilewidth, this.tileheight);

			if (collision.collides) {
				var row = 0;
				collision.tiles.some(function (line, index) {
					row = index;
					return line.some(function (col) {
						return col;
					}, this);
				}, this);

				var realy = (Math.floor(Math.round(y) / this.tileheight) + row) * this.tileheight;
				this.y = realy - tile.height + frame.points[0].y;
				this.falling = false;
			}
		}

		this.level.checkend(this.x, this.y);
		this.level.updatecamera(this.x, this.y);
	}

	length -= 1000/60;

	if (length > 0) {
		this.tick(length);
	}
};

Square.prototype.draw = function(gamewindow) {
	if (this.loaded && !this.dead) {
		var frame = this.currentanimation.frames[this.currentframe];
		var tile = this.tiles[frame.tile];
		var tileset = this.tilesets[tile.set];
		var width = tileset.width;
		var height = tileset.height;
		var x = - frame.points[0].x;
		var y = - frame.points[0].y;

		context.save();
		context.translate(this.x - gamewindow.x, this.y - gamewindow.y);

		if (this.mirror) {
			context.save();
			context.scale(-1, 1);
		}

		context.drawImage(tileset.image, tile.x, tile.y, width, height, x, y, width, height);

		if (this.mirror) {
			context.restore();
		}

		context.restore();
	}
};