function Game() {
	this.levels = 1;
	this.currentlevel = 1;
	this.level = {};
	this.hud = {};

	this.win = false;
	this.loose = false;

	this.init('level1');
}

Game.prototype.init = function(level) {
	var self = this;

	this.launch(level);

	this.level.on('loose', function () {
		setTimeout(function () {
			self.init('level1');
			self.loose = true;
			setTimeout(function () {
				current = menu;
				self.loose = false;
			}, 2000);
		}, 1000);
	});

	this.level.on('win', function () {
		if (self.levels === self.currentlevel) {
			self.currentlevel = 1;
			self.win = true;
		} else {
			self.currentlevel += 1;
			self.init('level' + self.currentlevel);
		}
	});
};

Game.prototype.launch = function(level) {
	this.level = new Level(level);
	this.hud = new Hud(this.level);
};

Game.prototype.tick = function(length) {
	this.level.tick(length);
	this.hud.tick();

	this.draw();
};

Game.prototype.draw = function() {
	if (this.win) {
		context.font = '100px Arial';
		context.fillStyle = '#000000';
		context.textAlign = 'center';
		context.textBaseline = 'middle';

		context.fillText('YOU WIN !', canvas.width / 2, canvas.height / 2);
	} else if (this.loose) {
		context.font = '100px Arial';
		context.fillStyle = '#000000';
		context.textAlign = 'center';
		context.textBaseline = 'middle';

		context.fillText('YOU LOOSE !', canvas.width / 2, canvas.height / 2);
	} else {
		this.level.draw();
		this.hud.draw();
	}
};