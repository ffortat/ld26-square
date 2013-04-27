var canvas = document.getElementById('game');
var context = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 480;

canvas.style.width = canvas.width + 'px';
canvas.style.height = canvas.height + 'px';

canvas.style.marginTop = -(canvas.height / 2) + 'px';
canvas.style.marginLeft = -(canvas.width / 2) + 'px';