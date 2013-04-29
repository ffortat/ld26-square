function Level(name) {
	var self = this;

	this.json = {};
	this.window = {
		x : 0,
		y : 0,
		w : 800,
		h : 480
	};

	this.tiles = {};
	this.tilesets = [];
	this.layers = [];
	this.width = 0;
	this.height = 0;
	this.tile = {
		width : 0,
		height : 0
	};

	this.origin = {x:0,y:0};
	this.square = {};
	this.circles = [];
	this.finishline = {};
	this.finish = {};
	this.end = -1;

	this.loaded = false;
	this.listeners = {
		ready : [],
		kill : [],
		loose : [],
		win : []
	};
	this.next = {
		ready : [],
		kill : []
	};

	this.ending = false;
	this.over = false;

	load.json('levels/' + name + '.json', function (data) {self.init(data);});
}

Level.prototype.init = function(level) {
	var self = this;

	var squareid = -1;
	var circleid = -1;
	var finishid = -1;
	var endid = -1;

	this.json = level;

	level.tilesets.forEach(function (tileset, index) {
		if (tileset.name === 'Finish') {
			for (var i = tileset.firstgid; i < tileset.firstgid + 4; i += 1) {
				this.finishline[i] = true;
			}
		}

		if (tileset.name === 'Placeholders') {
			squareid = tileset.firstgid;
			circleid = tileset.firstgid + 1;
			finishid = tileset.firstgid + 2;
			endid = tileset.firstgid + 3;
		} else {
			var filename = tileset.image;
			var uri = 'images' + filename.substr(filename.lastIndexOf('/'));

			this.tilesets[index] = {
				image : new Image(),
				width : tileset.tilewidth,
				height : tileset.tileheight
			};

			load.image(uri, function (image) {
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
		}
	}, this);

	this.layers = level.layers;
	this.width = level.width;
	this.height = level.height;
	this.tile.width = level.tilewidth;
	this.tile.height = level.tileheight;

	level.layers.some(function (layer) {
		if (layer.name === 'Placeholders') {
			layer.data.forEach(function (tileid, index) {
				var x = index % layer.width;
				var y = Math.floor(index / layer.width);

				if (tileid === squareid) {
					this.origin.x = x * level.tilewidth + level.tilewidth / 2;
					this.origin.y = y * level.tileheight + level.tileheight / 2;
					this.square = new Square(x, y, level.properties.squares, this);
				} else if (tileid === circleid) {
					this.circles.push(new Circle(x, y, this));
				} else if (tileid === finishid) {
					this.finish[index] = true;
				} else if (tileid === endid) {
					this.end = index;
				}
			}, this);

			return true;
		}
	}, this);

	this.on('kill', function (type) {
		if (type === 'square') {
			if (self.square.lives > 0) {
				setTimeout(function () {
					self.square.x = self.origin.x;
					self.square.y = self.origin.y;
					self.updatecamera(self.origin.x, self.origin.y);
					self.square.dead = false;
				}, 1000);
			} else {
				self.loose();
			}
		}
	});

	load.ready(function () {
		self.loaded = true;
		self.listeners.ready.forEach(function (listener) {
			listener();
		});
		while (self.next.ready.length > 0) {
			(self.next.ready.shift())();
		}
	});
};

Level.prototype.on = function(event, callback) {
	if (this.listeners[event]) {
		this.listeners[event].push(callback);
	}
};

Level.prototype.ready = function(callback) {
	if (!this.loaded) {
		this.next.ready.push(callback);
	} else {
		callback();
	}
};

Level.prototype.loose = function() {
	this.listeners.loose.forEach(function (listener) {
		listener();
	});
};

Level.prototype.win = function() {
	this.listeners.win.forEach(function (listener) {
		listener();
	});
};

Level.prototype.updatecamera = function(x, y) {
	this.window.x = Math.min(Math.max(0, x - canvas.width / 2), this.width * this.tile.width - canvas.width);
	this.window.y = Math.min(Math.max(0, y - canvas.height / 2), this.height * this.tile.height - canvas.height);
};

Level.prototype.collides = function(x, y, check) {
	var collides = false;
	var height = 0;
	var width = 0;

	x = Math.floor(x / this.tile.width);
	y = Math.floor(y / this.tile.height);

	var index = y * this.width + x;

	this.layers.forEach(function (layer) {
		collides = collides || (layer.visible && layer.data[index] !== 0 && !this.finishline[layer.data[index]]);
	}, this);

	if (collides) {
		if (check.bottom) {
			height = y * this.tile.height;
		}
	}

	return {
		collides : collides,
		height : height,
		width : width
	}
};

Level.prototype.checkfinish = function(x, y) {
	x = Math.floor(x / this.tile.width);
	y = Math.floor(y / this.tile.height);

	var index = y * this.width + x;

	if (this.finish[index]) {
		this.ending = true;
	}
};

Level.prototype.checkend = function(x, y) {
	var self = this;

	x = Math.floor(x / this.tile.width);
	y = Math.floor(y / this.tile.height);

	var index = y * this.width + x;

	if (this.end === index) {
		this.over = true;

		setTimeout(function () {
			self.win();
		}, 2000);
	}
};

Level.prototype.tick = function(length) {
	if (this.loaded) {
		this.circles.forEach(function (circle) {
			circle.tick(length);
		}, this)
		this.square.tick(length);

		if (keydown[keys.r]) {
			this.square.kill()
			this.square.lives += 1;
		}
	}
};

Level.prototype.draw = function() {	
	if (this.loaded) {
		this.layers.forEach(function (layer) {
			if (layer.visible) {
				layer.data.forEach(function (tileid, index) {
					if (tileid > 0) {
						var tile = this.tiles[tileid];
						var tileset = this.tilesets[tile.set];
						var width = tileset.width;
						var height = tileset.height;
						var x = index % this.width * this.tile.width - this.window.x;
						var y = Math.floor(index / this.width) * this.tile.height - this.window.y;
						context.drawImage(tileset.image, tile.x, tile.y, width, height, x, y, width, height);
					}
				}, this);
			}
		}, this);

		this.circles.forEach(function (circle) {
			circle.draw(this.window);
		}, this)
		this.square.draw(this.window);
	}
};