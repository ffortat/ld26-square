var audio = (function () {
	function loadsfx(uri, callback) {
		load.audio(uri, function (sfx) {
			sfx.volume = 0.4;
			callback(sfx);
		});
	}

	function loadmusic(uri, callback) {
		load.audio(uri, function (music) {
			music.loop = true;
			callback(music);
		});
	}

	return {
		sfx : loadsfx,
		music : loadmusic
	};
})();