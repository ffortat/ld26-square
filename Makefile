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
	app/controls.js \
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
	mkdir www/animations
	mkdir www/images
	mkdir www/levels
	cp app/animations/square.json www/animations/
	cp app/levels/level1.json www/levels/
	cp app/images/circle.png www/images/
	cp app/images/finish.png www/images/
	cp app/images/ground-tileset.png www/images/
	cp app/images/instructions.png www/images/
	cp app/images/square-attack.png www/images/
	cp app/images/square-jump.png www/images/
	cp app/images/square.png www/images/
	cp app/images/truck.png www/images/
	cp app/styles.css www/

clean :
	rm -f www/square.global.js

delete :
	rm -f www/square.js www/square.global.js
