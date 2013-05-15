var load = (function() {
	var loading = [];
	var loaded = {};
	var listeners = {
		error : [],
		ready : []
	};
	var next = {
		error : [],
		ready : []
	};

	function checkready() {
		if (loading.length === 0) {
			listeners.ready.forEach(function (listener) {
				listener();
			})

			while (next.ready.length > 0) {
				(next.ready.shift())();
			}
		}
	}

	function setloaded(uri, data) {
		loading.some(function (waitinguri, index) {
			if (waitinguri === uri) {
				loading.splice(index, 1);
				return true;
			}
		});
		loaded[uri] = data;
		checkready();
	}

	function call(callback, param) {
		if (typeof(callback) === 'function') {
			callback(param);
		}
	}

	function loadjson(uri, callback) {
		if (loaded[uri] === undefined) {
			loading.push(uri);
			ajax.getJSON(uri, function (data) {
				setloaded(uri, data);
				call(callback, data);
			});
		} else {
			call(callback, loaded[uri]);
		}
	}

	function loadimage(uri, callback) {
		if (loaded[uri] === undefined) {
			loading.push(uri);
			var image = new Image();
			image.addEventListener('load', function () {
				setloaded(uri, image);
				call(callback, image);
			});

			image.src = uri;
		} else {
			call(callback, loaded[uri]);
		}
	}

	function loadaudio(uri, callback) {
				console.log('loading')
		if (loaded[uri] === undefined) {
			loading.push(uri);
			var audio = new Audio();
			audio.autoplay = false;
			audio.addEventListener('canplay', function () {
				setloaded(uri, audio);
				call(callback, audio);
				console.log('loaded')
			});
			audio.src = uri;
		} else {
				console.log('loaded')
			call(callback, loaded[uri]);
		}
			console.log(loading)
	}

	function whenready(callback) {
		next.ready.push(callback);
		checkready();
	}

	function whenerror(callback) {
		next.error.push(callback);
	}

	function addlistener(event, callback) {
		if (listeners[event] && typeof(callback) === 'function') {
			listeners[event].push(callback);
		}
	}

	return {
		json : loadjson,
		image : loadimage,
		audio : loadaudio,
		ready : whenready,
		error : whenerror,
		on : addlistener
	}
})();