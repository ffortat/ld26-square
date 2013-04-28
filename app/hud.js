function Hud(level) {
	var self = this;

	this.level = level;

	this.score = 0;
	this.limit = 0;
	this.lives = 0;

	this.loaded = false

	level.ready(function () {self.init();});
}

Hud.prototype.init = function() {
	var self = this;
	this.limit = this.level.circles.length;
	this.lives = this.level.square.lives;

	this.level.on('kill', function (type) {
		if (type === 'circle') {
			self.score += 1;
		}
	});

	this.loaded = true;
};

Hud.prototype.tick = function(length) {
	if (this.loaded) {
	}
};

Hud.prototype.draw = function() {
	if (this.loaded && !this.level.square.dead) {
		var x = this.level.square.x - this.level.window.x;
		var y = this.level.square.y - this.level.window.y - 2;

		context.fillStyle = '#666666';
		context.strokeStyle = '#666666';
		context.lineWidth = 1;
		context.font = '10px Arial';
		context.textAlign = 'right';
		context.textBaseline = 'alphabetic';

		context.fillText(this.level.square.lives, x - 2, y - 2)
		context.strokeRect(x, y - 10, 8, 8);

		context.fillText(this.score + '/' + this.limit, x + 13, y + 10)
	}
};