function Level(name) {
	var self = this;

	this.window = {
		x : 0,
		y : 0,
		w : 800,
		h : 480
	};
	this.json = {};
	this.collisions

	load.json('levels/' + name + '.json', this.init)
}

Level.prototype.init = function(level) {
	this.json = level;
};

Level.prototype.tick = function(length) {
};

Level.prototype.draw = function() {	
};