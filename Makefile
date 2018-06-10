# makefile to automatize simple operations

project_directory = "app"
configuration_files = "config.js"
library_files =
resources_files =

BUILD_CMD = cd $(project_directory)/scripts; java -classpath js.jar:compiler.jar org.mozilla.javascript.tools.shell.Main r.js -o build.min.json

PYTHON_SERVER_CMD = python3 -m http.server || python -m SimpleHTTPServer || python -m http.server

all: install build server

setup: install build

install:
	@(cd $(project_directory); \
	  bower install --force requirejs; \
	  bower install --force sylvester; \
	  bower install --force requirejs-text; \
	  bower install --force threejs;)

build:
ifdef OPTIMIZE
	($(BUILD_CMD) optimize=$(OPTIMIZE))
else
	($(BUILD_CMD))
endif

server:
	@(cd $(project_directory); $(PYTHON_SERVER_CMD))
