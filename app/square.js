function Square(x, y, level) {
	this.level = level;

	this.tilewidth = level.tile.width;
	this.tileheight = level.tile.height;

	this.x = x * this.tilewidth;
	this.y = y * this.tileheight;
}

Square.prototype.tick = function(length) {
};

Square.prototype.draw = function(window) {
};