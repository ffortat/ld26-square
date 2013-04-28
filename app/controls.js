var keys = {
	left : 37,
	up : 38,
	right : 39,
	down : 40,
	c : 67,
	x : 88
}

var keydown = {};

function onkeydown(event) {
	if (keydown[event.keyCode] === undefined) {
		keydown[event.keyCode] = true;
	}
}

function onkeyup (event) {
	delete keydown[event.keyCode];
}

var mouse = (function () {
	var listeners = {
		click : [],
		mousedown : [],
		mousemove : [],
		mouseup : []
	}

	function on(event, callback) {
		if (listeners[event]) {
			listeners[event].push(callback);
		}
	}

	function onmousedown(event) {
		mouse.left = (event.button === 0);
		mouse.middle = (event.button === 1);
		mouse.right = (event.button === 2);

		listeners.mousedown.forEach(function (listener) {
			listener(event);
		});
	}

	function onmousemove(event) {
		mouse.x = event.layerX;
		mouse.y = event.layerY;

		listeners.mousemove.forEach(function (listener) {
			listener(event);
		});
	}

	function onmouseup(event) {
		mouse.left = !(event.button === 0);
		mouse.middle = !(event.button === 1);
		mouse.right = !(event.button === 2);

		listeners.mouseup.forEach(function (listener) {
			listener(event);
		});
		listeners.click.forEach(function (listener) {
			listener(event);
		});
	}

	return {
		x : 0,
		y : 0,
		left : false,
		middle : false,
		right : false,
		on : on,
		down : onmousedown,
		move : onmousemove,
		up  :onmouseup
	};
})();

document.addEventListener('keydown', onkeydown);
document.addEventListener('keyup', onkeyup);
document.addEventListener('mousedown', mouse.down);
document.addEventListener('mousemove', mouse.move);
document.addEventListener('mouseup', mouse.up);