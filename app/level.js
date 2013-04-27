function Level(name) {
	var self = this;

	this.json = {};
	this.window = {
		x : 0,
		y : 0,
		w : 800,
		h : 480
	};

	this.tilesets = [];
	this.layers = [];
	this.width = 0;
	this.height = 0;
	this.tile = {
		width : 0,
		height : 0
	};

	this.loaded = false;

	load.json('levels/' + name + '.json', function (data) {self.init(data);});
}

Level.prototype.init = function(level) {
	var self = this;

	this.json = level;

	level.tilesets.forEach(function (tileset, index) {
		this.tilesets[index] = {
			image : new Image(),
			tiles : [null],
			width : tileset.tilewidth,
			height : tileset.tileheight
		};

		for (var i = 0; i < tileset.imageheight; i += tileset.tileheight) {
			for (var j = 0; j < tileset.imagewidth; j += tileset.tilewidth) {
				this.tilesets[index].tiles.push({
					x : j,
					y : i
				});
			}
		}

		var filename = tileset.image;
		var uri = 'images' + filename.substr(filename.lastIndexOf('/'));

		load.image(uri, function (image) {
			self.tilesets[index].image = image;
		});
	}, this)

	this.layers = level.layers;
	this.width = level.width;
	this.height = level.height;
	this.tile.width = level.tilewidth;
	this.tile.height = level.tileheight;

	load.ready(function () {
		self.loaded = true;
	});
};

Level.prototype.tick = function(length) {
	if (this.loaded) {

	}
};

Level.prototype.draw = function() {	
	if (this.loaded) {
		var tileset = this.tilesets[0];
		var width = tileset.width;
		var height = tileset.height;

		this.layers.forEach(function (layer) {
			if (layer.visible) {
				layer.data.forEach(function (tile, index) {
					if (tile > 0) {
						var x = index % this.width * this.tile.width - this.window.x;
						var y = Math.floor(index / this.width) * this.tile.height - this.window.y;
						context.drawImage(tileset.image, tileset.tiles[tile].x, tileset.tiles[tile].y, width, height, x, y, width, height);
					}
				}, this);
			}
		}, this);
	}
};