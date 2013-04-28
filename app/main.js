var requestAnimFrame = (function() {
	return window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function (callback) {
			window.setTimeout(callback, 1000/60);
		};
})();

var time = new Date().getTime();
var menu = new Menu()
var game = new Game();
var current = menu;

function tick() {
	requestAnimFrame(tick);

	context.clearRect(0,0,canvas.width,canvas.height);

	var new_time = new Date().getTime();
	var length = new_time - time;

	current.tick(length);

	time = new_time;
}

tick();