function Circle(x, y, level) {
	this.level = level;

	this.tilewidth = level.tile.width;
	this.tileheight = level.tile.height;

	this.x = x * this.tilewidth;
	this.y = y * this.tileheight;
}

Circle.prototype.tick = function(length) {
};

Circle.prototype.draw = function(window) {
};