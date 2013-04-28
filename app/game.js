function Game() {
	// this.level = new Level('prototype');
	this.level = new Level('level1');
}

Game.prototype.tick = function(length) {
	this.level.tick(length);
	// this.hud.tick();

	this.draw();
};

Game.prototype.draw = function() {
	this.level.draw();
	// this.hud.draw();
};