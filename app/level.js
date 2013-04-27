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

	this.loaded = false;

	load.json('levels/' + name + '.json', function (data) {self.init(data);});
}

Level.prototype.init = function(level) {
	var self = this;

	this.json = level;

	level.tilesets.forEach(function (tileset, index) {
		this.tilesets[index] = {
			image : new Image(),
			width : tileset.tilewidth,
			height : tileset.tileheight
		};

		for (var i = 0; i < tileset.imageheight; i += tileset.tileheight) {
			for (var j = 0; j < tileset.imagewidth; j += tileset.tilewidth) {
				this.tiles[tileset.firstgid + i / tileset.tileheight * (tileset.imagewidth / tileset.tilewidth) + j / tileset.tilewidth] = {
					x : j,
					y : i,
					set : index
				};
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
	}
};