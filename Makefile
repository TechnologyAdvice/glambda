.DEFAULT_GOAL := all

# Paths
DEPS    = ./node_modules
BIN     = $(DEPS)/.bin
SRC     = ./src
BUILD   = ./build
DOCS    = ./docs
PKG     = ./package.json

# Tests
TESTS   = ./test/src/
SPACE   :=
SPACE   +=
# Default to recursive, can override on run
FILE    = $(SPACE)--recursive

# Make things more readable
define colorecho
      @tput setaf 2
      @tput bold
      @printf "\n"
      @echo $1
      @echo ==========================================
      @tput sgr0
endef

# Tasks

clean:
	$(call colorecho, "Cleaning $(BUILD) and $(DEPS)")
	rm -rf $(BUILD) && rm -rf $(DEPS)

install: $(PKG)
	$(call colorecho, "Installing")
	npm i .

lint:
	$(call colorecho, "Linting $(SRC)")
	$(BIN)/eslint $(SRC)

test:
	$(call colorecho, "Testing $(TESTS)$(FILE)")
	$(BIN)/mocha --compilers js:babel/register $(TESTS)$(FILE)

build:
	$(call colorecho, "Building $(SRC) to $(BUILD)")
	$(BIN)/babel $(SRC) --out-dir $(BUILD)

start:
	$(call colorecho, "Starting...")
	node build/server.js

doc:
	$(call colorecho, "Building Docs")
	$(BIN)/esdoc -c esdoc.json

dev: lint test build start

watch:
	$(call colorecho, "Starting watch")
	$(BIN)/nodemon --exec "make dev" --watch $(SRC)

all: clean install lint test build doc


# Phonies
.PHONY: lint test doc build start