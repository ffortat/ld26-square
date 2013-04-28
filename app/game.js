function Game() {
	this.level = new Level('level1');
	this.hud = new Hud(this.level);

	this.init();
}

Game.prototype.init = function() {
	var self = this;

	this.level.on('loose', function () {
		self.level = new Level('level1');
		self.hud = new Hud(self.level);

		self.init();
	});

	this.level.on('win', function () {
		self.level = new Level('prototype');
	});
};

Game.prototype.tick = function(length) {
	this.level.tick(length);
	this.hud.tick();

	this.draw();
};

Game.prototype.draw = function() {
	this.level.draw();
	this.hud.draw();
};