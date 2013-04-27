var keys = {
	left : 37,
	up : 38,
	right : 39,
	down : 40,
	x : 88
}

var keydown = {};

function onkeydown(event) {
	keydown[event.keyCode] = true;
	// console.log(event.keyCode);
}

function onkeyup (event) {
	delete keydown[event.keyCode];
}

document.addEventListener('keydown', onkeydown);
document.addEventListener('keyup', onkeyup);