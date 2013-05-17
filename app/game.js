function Game() {
	this.levels = 1;
	this.currentlevel = 1;
	this.level = {};
	this.hud = {};

	this.win = false;
	this.loose = false;
	this.intro = false;
	this.paused = false;

	this.init('level1');
}

Game.prototype.init = function(level) {
	var self = this;

	this.launch(level);

	this.level.on('loose', function () {
		setTimeout(function () {
			self.init('level1');
			self.loose = true;
			self.level.music.pause();
			// self.level.music.currentTime = 0;
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
			self.level.music.pause();
			// self.level.music.currentTime = 0;
		} else {
			self.currentlevel += 1;
			self.level.music.pause();
			// self.level.music.currentTime = 0;
			self.init('level' + self.currentlevel);
			self.startlevel();
		}
	});
};

Game.prototype.launch = function(level) {
	this.level = new Level(level);
	this.hud = new Hud(this.level);
};

Game.prototype.startlevel = function() {
	var self = this;
	this.intro = true;
	setTimeout(function () {
		self.intro = false;
		self.level.music.play();
	}, 1000);
};

Game.prototype.pause = function() {
	this.paused = true;
};

Game.prototype.resume = function() {
	this.paused = false;
};

Game.prototype.tick = function(length) {
	if (!this.intro && !this.paused) {
		this.level.tick(length);
		this.hud.tick();
	}

	if (this.win) {
		if (keydown[keys.escape]) {
			current = menu;
			this.win = false;
			this.init('level' + this.currentlevel);
		}
	} else {
		if (this.paused) {
			if (keydown[keys.escape]) {
				this.resume();
				keydown[keys.escape] = false;
			}
		} else {
			if (keydown[keys.escape]) {
				this.pause();
				keydown[keys.escape] = false;
			}
		}
	}

	this.draw();
};

Game.prototype.draw = function() {
	context.save()

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

		context.fillText('YOU LOSE !', canvas.width / 2, canvas.height / 2);
	} else if (this.intro) {
		context.font = '100px Arial';
		context.fillStyle = '#000000';
		context.textAlign = 'center';
		context.textBaseline = 'middle';

		context.fillText('LEVEL ' + this.currentlevel, canvas.width / 2, canvas.height / 2);
	} else if (this.paused) {
		context.font = '100px Arial';
		context.fillStyle = '#000000';
		context.textAlign = 'center';
		context.textBaseline = 'middle';

		context.fillText('PAUSE', canvas.width / 2, canvas.height / 2);
	} else {
		this.level.draw();
		this.hud.draw();
	}

	context.restore();
};
