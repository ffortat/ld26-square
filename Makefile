# Makefile for ²

NODE_PATH = ./node_modules
JS_COMPILER = $(NODE_PATH)/uglify-js/bin/uglifyjs

all : www/square.js

www/square.global.js : \
	app/libs/ajax.js \
	app/libs/loader.js \
	app/canvas.js \
	app/states.js \
	app/square.js \
	app/circle.js \
	app/hud.js \
	app/level.js \
	app/game.js \
	app/menu.js \
	app/main.js
	@rm -f $@
	@echo "(function () {"  > $@
	cat $^ >> $@
	@echo "})()" >> $@

www/square.js : www/square.global.js
	@rm -f $@
	$(JS_COMPILER) < $< > $@

clean :
	rm -f www/square.global.js

delete :
	rm -f www/square.js www/square.global.js
