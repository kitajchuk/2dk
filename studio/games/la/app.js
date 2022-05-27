/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/lib/Config.js":
/*!***************************!*\
  !*** ./src/lib/Config.js ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
var styleRoot = window.getComputedStyle(document.documentElement);

var getStyleVar = function getStyleVar(prop) {
  return styleRoot.getPropertyValue(prop);
};

var Config = {
  // VERBS and TILES:
  // These alone sort of "break" the idea of the "anybody's game".
  // These imply that you would be given a preset of "verbs" and "tiles"
  // to choose from when adding ActiveTiles groups to a map.
  // I think the verbs have to stay here since they are so specific...
  // But I think the tiles and their associative FX and Triggers could
  // be moved to the game.json config. This way the game creator defines
  // the TILES presets and associates them to VERBS on maps.
  verbs: {
    PUSH: "push",
    PULL: "pull",
    GRAB: "grab",
    MOVE: "move",
    LIFT: "lift",
    OPEN: "open",
    WALK: "walk",
    FACE: "face",
    SWIM: "swim",
    JUMP: "jump",
    FALL: "fall",
    THROW: "throw",
    SMASH: "smash",
    ATTACK: "attack"
  },
  tiles: {
    HOLES: "holes",
    GRASS: "grass",
    WATER: "water",
    LEDGE: "ledge",
    STAIRS: "stairs",
    SWITCH: "switch"
  },
  keys: {
    A: 88,
    B: 90,
    UP: 38,
    HOME: 72,
    DOWN: 40,
    LEFT: 37,
    RIGHT: 39,
    START: 13,
    SELECT: 32,
    UPLEFT: 111,
    UPRIGHT: 222,
    DOWNLEFT: 333,
    DOWNRIGHT: 444
  },
  plugins: {
    TOPVIEW: "topview"
  },
  events: {
    DOOR: "door",
    WARP: "warp",
    BOUNDARY: "boundary",
    CUTSCENE: "cutscene"
  },
  broadcast: {
    PAUSED: "paused",
    RESUMED: "resumed",
    MAPEVENT: "mapevent"
  },
  npc: {
    TILE: "tile",
    WALK: "walk",
    ROAM: "roam",
    FLOAT: "float",
    WANDER: "wander"
  },
  opposites: {
    y: "x",
    x: "y",
    up: "down",
    down: "up",
    left: "right",
    right: "left"
  },
  colors: {
    red: getStyleVar("--red"),
    grey: getStyleVar("--grey"),
    blue: getStyleVar("--blue"),
    teal: getStyleVar("--teal"),
    pink: getStyleVar("--pink"),
    black: getStyleVar("--black"),
    green: getStyleVar("--green"),
    white: getStyleVar("--white"),
    purple: getStyleVar("--purple"),
    yellow: getStyleVar("--yellow"),
    greyDark: getStyleVar("--grey-dark"),
    blueDark: getStyleVar("--blue-dark"),
    charcoal: getStyleVar("--charcoal"),
    charcoal2: getStyleVar("--charcoal2")
  }
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Config);

/***/ }),

/***/ "./src/lib/Controller.js":
/*!*******************************!*\
  !*** ./src/lib/Controller.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");



// A cleanup of the original ProperJS Controller
// https://github.com/kitajchuk/Controller
var Controller = /*#__PURE__*/function () {
  function Controller() {
    (0,_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__["default"])(this, Controller);

    this.handlers = {};
    this.animate = null;
    this.started = false;
    this.cycle = null;
  }

  (0,_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__["default"])(Controller, [{
    key: "go",
    value: function go(callback) {
      var _this = this;

      if (this.started) {
        return this;
      }

      this.started = true;

      this.animate = function (elapsed) {
        _this.cycle = window.requestAnimationFrame(_this.animate);

        if (typeof callback === "function") {
          callback(elapsed);
        }
      };

      this.cycle = window.requestAnimationFrame(this.animate);
    }
  }, {
    key: "stop",
    value: function stop() {
      window.cancelAnimationFrame(this.cycle);
      this.animate = null;
      this.started = false;
      this.cycle = null;
    }
  }, {
    key: "on",
    value: function on(event, handler) {
      var _this2 = this;

      var events = event.split(" ");
      events.forEach(function (event) {
        if (typeof handler === "function") {
          if (!_this2.handlers[event]) {
            _this2.handlers[event] = [];
          }

          _this2.handlers[event].push(handler);
        }
      });
    }
  }, {
    key: "off",
    value: function off(event, handler) {
      if (!this.handlers[event]) {
        return this;
      }

      if (handler) {
        for (var i = this.handlers[event].length; i--;) {
          if (this.handlers[event][i] === handler) {
            this.handlers[event].splice(i, 1);
            break;
          }
        }
      } else {
        delete this.handlers[event];
      }
    }
  }, {
    key: "emit",
    value: function emit(event) {
      var _this3 = this;

      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      if (!this.handlers[event]) {
        return this;
      }

      this.handlers[event].forEach(function (handler) {
        handler.apply(_this3, args);
      });
    }
  }]);

  return Controller;
}();

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Controller);

/***/ }),

/***/ "./src/lib/Dialogue.js":
/*!*****************************!*\
  !*** ./src/lib/Dialogue.js ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _Utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Utils */ "./src/lib/Utils.js");
/* harmony import */ var _Config__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Config */ "./src/lib/Config.js");





var Dialogue = /*#__PURE__*/function () {
  function Dialogue() {
    (0,_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__["default"])(this, Dialogue);

    this.data = null;
    this.ready = false;
    this.pressed = false;
    this.active = false;
    this.isResolve = false;
    this.resolve = null;
    this.reject = null;
    this.timeout = null;
    this.debounce = 750;
    this.duration = 250;
    this.build();
  }

  (0,_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__["default"])(Dialogue, [{
    key: "build",
    value: function build() {
      this.element = document.createElement("div");
      this.element.className = "_2dk__dialogue";
    }
  }, {
    key: "write",
    value: function write(text) {
      this.element.innerHTML = "<p>".concat(text, "</p>");
    }
  }, {
    key: "clear",
    value: function clear() {
      this.element.innerHTML = "";
    }
  }, {
    key: "auto",
    value: function auto(data) {
      var _this = this;

      if (this.active) {
        return;
      }

      if (this.timeout) {
        clearTimeout(this.timeout);
      }

      if (this.data) {
        this.element.classList.remove("_2dk__dialogue--".concat(this.data.type));
      }

      this.data = _Utils__WEBPACK_IMPORTED_MODULE_2__["default"].copy(data);
      this.element.classList.add("_2dk__dialogue--".concat(this.data.type));
      this.element.classList.add("is-texting");
      this.write(this.data.text.shift());
      this.timeout = setTimeout(function () {
        _this.teardown();
      }, this.debounce * 3);
    }
  }, {
    key: "play",
    value: function play(data) {
      var _this2 = this;

      if (this.active) {
        return;
      }

      this.active = true;
      return new Promise(function (resolve, reject) {
        _this2.data = _Utils__WEBPACK_IMPORTED_MODULE_2__["default"].copy(data);
        _this2.isResolve = true;
        _this2.resolve = resolve;
        _this2.reject = reject;

        _this2.element.classList.add("_2dk__dialogue--".concat(_this2.data.type));

        _this2.element.classList.add("is-texting");

        _this2.write(_this2.data.text.shift());

        _this2.timeout = setTimeout(function () {
          _this2.ready = true;
        }, _this2.debounce);
      });
    }
  }, {
    key: "check",
    value: function check(a, b) {
      var _this3 = this;

      // Inactive dialogue: No ones talking...
      // Active dialogue: Button was press to advance...
      if (!this.active || !this.ready || this.active && this.pressed) {
        return;
      }

      this.pressed = true; // Plain text...

      if (this.data.type === "text") {
        if (this.data.text.length) {
          this.write(this.data.text.shift());
          this.timeout = setTimeout(function () {
            _this3.pressed = false;
          }, this.debounce);
        } else {
          if (this.isResolve) {
            this.resolve();
          } else {
            this.reject();
          }

          this.teardown();
        } // Prompt-based (a:confirm, b: decline)

      } else if (this.data.type === "prompt") {
        // A-button OR B-button will advance as long as there is text...
        if (this.data.text.length) {
          var text = [this.data.text.shift()]; // No more text so show prompts...

          if (!this.data.text.length) {
            text.push("\n                        <span style=\"color: ".concat(_Config__WEBPACK_IMPORTED_MODULE_3__["default"].colors.teal, ";\">A: ").concat(this.data.yes.label, "</span>, \n                        <span style=\"color: ").concat(_Config__WEBPACK_IMPORTED_MODULE_3__["default"].colors.blue, ";\">B: ").concat(this.data.no.label, "</span>"));
          }

          this.write(text.join("<br />"));
          this.timeout = setTimeout(function () {
            _this3.pressed = false;
          }, this.debounce); // A-button will confirm if there is no more text...
        } else if (a && !this.data.text.length) {
          this.isResolve = true;
          this.data.type = "text";
          this.data.text = this.data.yes.text;
          this.timeout = setTimeout(function () {
            _this3.pressed = false;

            _this3.check(true, false);
          }, this.duration); // B-button will cancel if there is no more text...
        } else if (b && !this.data.text.length) {
          this.isResolve = false;
          this.data.type = "text";
          this.data.text = this.data.no.text;
          this.timeout = setTimeout(function () {
            _this3.pressed = false;

            _this3.check(false, true);
          }, this.duration);
        }
      }
    }
  }, {
    key: "teardown",
    value: function teardown() {
      var _this4 = this;

      this.element.classList.remove("_2dk__dialogue--".concat(this.data.type));
      this.element.classList.remove("is-texting");
      this.data = null;
      this.ready = false;
      this.pressed = false;
      this.isResolve = false;
      this.resolve = null;
      this.reject = null;
      this.timeout = setTimeout(function () {
        _this4.clear();

        _this4.active = false;
        _this4.timeout = null;
      }, this.duration);
    }
  }]);

  return Dialogue;
}();

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Dialogue);

/***/ }),

/***/ "./src/lib/GameAudio.js":
/*!******************************!*\
  !*** ./src/lib/GameAudio.js ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");



var GameAudio = /*#__PURE__*/function () {
  function GameAudio(player) {
    (0,_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__["default"])(this, GameAudio);

    this.player = player;
    this.sounds = {};
    this.build();
  }

  (0,_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__["default"])(GameAudio, [{
    key: "build",
    value: function build() {
      if (this.player.device) {
        return;
      }

      this.channels = {
        bgm: {
          node: new Audio(),
          open: false
        },
        sfx: {
          node: new Audio(),
          open: false
        }
      };
      this.channels.bgm.node.loop = true;
      this.channels.bgm.node.volume = 0.4;
      this.channels.sfx.node.loop = false;
      this.channels.sfx.node.volume = 0.8;
    }
  }, {
    key: "addSound",
    value: function addSound(data) {
      if (this.player.device) {
        return;
      }

      if (!this.sounds[data.id]) {
        this.sounds[data.id] = data;
        this.sounds[data.id].playing = false;
      }
    }
  }, {
    key: "hitSound",
    value: function hitSound(id) {
      var sound = this.sounds[id];

      if (sound) {
        var channel = this.channels[sound.channel];
        channel.node.src = sound.src;
        channel.node.play();
      }
    }
  }, {
    key: "playSound",
    value: function playSound(id) {
      var sound = this.sounds[id];

      if (sound && !sound.playing) {
        var channel = this.channels[sound.channel];
        var playing = channel.node.src.split("/").pop();
        var requesting = sound.src.split("/").pop();

        if (requesting !== playing) {
          channel.node.src = sound.src;
        }

        this.sounds[id].playing = true;
        channel.node.play();
      }
    }
  }, {
    key: "stopSound",
    value: function stopSound(id) {
      var sound = this.sounds[id];

      if (sound && sound.playing) {
        var channel = this.channels[sound.channel];
        this.sounds[id].playing = false;
        channel.node.pause();
      }
    }
  }]);

  return GameAudio;
}();

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (GameAudio);

/***/ }),

/***/ "./src/lib/GameBox.js":
/*!****************************!*\
  !*** ./src/lib/GameBox.js ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Camera": () => (/* binding */ Camera),
/* harmony export */   "GameBox": () => (/* binding */ GameBox),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _Utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Utils */ "./src/lib/Utils.js");
/* harmony import */ var _Config__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Config */ "./src/lib/Config.js");
/* harmony import */ var _Loader__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./Loader */ "./src/lib/Loader.js");
/* harmony import */ var _Dialogue__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./Dialogue */ "./src/lib/Dialogue.js");
/* harmony import */ var _Map__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./Map */ "./src/lib/Map.js");
/* harmony import */ var _sprites_Hero__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./sprites/Hero */ "./src/lib/sprites/Hero.js");
/* harmony import */ var _sprites_Companion__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./sprites/Companion */ "./src/lib/sprites/Companion.js");
/* harmony import */ var _sprites_FX__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./sprites/FX */ "./src/lib/sprites/FX.js");











var tileSortFunc = function tileSortFunc(tileA, tileB) {
  if (tileA.amount > tileB.amount) {
    return -1;
  } else {
    return 1;
  }
};

var stopVerbs = [_Config__WEBPACK_IMPORTED_MODULE_3__["default"].verbs.GRAB, _Config__WEBPACK_IMPORTED_MODULE_3__["default"].verbs.MOVE, _Config__WEBPACK_IMPORTED_MODULE_3__["default"].verbs.LIFT];
var actionVerbs = [_Config__WEBPACK_IMPORTED_MODULE_3__["default"].verbs.LIFT];
var attackVerbs = [_Config__WEBPACK_IMPORTED_MODULE_3__["default"].verbs.ATTACK]; // @see notes in ./Config.js as these are related to that line of thought...

var footTiles = [_Config__WEBPACK_IMPORTED_MODULE_3__["default"].tiles.STAIRS, _Config__WEBPACK_IMPORTED_MODULE_3__["default"].tiles.WATER, _Config__WEBPACK_IMPORTED_MODULE_3__["default"].tiles.GRASS, _Config__WEBPACK_IMPORTED_MODULE_3__["default"].tiles.HOLES];
var cameraTiles = [_Config__WEBPACK_IMPORTED_MODULE_3__["default"].tiles.STAIRS, _Config__WEBPACK_IMPORTED_MODULE_3__["default"].tiles.GRASS];

var Camera = /*#__PURE__*/(0,_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_0__["default"])(function Camera(x, y, width, height, resolution) {
  (0,_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_1__["default"])(this, Camera);

  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.resolution = resolution;
});

var GameBox = /*#__PURE__*/function () {
  function GameBox(player) {
    var _this = this;

    (0,_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_1__["default"])(this, GameBox);

    this.player = player;
    this.step = 1;
    this.offset = {
      x: 0,
      y: 0
    };
    this.camera = new Camera(0, 0, this.player.width * this.player.data.resolution, this.player.height * this.player.data.resolution, this.player.data.resolution);
    this.layers = {
      background: null,
      heroground: null,
      foreground: null
    };
    var initMapData = _Loader__WEBPACK_IMPORTED_MODULE_4__["default"].cash(this.player.data.hero.map);
    var initHeroData = this.player.data.hero; // Map

    this.map = new _Map__WEBPACK_IMPORTED_MODULE_6__["default"](initMapData, this); // Hero

    initHeroData.spawn = initMapData.spawn[initHeroData.spawn];
    this.hero = new _sprites_Hero__WEBPACK_IMPORTED_MODULE_7__["default"](initHeroData, this.map);
    Object.keys(initHeroData.sounds).forEach(function (id) {
      _this.player.gameaudio.addSound({
        id: id,
        src: initHeroData.sounds[id],
        channel: "sfx"
      });
    }); // Companion?

    if (initHeroData.companion) {
      initHeroData.companion = this.player.getMergedData(initHeroData.companion, "npcs");
      initHeroData.companion.spawn = {
        x: this.hero.position.x,
        y: this.hero.position.y
      };
      this.companion = new _sprites_Companion__WEBPACK_IMPORTED_MODULE_8__["default"](initHeroData.companion, this.hero);
    } // Dialogues


    this.dialogue = new _Dialogue__WEBPACK_IMPORTED_MODULE_5__["default"]();
    this.build();
    this.initMap();
  }

  (0,_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_0__["default"])(GameBox, [{
    key: "clear",
    value: function clear() {
      var _this2 = this;

      Object.keys(this.layers).forEach(function (id) {
        _this2.layers[id].onCanvas.clear();
      });
    }
  }, {
    key: "build",
    value: function build() {
      var _this3 = this;

      this.element = document.createElement("div");
      this.element.className = "_2dk__gamebox"; // Render layers

      Object.keys(this.layers).forEach(function (id) {
        _this3.addLayer(id);
      });
      this.player.screen.appendChild(this.element);
      this.player.screen.appendChild(this.dialogue.element);
    }
  }, {
    key: "pause",
    value: function pause(paused) {
      if (paused) {
        this.hero.face(this.hero.dir);
        this.player.gameaudio.stopSound(this.map.data.id);
      } else {
        this.player.gameaudio.playSound(this.map.data.id);
      }
    }
  }, {
    key: "addLayer",
    value: function addLayer(id) {
      this.layers[id] = {};
      this.layers[id].onCanvas = new _Map__WEBPACK_IMPORTED_MODULE_6__.MapLayer({
        id: id,
        width: this.camera.width,
        height: this.camera.height
      });
      this.layers[id].onCanvas.canvas.width = "".concat(this.camera.width * this.camera.resolution);
      this.layers[id].onCanvas.canvas.height = "".concat(this.camera.height * this.camera.resolution);
      this.element.appendChild(this.layers[id].onCanvas.canvas);
    }
  }, {
    key: "initMap",
    value: function initMap() {
      this.update(this.hero.position);
      this.hero.applyOffset();
      this.player.gameaudio.addSound({
        id: this.map.data.id,
        src: this.map.data.sound,
        channel: "bgm"
      });
      this.dialogue.auto({
        text: [this.map.data.name]
      });
    }
    /*******************************************************************************
    * Rendering
    Can all be handled in plugin GameBox
    *******************************************************************************/

  }, {
    key: "blit",
    value: function blit() {}
  }, {
    key: "update",
    value: function update() {}
    /*******************************************************************************
    * GamePad Inputs
    * Can all be handled in plugin GameBox
    *******************************************************************************/

  }, {
    key: "pressD",
    value: function pressD() {}
  }, {
    key: "releaseD",
    value: function releaseD() {}
  }, {
    key: "pressA",
    value: function pressA() {}
  }, {
    key: "holdA",
    value: function holdA() {}
  }, {
    key: "releaseA",
    value: function releaseA() {}
  }, {
    key: "releaseHoldA",
    value: function releaseHoldA() {}
  }, {
    key: "pressB",
    value: function pressB() {}
  }, {
    key: "holdB",
    value: function holdB() {}
  }, {
    key: "releaseB",
    value: function releaseB() {}
  }, {
    key: "releaseHoldB",
    value: function releaseHoldB() {}
    /*******************************************************************************
    * FX utilities
    *******************************************************************************/

  }, {
    key: "smokeObject",
    value: function smokeObject(obj) {
      var data = this.player.getMergedData({
        id: "smoke",
        kill: true,
        spawn: {
          x: obj.position.x + obj.width / 2 - this.map.data.tilesize / 2,
          y: obj.position.y + obj.height / 2 - this.map.data.tilesize / 2
        }
      }, "fx");
      this.map.addFX(new _sprites_FX__WEBPACK_IMPORTED_MODULE_9__["default"](data, this.map));
      this.map.addFX(new _sprites_FX__WEBPACK_IMPORTED_MODULE_9__["default"](_Utils__WEBPACK_IMPORTED_MODULE_2__["default"].merge(data, {
        spawn: {
          x: origin.x - this.map.data.tilesize / 4,
          y: origin.y - this.map.data.tilesize / 4
        },
        vx: -8,
        vy: -8
      }), this.map));
      this.map.addFX(new _sprites_FX__WEBPACK_IMPORTED_MODULE_9__["default"](_Utils__WEBPACK_IMPORTED_MODULE_2__["default"].merge(data, {
        spawn: {
          x: origin.x + this.map.data.tilesize / 4,
          y: origin.y - this.map.data.tilesize / 4
        },
        vx: 8,
        vy: -8
      }), this.map));
      this.map.addFX(new _sprites_FX__WEBPACK_IMPORTED_MODULE_9__["default"](_Utils__WEBPACK_IMPORTED_MODULE_2__["default"].merge(data, {
        spawn: {
          x: origin.x - this.map.data.tilesize / 4,
          y: origin.y + this.map.data.tilesize / 4
        },
        vx: -8,
        vy: 8
      }), this.map));
      this.map.addFX(new _sprites_FX__WEBPACK_IMPORTED_MODULE_9__["default"](_Utils__WEBPACK_IMPORTED_MODULE_2__["default"].merge(data, {
        spawn: {
          x: origin.x + this.map.data.tilesize / 4,
          y: origin.y + this.map.data.tilesize / 4
        },
        vx: 8,
        vy: 8
      }), this.map));
    }
    /*******************************************************************************
    * Collision checks
    * Can all be handled in plugin GameBox
    *******************************************************************************/

  }, {
    key: "getVisibleColliders",
    value: function getVisibleColliders() {
      var colliders = [];

      for (var i = this.map.data.collision.length; i--;) {
        var collides = _Utils__WEBPACK_IMPORTED_MODULE_2__["default"].collide(this.camera, {
          width: this.map.data.collider,
          height: this.map.data.collider,
          x: this.map.data.collision[i][0] * this.map.data.collider,
          y: this.map.data.collision[i][1] * this.map.data.collider
        });

        if (collides) {
          colliders.push(this.map.data.collision[i]);
        }
      }

      return colliders;
    }
  }, {
    key: "getVisibleEvents",
    value: function getVisibleEvents() {
      var events = [];

      for (var i = this.map.data.events.length; i--;) {
        var collides = _Utils__WEBPACK_IMPORTED_MODULE_2__["default"].collide(this.camera, {
          width: this.map.data.tilesize,
          height: this.map.data.tilesize,
          x: this.map.data.events[i].coords[0] * this.map.data.tilesize,
          y: this.map.data.events[i].coords[1] * this.map.data.tilesize
        });

        if (collides) {
          events.push(this.map.data.events[i]);
        }
      }

      return events;
    }
  }, {
    key: "getVisibleNPCs",
    value: function getVisibleNPCs() {
      var npcs = [];

      for (var i = this.map.npcs.length; i--;) {
        var collides = _Utils__WEBPACK_IMPORTED_MODULE_2__["default"].collide(this.camera, {
          x: this.map.npcs[i].position.x,
          y: this.map.npcs[i].position.y,
          width: this.map.npcs[i].width,
          height: this.map.npcs[i].height
        });

        if (collides) {
          npcs.push(this.map.npcs[i]);
        }
      }

      return npcs;
    }
  }, {
    key: "getVisibleActiveTiles",
    value: function getVisibleActiveTiles() {
      var activeTiles = [];

      for (var i = this.map.activeTiles.length; i--;) {
        for (var j = this.map.activeTiles[i].data.coords.length; j--;) {
          var collides = _Utils__WEBPACK_IMPORTED_MODULE_2__["default"].collide(this.camera, {
            width: this.map.data.tilesize,
            height: this.map.data.tilesize,
            x: this.map.activeTiles[i].data.coords[j][0] * this.map.data.tilesize,
            y: this.map.activeTiles[i].data.coords[j][1] * this.map.data.tilesize
          });

          if (collides && activeTiles.indexOf(this.map.activeTiles[i]) === -1) {
            activeTiles.push(this.map.activeTiles[i]);
          }
        }
      }

      return activeTiles;
    }
  }, {
    key: "checkCamera",
    value: function checkCamera(poi, sprite) {
      var ret = false;

      if (poi.x <= this.camera.x || poi.x >= this.camera.x + this.camera.width - sprite.width) {
        ret = true;
      }

      if (poi.y <= this.camera.y || poi.y >= this.camera.y + this.camera.height - sprite.height) {
        ret = true;
      }

      return ret;
    }
  }, {
    key: "checkHero",
    value: function checkHero(poi, sprite) {
      var ret = false;
      var collides = _Utils__WEBPACK_IMPORTED_MODULE_2__["default"].collide(sprite.getHitbox(poi), this.hero.hitbox);

      if (collides) {
        ret = collides;
      }

      return ret;
    }
  }, {
    key: "checkMap",
    value: function checkMap(poi, sprite) {
      var hitbox = sprite.getHitbox(poi);
      var colliders = this.getVisibleColliders();

      for (var i = colliders.length; i--;) {
        var tile = {
          width: this.map.data.collider,
          height: this.map.data.collider,
          x: colliders[i][0] * this.map.data.collider,
          y: colliders[i][1] * this.map.data.collider,
          layer: "foreground"
        };

        if (_Utils__WEBPACK_IMPORTED_MODULE_2__["default"].collide(hitbox, tile)) {
          return true;
        }
      }

      return false;
    }
  }, {
    key: "checkEvents",
    value: function checkEvents(poi, sprite) {
      var events = this.getVisibleEvents();

      for (var i = events.length; i--;) {
        var tile = {
          width: this.map.data.tilesize,
          height: this.map.data.tilesize,
          x: events[i].coords[0] * this.map.data.tilesize,
          y: events[i].coords[1] * this.map.data.tilesize
        };
        var hasDir = events[i].dir;
        var isBoundary = events[i].type === _Config__WEBPACK_IMPORTED_MODULE_3__["default"].events.BOUNDARY;
        var lookbox = isBoundary ? {
          width: sprite.width,
          height: sprite.height,
          x: sprite.position.x,
          y: sprite.position.y
        } : sprite.hitbox;
        var collides = _Utils__WEBPACK_IMPORTED_MODULE_2__["default"].collide(lookbox, tile);
        var amount = collides.width * collides.height;
        var isDir = hasDir ? sprite.dir === hasDir : true;
        var isThresh = isBoundary ? true : !hasDir ? amount >= 1280 / this.camera.resolution : amount >= 256 / this.camera.resolution; // An event without a "dir" can be triggered from any direction

        if (collides && isThresh && isDir) {
          return Object.assign(events[i], {
            collides: collides,
            amount: amount
          });
        }
      }

      return false;
    }
  }, {
    key: "checkNPC",
    value: function checkNPC(poi, sprite) {
      var hitbox = sprite.getHitbox(poi);
      var npcs = this.getVisibleNPCs();

      for (var i = npcs.length; i--;) {
        // A thrown object Sprite will have a hero prop
        if (!npcs[i].hero && npcs[i] !== sprite && _Utils__WEBPACK_IMPORTED_MODULE_2__["default"].collide(hitbox, npcs[i].hitbox)) {
          return npcs[i];
        }
      }

      return false;
    }
  }, {
    key: "checkTiles",
    value: function checkTiles(poi, sprite) {
      var tiles = {
        action: [],
        attack: [],
        passive: []
      };
      var activeTiles = this.getVisibleActiveTiles();

      for (var i = activeTiles.length; i--;) {
        var instance = activeTiles[i];
        var lookbox = void 0;

        if (typeof sprite.getFootbox === "function" && typeof sprite.getHitbox === "function") {
          lookbox = footTiles.indexOf(instance.data.group) !== -1 ? sprite.getFootbox(poi) : sprite.getHitbox(poi); // Ad-hoc "sprite" object with { x, y, width, height }
        } else {
          lookbox = sprite;
        }

        for (var j = activeTiles[i].data.coords.length; j--;) {
          var tilebox = {
            width: this.map.data.tilesize,
            height: this.map.data.tilesize,
            x: instance.data.coords[j][0] * this.map.data.tilesize,
            y: instance.data.coords[j][1] * this.map.data.tilesize
          };
          var collides = _Utils__WEBPACK_IMPORTED_MODULE_2__["default"].collide(lookbox, tilebox);

          if (collides) {
            // Utils.collides returns a useful collider object...
            var amount = collides.width * collides.height;
            var match = {
              jump: instance.data.action && instance.data.action.verb === _Config__WEBPACK_IMPORTED_MODULE_3__["default"].verbs.JUMP,
              stop: instance.data.action && stopVerbs.indexOf(instance.data.action.verb) !== -1,
              group: instance.data.group,
              coord: instance.data.coords[j],
              action: instance.data.action && actionVerbs.indexOf(instance.data.action.verb) !== -1,
              attack: instance.data.attack && attackVerbs.indexOf(instance.data.attack.verb) !== -1,
              camera: cameraTiles.indexOf(instance.data.group) !== -1,
              amount: amount,
              tilebox: tilebox,
              collides: collides,
              instance: instance
            };

            if (instance.data.action) {
              tiles.action.push(match);
            }

            if (instance.data.attack) {
              tiles.attack.push(match);
            }

            if (!instance.data.action && !instance.data.attack || instance.data.attack && match.camera) {
              tiles.passive.push(match);
            }
          }
        }
      }

      if (tiles.action.length || tiles.attack.length || tiles.passive.length) {
        tiles.action = tiles.action.sort(tileSortFunc);
        tiles.attack = tiles.attack.sort(tileSortFunc);
        tiles.passive = tiles.passive.sort(tileSortFunc);
        return tiles;
      }

      return false;
    }
  }]);

  return GameBox;
}();

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (GameBox);


/***/ }),

/***/ "./src/lib/GamePad.js":
/*!****************************!*\
  !*** ./src/lib/GamePad.js ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/inherits */ "./node_modules/@babel/runtime/helpers/esm/inherits.js");
/* harmony import */ var _babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @babel/runtime/helpers/possibleConstructorReturn */ "./node_modules/@babel/runtime/helpers/esm/possibleConstructorReturn.js");
/* harmony import */ var _babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @babel/runtime/helpers/getPrototypeOf */ "./node_modules/@babel/runtime/helpers/esm/getPrototypeOf.js");
/* harmony import */ var _Utils__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./Utils */ "./src/lib/Utils.js");
/* harmony import */ var _Config__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./Config */ "./src/lib/Config.js");
/* harmony import */ var _Controller__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./Controller */ "./src/lib/Controller.js");






function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0,_babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_4__["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0,_babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_4__["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0,_babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_3__["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }




var inputStream = [];
var touchInterval = 8;
var touchRepeated = 50;
var touchControls = {
  a: {
    key: _Config__WEBPACK_IMPORTED_MODULE_6__["default"].keys.A,
    elem: null,
    timer: null,
    touched: false,
    hold: 0,
    text: "A",
    gamepad: [0]
  },
  b: {
    key: _Config__WEBPACK_IMPORTED_MODULE_6__["default"].keys.B,
    elem: null,
    timer: null,
    touched: false,
    hold: 0,
    text: "B",
    gamepad: [1]
  },
  start: {
    key: _Config__WEBPACK_IMPORTED_MODULE_6__["default"].keys.START,
    elem: null,
    timer: null,
    touched: false,
    hold: 0,
    text: "Start",
    menu: true,
    gamepad: [9]
  },
  select: {
    key: _Config__WEBPACK_IMPORTED_MODULE_6__["default"].keys.SELECT,
    elem: null,
    hold: 0,
    timer: null,
    touched: false,
    text: "Select",
    menu: true,
    gamepad: [8]
  },
  // D-Pad
  "up-left": {
    key: _Config__WEBPACK_IMPORTED_MODULE_6__["default"].keys.UPLEFT,
    elem: null,
    timer: null,
    touched: false,
    dpad: ["left", "up"]
  },
  up: {
    key: _Config__WEBPACK_IMPORTED_MODULE_6__["default"].keys.UP,
    elem: null,
    timer: null,
    touched: false,
    dpad: ["up"],
    axes: [0, -1]
  },
  "up-right": {
    key: _Config__WEBPACK_IMPORTED_MODULE_6__["default"].keys.UPRIGHT,
    elem: null,
    timer: null,
    touched: false,
    dpad: ["right", "up"]
  },
  left: {
    key: _Config__WEBPACK_IMPORTED_MODULE_6__["default"].keys.LEFT,
    elem: null,
    timer: null,
    touched: false,
    dpad: ["left"],
    axes: [-1, 0]
  },
  neutral: {
    elem: null,
    dpad: []
  },
  right: {
    key: _Config__WEBPACK_IMPORTED_MODULE_6__["default"].keys.RIGHT,
    elem: null,
    timer: null,
    touched: false,
    dpad: ["right"],
    axes: [1, 0]
  },
  "down-left": {
    key: _Config__WEBPACK_IMPORTED_MODULE_6__["default"].keys.DOWNLEFT,
    elem: null,
    timer: null,
    touched: false,
    dpad: ["left", "down"]
  },
  down: {
    key: _Config__WEBPACK_IMPORTED_MODULE_6__["default"].keys.DOWN,
    elem: null,
    timer: null,
    touched: false,
    dpad: ["down"],
    axes: [0, 1]
  },
  "down-right": {
    key: _Config__WEBPACK_IMPORTED_MODULE_6__["default"].keys.DOWNRIGHT,
    elem: null,
    timer: null,
    touched: false,
    dpad: ["right", "down"]
  }
};

var GamePad = /*#__PURE__*/function (_Controller) {
  (0,_babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_2__["default"])(GamePad, _Controller);

  var _super = _createSuper(GamePad);

  function GamePad(player) {
    var _this;

    (0,_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__["default"])(this, GamePad);

    _this = _super.call(this);
    _this.player = player;

    _this.build();

    _this.bind();

    return _this;
  }

  (0,_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__["default"])(GamePad, [{
    key: "clear",
    value: function clear() {
      var _this2 = this;

      setTimeout(function () {
        _this2.clearTouches();

        _this2.cancelTouches();
      }, 300);
    }
  }, {
    key: "bind",
    value: function bind() {
      // Main interface is Touch
      this.element.addEventListener("touchstart", this.onTouchStart.bind(this), false);
      this.element.addEventListener("touchmove", this.onTouchMove.bind(this), false);
      this.element.addEventListener("touchend", this.onTouchEnd.bind(this), false); // Support keys for Desktop

      document.addEventListener("keyup", this.onKeyUp.bind(this), false);
      document.addEventListener("keydown", this.onKeyDown.bind(this), false); // Native GamePad interface (NES, SNES USB controllers)

      window.addEventListener("gamepadconnected", this.onGamepadConnected.bind(this));
      window.addEventListener("gamepaddisconnected", this.onGamepadDisconnected.bind(this));
    }
  }, {
    key: "build",
    value: function build() {
      var _this3 = this;

      this.element = document.createElement("div");
      this.dpad = document.createElement("div");
      this.btns = document.createElement("div");
      this.element.className = "_2dk__gamepad";
      this.dpad.className = "_2dk__gamepad__dpad";
      this.btns.className = "_2dk__gamepad__btns";
      this.element.appendChild(this.dpad);
      this.element.appendChild(this.btns);
      Object.keys(touchControls).forEach(function (btn) {
        touchControls[btn].btn = btn.split("-");
        touchControls[btn].elem = document.createElement("div");
        touchControls[btn].elem.className = "_2dk__gamepad__".concat(btn);
        touchControls[btn].elem.dataset.key = touchControls[btn].key;

        if (touchControls[btn].text) {
          touchControls[btn].elem.innerHTML = "<span>".concat(touchControls[btn].text, "</span>");
        }

        if (touchControls[btn].dpad) {
          _this3.dpad.appendChild(touchControls[btn].elem);
        } else {
          _this3.btns.appendChild(touchControls[btn].elem);
        }
      });
      this.player.element.appendChild(this.element);

      if (!this.player.device) {
        this.element.style.display = "none";
      }
    }
  }, {
    key: "checkDpad",
    value: function checkDpad() {
      var ctrls = [];
      Object.keys(touchControls).forEach(function (btn) {
        if (touchControls[btn].touched && touchControls[btn].dpad) {
          ctrls.push(touchControls[btn]);
        }
      }); // Sort UP and DOWN so they dispatch last in a stream of directions

      return ctrls.sort(function (ctrl) {
        if (ctrl.key === _Config__WEBPACK_IMPORTED_MODULE_6__["default"].keys.UP || ctrl.key === _Config__WEBPACK_IMPORTED_MODULE_6__["default"].keys.DOWN) {
          return 1;
        } else {
          return -1;
        }
      });
    }
  }, {
    key: "getControl",
    value: function getControl(key) {
      var ret = null;
      Object.keys(touchControls).forEach(function (btn) {
        if (touchControls[btn].key === key) {
          ret = touchControls[btn];
        }
      });
      return ret;
    }
  }, {
    key: "getGamepad",
    value: function getGamepad(val) {
      var ret = null;
      Object.keys(touchControls).forEach(function (btn) {
        if (touchControls[btn].gamepad && touchControls[btn].gamepad.indexOf(val) !== -1) {
          ret = touchControls[btn];
        }
      });
      return ret;
    }
  }, {
    key: "getAxes",
    value: function getAxes(xy, val) {
      var ret = null;
      Object.keys(touchControls).forEach(function (btn) {
        if (touchControls[btn].axes && touchControls[btn].axes[xy] === val) {
          ret = touchControls[btn];
        }
      });
      return ret;
    }
  }, {
    key: "getTouched",
    value: function getTouched(touches, control) {
      for (var i = 0; i < touches.length; i++) {
        var touched = document.elementFromPoint(touches[i].pageX, touches[i].pageY);
        var key = Number(touched.dataset.key);

        if (key === control.key) {
          return control;
        }
      }

      return null;
    }
  }, {
    key: "onTouchStart",
    value: function onTouchStart(e) {
      e.preventDefault();

      for (var i = 0; i < e.touches.length; i++) {
        var touched = document.elementFromPoint(e.touches[i].pageX, e.touches[i].pageY);
        var key = Number(touched.dataset.key);

        if (key) {
          var control = this.getControl(key);
          this.startTouch(control);
        }
      }

      return false;
    }
  }, {
    key: "onTouchMove",
    value: function onTouchMove(e) {
      var _this4 = this;

      e.preventDefault();

      for (var i = 0; i < e.touches.length; i++) {
        var touched = document.elementFromPoint(e.touches[i].pageX, e.touches[i].pageY);
        var key = Number(touched.dataset.key);

        if (key) {
          var control = this.getControl(key);

          if (control) {
            this.startTouch(control);
          }
        }

        Object.keys(touchControls).forEach(function (btn) {
          if (touchControls[btn].touched) {
            var _touched = _this4.getTouched(e.touches, touchControls[btn]);

            if (!_touched) {
              _this4.cancelTouch(touchControls[btn]);
            }
          }
        });
      }

      return false;
    }
  }, {
    key: "onTouchEnd",
    value: function onTouchEnd(e) {
      var _this5 = this;

      e.preventDefault();

      if (!e.touches.length) {
        this.clearTouches();
        this.cancelTouches();
      } else {
        Object.keys(touchControls).forEach(function (btn) {
          if (touchControls[btn].touched) {
            var touched = _this5.getTouched(e.touches, touchControls[btn]);

            if (!touched) {
              _this5.cancelTouch(touchControls[btn]);
            }
          }
        });
      }

      return false;
    }
  }, {
    key: "onKeyDown",
    value: function onKeyDown(e) {
      if (inputStream.indexOf(e.keyCode) === -1) {
        inputStream.push(e.keyCode);
        var control = this.getControl(e.keyCode);

        if (control) {
          this.startTouch(control);
        }
      }
    }
  }, {
    key: "onKeyUp",
    value: function onKeyUp(e) {
      if (inputStream.indexOf(e.keyCode) !== -1) {
        inputStream.splice(inputStream.indexOf(e.keyCode), 1);
        var control = this.getControl(e.keyCode);

        if (control) {
          this.cancelTouch(control);
        }
      }
    }
  }, {
    key: "handleGamepadAxes",
    value: function handleGamepadAxes(gamepad) {
      var controls = {
        x: this.getAxes(0, gamepad.axes[0]),
        y: this.getAxes(1, gamepad.axes[1])
      };

      if (controls.x && inputStream.indexOf(controls.x.key) === -1) {
        inputStream.push(controls.x.key);
        this.startTouch(controls.x);
      } else if (!controls.x) {
        if (inputStream.indexOf(_Config__WEBPACK_IMPORTED_MODULE_6__["default"].keys.LEFT) !== -1) {
          inputStream.splice(inputStream.indexOf(_Config__WEBPACK_IMPORTED_MODULE_6__["default"].keys.LEFT), 1);
          this.cancelTouch(touchControls.left);
        }

        if (inputStream.indexOf(_Config__WEBPACK_IMPORTED_MODULE_6__["default"].keys.RIGHT) !== -1) {
          inputStream.splice(inputStream.indexOf(_Config__WEBPACK_IMPORTED_MODULE_6__["default"].keys.RIGHT), 1);
          this.cancelTouch(touchControls.right);
        }
      }

      if (controls.y && inputStream.indexOf(controls.y.key) === -1) {
        inputStream.push(controls.y.key);
        this.startTouch(controls.y);
      } else if (!controls.y) {
        if (inputStream.indexOf(_Config__WEBPACK_IMPORTED_MODULE_6__["default"].keys.UP) !== -1) {
          inputStream.splice(inputStream.indexOf(_Config__WEBPACK_IMPORTED_MODULE_6__["default"].keys.UP), 1);
          this.cancelTouch(touchControls.up);
        }

        if (inputStream.indexOf(_Config__WEBPACK_IMPORTED_MODULE_6__["default"].keys.DOWN) !== -1) {
          inputStream.splice(inputStream.indexOf(_Config__WEBPACK_IMPORTED_MODULE_6__["default"].keys.DOWN), 1);
          this.cancelTouch(touchControls.down);
        }
      }
    }
  }, {
    key: "handleGamepadButtons",
    value: function handleGamepadButtons(gamepad) {
      for (var i = gamepad.buttons.length; i--;) {
        var control = this.getGamepad(i);

        if (control && inputStream.indexOf(control.key) === -1 && gamepad.buttons[i].pressed) {
          inputStream.push(control.key);
          this.startTouch(control);
        } else if (control && inputStream.indexOf(control.key) !== -1 && !gamepad.buttons[i].pressed) {
          inputStream.splice(inputStream.indexOf(control.key), 1);
          this.cancelTouch(control);
        }
      }
    }
  }, {
    key: "onGamepadConnected",
    value: function onGamepadConnected() {
      var _this6 = this;

      var gamepad = navigator.getGamepads()[0];
      this.stop();
      this.go(function () {
        gamepad = navigator.getGamepads()[0]; // GamePad Axes (dpad): [x, y]

        _this6.handleGamepadAxes(gamepad); // GamePad Buttons (a, b, start, select)


        _this6.handleGamepadButtons(gamepad);
      });
      _Utils__WEBPACK_IMPORTED_MODULE_5__["default"].log("GamePad Connected: ".concat(gamepad.id), gamepad);
    }
  }, {
    key: "onGamepadDisconnected",
    value: function onGamepadDisconnected() {
      this.stop();
    }
  }, {
    key: "clearTouches",
    value: function clearTouches() {
      Object.keys(touchControls).forEach(function (btn) {
        touchControls[btn].elem.classList.remove("is-active");
      });
    }
  }, {
    key: "cancelTouches",
    value: function cancelTouches() {
      var _this7 = this;

      Object.keys(touchControls).forEach(function (btn) {
        if (touchControls[btn].touched) {
          _this7.cancelTouch(touchControls[btn]);
        }
      });
    }
  }, {
    key: "cancelTouch",
    value: function cancelTouch(control) {
      if (control.timer) {
        clearInterval(control.timer);
        control.timer = null;
      }

      control.elem.classList.remove("is-active");
      control.touched = false;
      this.handleTouchEnd(control);
    }
  }, {
    key: "startTouch",
    value: function startTouch(control) {
      var _this8 = this;

      if (!control.timer) {
        control.elem.classList.add("is-active");
        control.touched = true;
        this.handleTouchStart(control);

        if (Object.prototype.hasOwnProperty.call(control, "hold") && !control.menu) {
          control.timer = setInterval(function () {
            _this8.handleTouchStart(control);
          }, touchInterval);
        }
      }
    }
  }, {
    key: "handleTouchStart",
    value: function handleTouchStart(control) {
      var _this9 = this;

      if (control.touched && control.menu && control.hold > 0) {
        control.hold++;
        return;
      }

      if (Object.prototype.hasOwnProperty.call(control, "hold")) {
        control.hold++;

        if (control.hold > touchRepeated) {
          this.emit("".concat(control.btn[0], "-holdpress"));
        } else {
          this.emit("".concat(control.btn[0], "-press"));
        }
      } else if (control.dpad) {
        control.dpad.forEach(function (dpad, i) {
          _this9.emit("".concat(control.btn[i], "-press"), dpad);
        });
      } else {
        this.emit("".concat(control.btn[0], "-press"), null);
      }
    }
  }, {
    key: "handleTouchEnd",
    value: function handleTouchEnd(control) {
      var _this10 = this;

      if (Object.prototype.hasOwnProperty.call(control, "hold")) {
        if (control.hold > touchRepeated) {
          this.emit("".concat(control.btn[0], "-holdrelease"));
        } else {
          this.emit("".concat(control.btn[0], "-release"));
        }

        control.hold = 0;
      } else if (control.dpad) {
        control.dpad.forEach(function (dpad, i) {
          _this10.emit("".concat(control.btn[i], "-release"), dpad);
        });
      } else {
        this.emit("".concat(control.btn[0], "-release"), null);
      }
    }
  }]);

  return GamePad;
}(_Controller__WEBPACK_IMPORTED_MODULE_7__["default"]);

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (GamePad);

/***/ }),

/***/ "./src/lib/Loader.js":
/*!***************************!*\
  !*** ./src/lib/Loader.js ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");


var cache = {};

var Loader = /*#__PURE__*/function () {
  function Loader() {
    (0,_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__["default"])(this, Loader);
  }

  (0,_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__["default"])(Loader, [{
    key: "load",
    value: function load(url) {
      var type = url.split("/").pop().split(".").pop();

      if (type === "png") {
        return this.loadImage(url);
      } else if (type === "mp3") {
        return this.loadAudio(url);
      } else if (type === "json") {
        return this.loadJson(url);
      }
    }
  }, {
    key: "loadImage",
    value: function loadImage(src) {
      return new Promise(function (resolve, reject) {
        if (cache[src]) {
          return resolve(cache[src]);
        }

        var image = new Image();

        image.onload = function () {
          cache[src] = image;
          resolve(cache[src]);
        };

        image.onerror = function () {
          reject();
        };

        image.src = src;
      });
    }
  }, {
    key: "loadAudio",
    value: function loadAudio(src) {
      return new Promise(function (resolve) {
        if (cache[src]) {
          return resolve(cache[src]);
        }

        var audio = new Audio();
        audio.addEventListener("loadedmetadata", function () {
          cache[src] = true;
          audio = null;
          resolve(cache[src]);
        }, false);
        audio.muted = true;
        audio.volume = 0;
        audio.src = src;
        audio.load();
      });
    }
  }, {
    key: "loadJson",
    value: function loadJson(url) {
      return new Promise(function (resolve) {
        if (cache[url]) {
          return resolve(cache[url]);
        }

        fetch(url).then(function (response) {
          response.json().then(function (json) {
            cache[url] = json;
            resolve(cache[url]);
          });
        });
      });
    }
  }], [{
    key: "cash",
    value: function cash(id, val) {
      if (val) {
        cache[id] = val;
      }

      return id ? cache[id] : cache;
    }
  }]);

  return Loader;
}();

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Loader);

/***/ }),

/***/ "./src/lib/Map.js":
/*!************************!*\
  !*** ./src/lib/Map.js ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ActiveTiles": () => (/* binding */ ActiveTiles),
/* harmony export */   "Map": () => (/* binding */ Map),
/* harmony export */   "MapLayer": () => (/* binding */ MapLayer),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _Utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Utils */ "./src/lib/Utils.js");
/* harmony import */ var _Loader__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Loader */ "./src/lib/Loader.js");
/* harmony import */ var _Config__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./Config */ "./src/lib/Config.js");
/* harmony import */ var _sprites_NPC__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./sprites/NPC */ "./src/lib/sprites/NPC.js");
/* harmony import */ var _sprites_FX__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./sprites/FX */ "./src/lib/sprites/FX.js");







/*******************************************************************************
* ActiveTiles
* Static and animated background tiles injected into the texture map.
* They work in groups based on tileset background position for rendering.
* They can have interactions with VERB system or can be attacked with weapon.
*******************************************************************************/

var ActiveTiles = /*#__PURE__*/function () {
  function ActiveTiles(data, map) {
    (0,_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__["default"])(this, ActiveTiles);

    this.data = data;
    this.map = map;
    this.gamebox = this.map.gamebox;
    this.frame = 0;
    this.spliced = [];
    this.previousElapsed = null;
  }

  (0,_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__["default"])(ActiveTiles, [{
    key: "destroy",
    value: function destroy() {}
  }, {
    key: "blit",
    value: function blit(elapsed) {
      if (this.previousElapsed === null) {
        this.previousElapsed = elapsed;
      }

      this.frame = 0;

      if (this.data.stepsX) {
        var diff = elapsed - this.previousElapsed;
        this.frame = Math.floor(diff / this.data.dur * this.data.stepsX);

        if (diff >= this.data.dur) {
          this.previousElapsed = elapsed;
          this.frame = this.data.stepsX - 1;
        }
      }
    }
  }, {
    key: "getTile",
    value: function getTile() {
      return [this.data.offsetX + this.frame * this.map.data.tilesize, this.data.offsetY];
    }
  }, {
    key: "canInteract",
    value: function canInteract() {
      return this.data.action;
    }
  }, {
    key: "canAttack",
    value: function canAttack() {
      return this.data.attack;
    }
  }, {
    key: "attack",
    value: function attack(coords) {
      this.splice(coords);
      this.map.gamebox.smokeObject({
        position: {
          x: coords[0] * this.map.data.tilesize,
          y: coords[1] * this.map.data.tilesize
        },
        width: this.map.data.tilesize,
        height: this.map.data.tilesize
      });
    }
  }, {
    key: "splice",
    value: function splice(coords) {
      for (var i = this.data.coords.length; i--;) {
        if (this.data.coords[i][0] === coords[0] && this.data.coords[i][1] === coords[1]) {
          this.spliced.push(this.data.coords[i]);
          this.data.coords.splice(i, 1);
          return true;
        }
      }
    }
  }]);

  return ActiveTiles;
}();
/*******************************************************************************
* MapLayer
* Normalize a rendering layer for Canvas and Context.
*******************************************************************************/


var MapLayer = /*#__PURE__*/function () {
  function MapLayer(data) {
    (0,_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__["default"])(this, MapLayer);

    this.data = data;
    this.build();
  }

  (0,_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__["default"])(MapLayer, [{
    key: "build",
    value: function build() {
      this.canvas = document.createElement("canvas");
      this.canvas.className = "_2dk__layer";
      this.canvas.dataset.layer = this.data.id;
      this.context = this.canvas.getContext("2d");
      this.update(this.data.width, this.data.height);
    }
  }, {
    key: "update",
    value: function update(width, height) {
      this.data.width = width;
      this.data.height = height;
      this.canvas.style.width = "".concat(width, "px");
      this.canvas.style.height = "".concat(height, "px");
      this.canvas.width = width;
      this.canvas.height = height;
    }
  }, {
    key: "clear",
    value: function clear() {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }, {
    key: "destroy",
    value: function destroy() {
      this.clear();
      this.canvas.width = 0;
      this.canvas.height = 0;
      this.context = null;
      this.canvas = null;
    }
  }]);

  return MapLayer;
}();
/*******************************************************************************
* Map
* The logic map.
* Everything is rendered via the Map as the Map is our game world.
* My preference is to keep this sort of logic out of the GameBox, which
* manages Map offset and Camera position.
*******************************************************************************/


var Map = /*#__PURE__*/function () {
  function Map(data, gamebox) {
    (0,_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__["default"])(this, Map);

    this.data = data;
    this.gamebox = gamebox;
    this.camera = this.gamebox.camera;
    this.width = this.data.width;
    this.height = this.data.height;
    this.image = _Loader__WEBPACK_IMPORTED_MODULE_3__["default"].cash(data.image);
    this.layers = {
      background: null,
      foreground: null
    };
    this.activeTiles = [];
    this.fx = [];
    this.npcs = [];
    this.offset = {
      x: 0,
      y: 0
    };
    this.build();
  }

  (0,_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__["default"])(Map, [{
    key: "destroy",
    value: function destroy() {
      var _this = this;

      Object.keys(this.layers).forEach(function (id) {
        _this.layers[id].offCanvas.destroy();
      });
      this.layers = null;
      this.activeTiles.forEach(function (activeTiles) {
        activeTiles.destroy();
      });
      this.activeTiles = null;
      this.npcs.forEach(function (npc) {
        npc.destroy();
      });
      this.npcs = null;
      this.fx.forEach(function (fx) {
        fx.destroy();
      });
      this.fx = null;
      this.image = null;
    }
  }, {
    key: "build",
    value: function build() {
      var _this2 = this;

      // Render layers
      Object.keys(this.layers).forEach(function (id) {
        _this2.addLayer(id);
      }); // FX

      this.data.fx.forEach(function (data) {
        _this2.fx.push(new _sprites_FX__WEBPACK_IMPORTED_MODULE_6__["default"](_this2.gamebox.player.getMergedData(data, "fx", true), _this2));
      }); // NPCs

      this.data.npcs.forEach(function (data) {
        _this2.npcs.push(new _sprites_NPC__WEBPACK_IMPORTED_MODULE_5__["default"](_this2.gamebox.player.getMergedData(data, "npcs"), _this2));
      }); // Tiles

      this.data.tiles.forEach(function (data) {
        _this2.activeTiles.push(new ActiveTiles(data, _this2));
      });
    }
  }, {
    key: "addLayer",
    value: function addLayer(id) {
      var offWidth = this.gamebox.camera.width + this.data.tilesize * 2;
      var offHeight = this.gamebox.camera.height + this.data.tilesize * 2;
      this.layers[id] = {};
      this.layers[id].offCanvas = new MapLayer({
        id: id,
        width: offWidth,
        height: offHeight
      });
      this.layers[id].offCanvas.canvas.width = "".concat(offWidth * this.gamebox.camera.resolution);
      this.layers[id].offCanvas.canvas.height = "".concat(offHeight * this.gamebox.camera.resolution);
    }
    /*******************************************************************************
    * Rendering
    * Order is: blit, update, render
    * Map data order is: tiles, objects, hero, npcs, fx
    *******************************************************************************/

  }, {
    key: "blit",
    value: function blit(elapsed) {
      this.activeTiles.forEach(function (activeTiles) {
        activeTiles.blit(elapsed);
      });
      this.npcs.forEach(function (npc) {
        npc.blit(elapsed);
      });
      this.fx.forEach(function (fx) {
        fx.blit(elapsed);
      });
    }
  }, {
    key: "update",
    value: function update(offset) {
      this.offset = offset;
      this.npcs.forEach(function (npc) {
        npc.update();
      });
      this.fx.forEach(function (fx) {
        fx.update();
      });
    }
  }, {
    key: "render",
    value: function render(camera) {
      this.clear();
      this.camera = camera;
      this.renderBox = this.getRenderbox(camera); // Separate background / foreground NPCs

      var npcsBg = this.npcs.filter(function (npc) {
        return npc.data.type !== _Config__WEBPACK_IMPORTED_MODULE_4__["default"].npc.FLOAT && npc.layer === "background";
      });
      var npcsFg = this.npcs.filter(function (npc) {
        return npc.data.type === _Config__WEBPACK_IMPORTED_MODULE_4__["default"].npc.FLOAT || npc.layer === "foreground";
      }); // Draw background textures

      this.renderTextures("background"); // Draw NPCs to background

      npcsBg.forEach(function (npc) {
        npc.render();
      }); // Draw foreground textures

      this.renderTextures("foreground"); // Draw NPCs to foreground
      // Float NPCs are included always

      npcsFg.forEach(function (npc) {
        npc.render();
      }); // Draw FX
      // This is the topmost layer so we can do cool stuff...

      this.fx.forEach(function (fx) {
        fx.render();
      });
    }
  }, {
    key: "renderTextures",
    value: function renderTextures(id) {
      // Draw textures to background / foreground
      _Utils__WEBPACK_IMPORTED_MODULE_2__["default"].drawMapTiles(this.layers[id].offCanvas.context, this.image, this.renderBox.textures[id], this.data.tilesize, this.data.tilesize); // Draw offscreen Map canvases to the onscreen World canvases

      this.gamebox.layers[id].onCanvas.context.drawImage(this.layers[id].offCanvas.canvas, 0, 0, this.layers[id].offCanvas.canvas.width, this.layers[id].offCanvas.canvas.height, this.renderBox.bleed.x, this.renderBox.bleed.y, this.layers[id].offCanvas.canvas.width, this.layers[id].offCanvas.canvas.height);
    }
  }, {
    key: "clear",
    value: function clear() {
      var _this3 = this;

      Object.keys(this.layers).forEach(function (id) {
        _this3.layers[id].offCanvas.clear();
      });
    }
  }, {
    key: "getRenderbox",
    value: function getRenderbox(camera) {
      var renderBox = {
        x: Math.floor(camera.x / this.data.tilesize) - 1,
        y: Math.floor(camera.y / this.data.tilesize) - 1,
        width: camera.width + this.data.tilesize * 2,
        height: camera.height + this.data.tilesize * 2,
        bleed: {},
        textures: {}
      };
      renderBox.bleed = this.getBleed(renderBox, camera);
      renderBox.textures = this.getTextures(renderBox, camera);
      return renderBox;
    }
  }, {
    key: "getBleed",
    value: function getBleed(renderBox, camera) {
      return {
        x: -(camera.x - renderBox.x * this.data.tilesize),
        y: -(camera.y - renderBox.y * this.data.tilesize)
      };
    }
  }, {
    key: "getTextures",
    value: function getTextures(renderBox) {
      var _this4 = this;

      var height = renderBox.height / this.data.tilesize;
      var width = renderBox.width / this.data.tilesize;
      var ret = {};
      Object.keys(this.data.textures).forEach(function (id) {
        var y = 0;
        ret[id] = [];

        while (y < height) {
          ret[id][y] = [];
          var lookupY = renderBox.y + y;

          if (_this4.data.textures[id][lookupY]) {
            var x = 0;

            while (x < width) {
              var lookupX = renderBox.x + x;

              if (_this4.data.textures[id][lookupY][lookupX]) {
                var celsCopy = _Utils__WEBPACK_IMPORTED_MODULE_2__["default"].copy(_this4.data.textures[id][lookupY][lookupX]);

                var activeTile = _this4.getActiveTile(id, [lookupX, lookupY], celsCopy); // Render the textures
                // Shift foreground behind hero render if coords determine so


                if (id === "foreground" && lookupY * _this4.data.tilesize < _this4.gamebox.hero.position.y) {
                  ret.background[y][x] = ret.background[y][x].concat(celsCopy);
                } else {
                  ret[id][y][x] = celsCopy;
                } // Push any ActiveTiles to the cel stack


                if (activeTile) {
                  ret[id][y][x].push(activeTile);
                }
              } else {
                ret[id][y][x] = 0;
              }

              x++;
            }
          }

          y++;
        }
      });
      return ret;
    }
  }, {
    key: "spliceActiveTile",
    value: function spliceActiveTile(group, coords) {
      var activeTiles = this.getActiveTiles(group);
      activeTiles.splice(coords);
    }
  }, {
    key: "getActiveTiles",
    value: function getActiveTiles(group) {
      return this.activeTiles.find(function (activeTiles) {
        return activeTiles.data.group === group;
      });
    }
  }, {
    key: "getActiveTile",
    value: function getActiveTile(layer, celsCoords, celsCopy) {
      // Either return a tile or don't if it's a static thing...
      var layerTiles = this.data.tiles.filter(function (tiles) {
        return tiles.layer === layer;
      });

      for (var i = layerTiles.length; i--;) {
        var tiles = layerTiles[i];
        var topCel = celsCopy[celsCopy.length - 1];

        if (tiles.coords.length) {
          for (var j = tiles.coords.length; j--;) {
            var coord = tiles.coords[j]; // Correct tile coords

            if (coord[0] === celsCoords[0] && coord[1] === celsCoords[1]) {
              // (tiles.offsetX === topCel[ 0 ] && tiles.offsetY === topCel[ 1 ])
              var isTileAnimated = tiles.stepsX; // Make sure we don't dupe a tile match if it's NOT animated...

              if (isTileAnimated) {
                return this.getActiveTiles(tiles.group).getTile();
              }
            }
          }
        }

        if (tiles.offsetX === topCel[0] && tiles.offsetY === topCel[1]) {
          // Check if tile is pushed...
          var isTilePushed = tiles.coords.find(function (coord) {
            return coord[0] === celsCoords[0] && coord[1] === celsCoords[1];
          });
          var isTileSpliced = this.getActiveTiles(tiles.group).spliced.find(function (coord) {
            return coord[0] === celsCoords[0] && coord[1] === celsCoords[1];
          }); // Push the tile to the coords Array...
          // This lets us generate ActiveTile groups that will
          // find their coordinates in real-time using background-position...

          /* Example: This will find stairs tiles and push them into the coords stack...
              {
                  "group": "stairs",
                  "layer": "background",
                  "coords": [],
                  "offsetX": 256,
                  "offsetY": 384
              }
          */

          if (!isTilePushed && !isTileSpliced) {
            tiles.coords.push(celsCoords);
            return true; // An ActiveTiles coord can be spliced during interaction.
            // Example: Hero picks up an action tile and throws it.
            // The original tile cel still exists in the textures data,
            // but we can capture this condition and make sure we pop
            // if off and no longer render it to the texture map.
          } else if (isTileSpliced) {
            celsCopy.pop();
            return celsCopy;
          }
        }
      }
    }
  }, {
    key: "addNPC",
    value: function addNPC(npc) {
      this.npcs.push(npc);
    }
  }, {
    key: "addFX",
    value: function addFX(fx) {
      this.fx.push(fx);
    }
  }, {
    key: "killObj",
    value: function killObj(type, obj) {
      this[type].splice(this[type].indexOf(obj), 1);
      obj.destroy();
      obj = null;
    }
  }]);

  return Map;
}();

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Map);


/***/ }),

/***/ "./src/lib/Player.js":
/*!***************************!*\
  !*** ./src/lib/Player.js ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/inherits */ "./node_modules/@babel/runtime/helpers/esm/inherits.js");
/* harmony import */ var _babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @babel/runtime/helpers/possibleConstructorReturn */ "./node_modules/@babel/runtime/helpers/esm/possibleConstructorReturn.js");
/* harmony import */ var _babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @babel/runtime/helpers/getPrototypeOf */ "./node_modules/@babel/runtime/helpers/esm/getPrototypeOf.js");
/* harmony import */ var _Utils__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./Utils */ "./src/lib/Utils.js");
/* harmony import */ var _Config__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./Config */ "./src/lib/Config.js");
/* harmony import */ var _GamePad__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./GamePad */ "./src/lib/GamePad.js");
/* harmony import */ var _plugins_TopView__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./plugins/TopView */ "./src/lib/plugins/TopView.js");
/* harmony import */ var _GameAudio__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./GameAudio */ "./src/lib/GameAudio.js");
/* harmony import */ var _Loader__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./Loader */ "./src/lib/Loader.js");
/* harmony import */ var _Controller__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./Controller */ "./src/lib/Controller.js");






function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0,_babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_4__["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0,_babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_4__["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0,_babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_3__["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }









var Player = /*#__PURE__*/function (_Controller) {
  (0,_babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_2__["default"])(Player, _Controller);

  var _super = _createSuper(Player);

  function Player() {
    var _this;

    (0,_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__["default"])(this, Player);

    _this = _super.call(this);
    _this.ready = false;
    _this.paused = true;
    _this.stopped = false;
    _this.Loader = _Loader__WEBPACK_IMPORTED_MODULE_10__["default"];
    _this.controls = {
      a: false,
      aHold: false,
      b: false,
      bHold: false,
      left: false,
      right: false,
      up: false,
      down: false
    };
    _this.query = _Utils__WEBPACK_IMPORTED_MODULE_5__["default"].getParams(window.location.search);
    _this.previousElapsed = null;

    _this.detect();

    return _this;
  }

  (0,_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__["default"])(Player, [{
    key: "detect",
    value: function detect() {
      // https://developer.mozilla.org/en-US/docs/Web/HTTP/Browser_detection_using_the_user_agent#mobile_tablet_or_desktop
      this.device = /Mobi/i.test(window.navigator.userAgent);
      this.installed = window.navigator.standalone || window.matchMedia("(display-mode: standalone)").matches;
    } // Debugging and feature flagging...

  }, {
    key: "debug",
    value: function debug() {
      if (this.query.map) {
        this.data.hero.map = "maps/".concat(this.query.map);
        this.data.hero.spawn = 0; // Can be overriden with below query string
      }

      if (this.query.resolution) {
        this.data.resolution = Number(this.query.resolution);
      }

      if (this.query.spawn) {
        this.data.hero.spawn = Number(this.query.spawn);
      }
    }
  }, {
    key: "load",
    value: function load() {
      var _this2 = this;

      this.loader = new _Loader__WEBPACK_IMPORTED_MODULE_10__["default"]();
      this.loader.loadJson("game.json").then(function (data) {
        _this2.data = data;
        _this2.data.hero = _Utils__WEBPACK_IMPORTED_MODULE_5__["default"].merge(_this2.data.heroes[_this2.data.hero.sprite], _this2.data.hero);

        _this2.debug();

        _this2.data.resolution = _this2.device ? 2 : _this2.data.resolution;
        _this2.width = _this2.data.width / _this2.data.resolution;
        _this2.height = _this2.data.height / _this2.data.resolution;

        _this2.build();

        _this2.onRotate();

        var counter = 0; // Audio is still experimental for mobile so disabling for now...

        var resources = data.bundle.filter(function (url) {
          var type = url.split("/").pop().split(".").pop();
          return _this2.device ? type !== "mp3" : true; // Map bundle resource URLs to a Loader promise types for initialization...
        }).map(function (url) {
          return _this2.loader.load(url).then(function () {
            counter++;
            _this2.splashLoad.innerHTML = _this2.getSplash("Loaded ".concat(counter, " of ").concat(resources.length, " game resources..."));
          });
        });
        Promise.all(resources).then(function () {
          _this2.splashLoad.innerHTML = _this2.getSplash("Press Start");
          _this2.gameaudio = new _GameAudio__WEBPACK_IMPORTED_MODULE_9__["default"](_this2);
          _this2.gamepad = new _GamePad__WEBPACK_IMPORTED_MODULE_7__["default"](_this2);

          if (_this2.data.plugin === _Config__WEBPACK_IMPORTED_MODULE_6__["default"].plugins.TOPVIEW) {
            _this2.gamebox = new _plugins_TopView__WEBPACK_IMPORTED_MODULE_8__["default"](_this2);
          }

          _this2.bind();
        });
      });
    }
  }, {
    key: "getSplash",
    value: function getSplash(display) {
      return "\n            <div>\n                <div>".concat(this.data.name, ": Save #").concat(this.data.save, ", Release v").concat(this.data.release, "</div>\n                <div>").concat(display, "</div>\n            </div>\n        ");
    }
  }, {
    key: "getMergedData",
    value: function getMergedData(data, type) {
      var force = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      return _Utils__WEBPACK_IMPORTED_MODULE_5__["default"].merge(this.data[type].find(function (obj) {
        return obj.id === data.id;
      }), data, force);
    }
  }, {
    key: "getOrientation",
    value: function getOrientation() {
      return "orientation" in window ? window.orientation : window.screen.orientation.angle;
    }
  }, {
    key: "build",
    value: function build() {
      this.element = document.createElement("div");
      this.element.className = "_2dk";
      this.element.dataset.resolution = this.data.resolution;
      this.screen = document.createElement("div");
      this.screen.className = "_2dk__screen";
      this.screen.style.width = "".concat(this.width, "px");
      this.screen.style.height = "".concat(this.height, "px");
      this.splash = document.createElement("div");
      this.splash.className = "_2dk__splash";
      this.splashInfo = document.createElement("div");
      this.splashInfo.className = "_2dk__splash__info";
      this.splashInfo.innerHTML = "<div>Rotate to Landscape.</div><div>".concat(this.installed ? "Webapp Installed" : "Install Webapp", "</div>");
      this.splashLoad = document.createElement("div");
      this.splashLoad.className = "_2dk__splash__load";
      this.splashLoad.innerHTML = this.getSplash("Loading game bundle...");
      this.splash.appendChild(this.splashInfo);
      this.splash.appendChild(this.splashLoad);
      this.element.appendChild(this.splash);
      this.element.appendChild(this.screen);
      document.body.appendChild(this.element);
    }
  }, {
    key: "bind",
    value: function bind() {
      // Standard 4 point d-pad (action)
      this.gamepad.on("left-press", this.onDpadPress.bind(this));
      this.gamepad.on("right-press", this.onDpadPress.bind(this));
      this.gamepad.on("up-press", this.onDpadPress.bind(this));
      this.gamepad.on("down-press", this.onDpadPress.bind(this)); // Standard 4 point d-pad (cancel)

      this.gamepad.on("left-release", this.onDpadRelease.bind(this));
      this.gamepad.on("right-release", this.onDpadRelease.bind(this));
      this.gamepad.on("up-release", this.onDpadRelease.bind(this));
      this.gamepad.on("down-release", this.onDpadRelease.bind(this)); // Start button (pause)

      this.gamepad.on("start-press", this.onPressStart.bind(this)); // A button (action)

      this.gamepad.on("a-press", this.onPressA.bind(this));
      this.gamepad.on("a-release", this.onReleaseA.bind(this));
      this.gamepad.on("a-holdpress", this.onPressHoldA.bind(this));
      this.gamepad.on("a-holdrelease", this.onReleaseHoldA.bind(this)); // B button (cancel)

      this.gamepad.on("b-press", this.onPressB.bind(this));
      this.gamepad.on("b-holdpress", this.onPressHoldB.bind(this));
      this.gamepad.on("b-release", this.onReleaseB.bind(this));
      this.gamepad.on("b-holdrelease", this.onReleaseHoldB.bind(this)); // Screen size / Orientation change

      window.onresize = this.onRotate.bind(this);
    } // Stops game button events from dispatching to the gamebox

  }, {
    key: "pause",
    value: function pause() {
      this.paused = true;
      this.gamepad.clear();
      this.gamebox.pause(true);
    } // Stops the gamebox from rendering

  }, {
    key: "stop",
    value: function stop() {
      this.stopped = true;
      this.gamepad.clear();
      this.gamebox.pause(true);
    } // Resumes playable state, not paused and not stopped

  }, {
    key: "resume",
    value: function resume() {
      this.paused = false;
      this.stopped = false;
      this.gamebox.pause(false);
    }
  }, {
    key: "onRotate",
    value: function onRotate() {
      if (Math.abs(this.getOrientation()) === 90) {
        if (this.ready) {
          this.resume();
        }
      } else {
        if (this.ready) {
          this.pause();
          this.stop();
        }
      }
    }
  }, {
    key: "onReady",
    value: function onReady() {
      if (!this.ready) {
        this.ready = true;
        this.element.classList.add("is-started"); // Game cycle (requestAnimationFrame)

        this.go(this.onGameBlit.bind(this));
      }
    }
  }, {
    key: "onGameBlit",
    value: function onGameBlit(elapsed) {
      var _this3 = this;

      this.previousElapsed = elapsed; // Rendering happens if NOT stopped

      if (!this.stopped) {
        this.gamebox.blit(elapsed);
      } // Soft pause only affects Hero updates and NPCs
      // Hard stop will affect the entire blit/render engine...


      if (!this.paused) {
        // D-Pad movement
        // Easier to check the gamepad than have player use event handlers...
        var dpad = this.gamepad.checkDpad();

        if (!dpad.length) {
          this.gamebox.releaseD();
          this.gamebox.handleHero(this.gamebox.hero.getNextPoi(), this.gamebox.hero.dir);
        } else {
          dpad.forEach(function (ctrl) {
            ctrl.dpad.forEach(function (dir) {
              _this3.gamebox.pressD(dir);
            });
          });
        } // Action buttons
        // Easier to have the player use event handlers and check controls...


        if (this.controls.aHold) {
          this.gamebox.holdA();
        } else if (this.controls.a) {
          this.gamebox.pressA();
        }

        if (this.controls.bHold) {
          this.gamebox.holdB();
        } else if (this.controls.b) {
          this.gamebox.pressB();
        }
      }
    }
  }, {
    key: "onPressStart",
    value: function onPressStart() {
      if (!this.ready) {
        this.onReady();
      }

      if (this.paused) {
        this.resume();
        this.emit(_Config__WEBPACK_IMPORTED_MODULE_6__["default"].broadcast.RESUMED);
      } else {
        this.pause();
        this.stop();
        this.emit(_Config__WEBPACK_IMPORTED_MODULE_6__["default"].broadcast.PAUSED);
      }
    }
  }, {
    key: "onDpadPress",
    value: function onDpadPress(dir) {
      this.controls[dir] = true;
    }
  }, {
    key: "onDpadRelease",
    value: function onDpadRelease(dir) {
      this.controls[dir] = false;
    }
  }, {
    key: "onPressA",
    value: function onPressA() {
      this.controls.a = true;
    }
  }, {
    key: "onPressHoldA",
    value: function onPressHoldA() {
      this.controls.aHold = true;
    }
  }, {
    key: "onReleaseA",
    value: function onReleaseA() {
      this.controls.a = false;
      this.gamebox.releaseA && this.gamebox.releaseA();
    }
  }, {
    key: "onReleaseHoldA",
    value: function onReleaseHoldA() {
      this.controls.a = false;
      this.controls.aHold = false;
      this.gamebox.releaseHoldA && this.gamebox.releaseHoldA();
    }
  }, {
    key: "onPressB",
    value: function onPressB() {
      this.controls.b = true;
    }
  }, {
    key: "onPressHoldB",
    value: function onPressHoldB() {
      this.controls.bHold = true;
    }
  }, {
    key: "onReleaseB",
    value: function onReleaseB() {
      this.controls.b = false;
      this.controls.bHold = false;
      this.gamebox.releaseB && this.gamebox.releaseB();
    }
  }, {
    key: "onReleaseHoldB",
    value: function onReleaseHoldB() {
      this.controls.b = false;
      this.controls.bHold = false;
      this.gamebox.releaseHoldB && this.gamebox.releaseHoldB();
    }
  }]);

  return Player;
}(_Controller__WEBPACK_IMPORTED_MODULE_11__["default"]);

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Player);

/***/ }),

/***/ "./src/lib/Spring.js":
/*!***************************!*\
  !*** ./src/lib/Spring.js ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _Config__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Config */ "./src/lib/Config.js");




var Spring = /*#__PURE__*/function () {
  function Spring(player) {
    var _this = this;

    var x = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    var y = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
    var stiffness = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 30;
    var damping = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 1.5;
    var mass = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 0.1;

    (0,_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__["default"])(this, Spring);

    this.player = player;
    this.position = {
      x: x,
      y: y
    };
    this.poi = {
      x: x,
      y: y
    };
    this.velocity = {
      x: 0,
      y: 0
    };
    this.mass = mass;
    this.stiffness = stiffness;
    this.damping = damping;
    this.errorMargin = 0.001;
    this.isResting = false;
    this.sprite = null;
    this.previousElapsed = null;
    this.player.on(_Config__WEBPACK_IMPORTED_MODULE_2__["default"].broadcast.PAUSED, function () {
      _this.previousElapsed = null;
    });
  }

  (0,_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__["default"])(Spring, [{
    key: "bind",
    value: function bind(sprite) {
      this.sprite = sprite;
    }
  }, {
    key: "blit",
    value: function blit(elapsed) {
      if (this.previousElapsed === null) {
        this.previousElapsed = elapsed;
      }

      if (Math.abs(this.position.x - this.poi.x) < this.errorMargin && Math.abs(this.position.y - this.poi.y) < this.errorMargin) {
        this.previousElapsed = elapsed;
        this.isResting = true;
        return;
      }

      var timeSinceLastFrame = elapsed - this.previousElapsed;
      var timeStep = timeSinceLastFrame / 1000;
      this.previousElapsed = elapsed;
      this.isResting = false;
      var springX = -this.stiffness * (this.position.x - this.poi.x);
      var damperX = -this.damping * this.velocity.x;
      var accelerationX = (springX + damperX) / this.mass;
      var springY = -this.stiffness * (this.position.y - this.poi.y);
      var damperY = -this.damping * this.velocity.y;
      var accelerationY = (springY + damperY) / this.mass;
      this.velocity.x += accelerationX * timeStep;
      this.velocity.y += accelerationY * timeStep;
      this.position.x += this.velocity.x * timeStep;
      this.position.y += this.velocity.y * timeStep;

      if (this.sprite) {
        this.sprite.position.x = this.position.x;
        this.sprite.position.y = this.position.y;
      }
    }
  }]);

  return Spring;
}();

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Spring);

/***/ }),

/***/ "./src/lib/Utils.js":
/*!**************************!*\
  !*** ./src/lib/Utils.js ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _Config__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Config */ "./src/lib/Config.js");

var Utils = {
  dev: function dev() {
    return /^file:|^localhost/.test(window.location.href);
  },
  log: function log() {
    if (Utils.dev()) {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      console.log.apply(console, args);
    }
  },
  error: function error() {
    if (Utils.dev()) {
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      console.error.apply(console, args);
    }
  },
  copy: function copy(obj) {
    // Deep copy for non-mutation of origin `obj`
    return JSON.parse(JSON.stringify(obj));
  },
  merge: function merge(base, pr, f) {
    base = Utils.copy(base);
    pr = Utils.copy(pr);
    Object.keys(pr).forEach(function (i) {
      if (!base[i] || f) {
        base[i] = pr[i];
      }
    });
    return base;
  },
  collide: function collide(box1, box2) {
    var ret = false;

    if (box1.x < box2.x + box2.width && box1.x + box1.width > box2.x && box1.y < box2.y + box2.height && box1.height + box1.y > box2.y) {
      ret = {
        // box1.x1 snapped to ZERO
        x: Math.max(0, box1.x - box2.x),
        // box1.y1 snapped to ZERO
        y: Math.max(0, box1.y - box2.y),
        // box1.x2 snapped to BOX2.WIDTH
        width: Math.min(box2.width, box1.x - box2.x + box1.width) - Math.max(0, box1.x - box2.x),
        // box1.y2 snapped to BOX2.HEIGHT
        height: Math.min(box2.height, box1.y - box2.y + box1.height) - Math.max(0, box1.y - box2.y)
      };
    }

    return ret;
  },

  /*
  ctx.drawImage(
      img/cvs,
      mask-x,
      mask-y,
      mask-width,
      mask-height,
      x-position,
      y-position,
      width,
      height
  )
  */
  drawTileCel: function drawTileCel(context, image, tileSize, gridSize, mx, my, px, py) {
    context.drawImage(image, mx, my, tileSize, tileSize, px * gridSize, py * gridSize, gridSize, gridSize);
  },
  drawMapTile: function drawMapTile(context, image, tile, tileSize, gridSize, x, y) {
    // Position has tiles: Array[Array[x, y], Array[x, y]]
    if (Array.isArray(tile)) {
      for (var i = 0, len = tile.length; i < len; i++) {
        this.drawTileCel(context, image, tileSize, gridSize, tile[i][0], tile[i][1], x, y);
      } // Position has no tile: 0

    } else {
      context.clearRect(x * gridSize, y * gridSize, gridSize, gridSize);
    }
  },
  drawMapTiles: function drawMapTiles(context, image, textures, tileSize, gridSize) {
    for (var y = textures.length; y--;) {
      var row = textures[y];

      for (var x = row.length; x--;) {
        var tile = row[x];
        this.drawMapTile(context, image, tile, tileSize, gridSize, x, y);
      }
    }
  },
  drawGridLines: function drawGridLines(ctx, w, h, g) {
    ctx.globalAlpha = 1.0;

    for (var y = 1; y < h; y++) {
      ctx.fillStyle = _Config__WEBPACK_IMPORTED_MODULE_0__["default"].colors.teal;
      ctx.fillRect(0, y * g, g * w, 1);
    }

    for (var x = 1; x < w; x++) {
      ctx.fillStyle = _Config__WEBPACK_IMPORTED_MODULE_0__["default"].colors.teal;
      ctx.fillRect(x * g, 0, 1, g * h);
    }
  },
  getParams: function getParams(str) {
    var query = decodeURIComponent(str).match(/[#|?].*$/g);
    var ret = {};

    if (query) {
      query = query[0].replace(/^\?|^#|^\/|\/$|\[|\]/g, "");
      query = query.split("&");

      for (var i = query.length; i--;) {
        var pair = query[i].split("=");
        var key = pair[0];
        var val = pair[1];

        if (ret[key]) {
          if (!Array.isArray(ret[key])) {
            ret[key] = [ret[key]];
          }

          ret[key].push(val);
        } else {
          ret[key] = val;
        }
      }
    }

    return ret;
  },
  // From Akihabara helpers:
  // https://github.com/Akihabara/akihabara/blob/master/src/helpers.js#L78
  random: function random(min, range) {
    return min + Math.floor(Math.random() * range);
  },
  // https://github.com/Akihabara/akihabara/blob/master/src/helpers.js#L103
  limit: function limit(v, min, max) {
    if (v < min) {
      return min;
    } else {
      if (v > max) {
        return max;
      } else {
        return v;
      }
    }
  },
  // https://github.com/Akihabara/akihabara/blob/master/src/helpers.js#L122
  goToZero: function goToZero(v) {
    return v ? v - v / Math.abs(v) : 0;
  },
  // From Akihabara trigo:

  /**
   * Gets the distance between two points.
   * 
   * @param {object} p1 This is an object containing x and y params for the first point.
   * @param {object} p2 This is an object containing x and y params for the second point.
   * @returns {number} The distance between p1 and p2.
   */
  getDistance: function getDistance(p1, p2) {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  }
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Utils);

/***/ }),

/***/ "./src/lib/plugins/TopView.js":
/*!************************************!*\
  !*** ./src/lib/plugins/TopView.js ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/inherits */ "./node_modules/@babel/runtime/helpers/esm/inherits.js");
/* harmony import */ var _babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @babel/runtime/helpers/possibleConstructorReturn */ "./node_modules/@babel/runtime/helpers/esm/possibleConstructorReturn.js");
/* harmony import */ var _babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @babel/runtime/helpers/getPrototypeOf */ "./node_modules/@babel/runtime/helpers/esm/getPrototypeOf.js");
/* harmony import */ var _Utils__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../Utils */ "./src/lib/Utils.js");
/* harmony import */ var _Config__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../Config */ "./src/lib/Config.js");
/* harmony import */ var _Loader__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../Loader */ "./src/lib/Loader.js");
/* harmony import */ var _GameBox__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../GameBox */ "./src/lib/GameBox.js");
/* harmony import */ var _Map__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../Map */ "./src/lib/Map.js");
/* harmony import */ var _Spring__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../Spring */ "./src/lib/Spring.js");
/* harmony import */ var _sprites_Sprite__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../sprites/Sprite */ "./src/lib/sprites/Sprite.js");
/* harmony import */ var _sprites_Companion__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../sprites/Companion */ "./src/lib/sprites/Companion.js");






function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0,_babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_4__["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0,_babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_4__["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0,_babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_3__["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }










var TopView = /*#__PURE__*/function (_GameBox) {
  (0,_babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_2__["default"])(TopView, _GameBox);

  var _super = _createSuper(TopView);

  function TopView(player) {
    var _this;

    (0,_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__["default"])(this, TopView);

    _this = _super.call(this, player); // Interactions

    _this.interact = {
      // tile: {
      //     group?,
      //     coord?,
      //     throw?,
      //     sprite?
      //     spring?
      // }
      push: 0
    }; // parkour: {
    //     distance,
    //     landing: { x, y }
    // }

    _this.attacking = false;
    _this.parkour = false;
    _this.jumping = false;
    _this.falling = false;
    _this.locked = false;
    _this.dropin = false;
    _this.keyTimer = null;
    return _this;
  }
  /*******************************************************************************
  * Rendering
  * Order is: blit, update, render
  *******************************************************************************/


  (0,_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__["default"])(TopView, [{
    key: "blit",
    value: function blit(elapsed) {
      this.clear(); // blit hero

      this.hero.blit(elapsed); // blit companion

      if (this.companion) {
        this.companion.blit(elapsed);
      } // blit map


      this.map.blit(elapsed); // blit interaction tile sprite?

      if (this.interact.tile && this.interact.tile.sprite && this.interact.tile.spring) {
        this.handleThrowing(elapsed);
      } // update gamebox (camera)


      this.update(); // update hero

      this.hero.update(); // update companion

      if (this.companion) {
        this.companion.update();
      } // update map


      this.map.update(this.offset); // render companion behind hero?

      if (this.companion && this.companion.data.type !== _Config__WEBPACK_IMPORTED_MODULE_6__["default"].npc.FLOAT && this.companion.hitbox.y < this.hero.hitbox.y) {
        this.companion.render();
      } // render hero


      this.hero.render(); // render companion infront of hero?

      if (this.companion && this.companion.data.type !== _Config__WEBPACK_IMPORTED_MODULE_6__["default"].npc.FLOAT && this.companion.hitbox.y > this.hero.hitbox.y) {
        this.companion.render();
      } // render map


      this.map.render(this.camera); // render companion infront of everything?

      if (this.companion && this.companion.data.type === _Config__WEBPACK_IMPORTED_MODULE_6__["default"].npc.FLOAT) {
        this.companion.render();
      }
    }
  }, {
    key: "update",
    value: function update() {
      var x = this.hero.position.x - (this.camera.width / 2 - this.hero.width / 2);
      var y = this.hero.position.y - (this.camera.height / 2 - this.hero.height / 2);
      var offset = {};

      if (x >= 0 && x <= this.map.width - this.camera.width) {
        offset.x = -x;
      } else {
        if (x >= this.map.width - this.camera.width) {
          offset.x = -(this.map.width - this.camera.width);
        } else {
          offset.x = 0;
        }
      }

      if (y >= 0 && y <= this.map.height - this.camera.height) {
        offset.y = -y;
      } else {
        if (y >= this.map.height - this.camera.height) {
          offset.y = -(this.map.height - this.camera.height);
        } else {
          offset.y = 0;
        }
      }

      this.offset = offset;
      this.camera.x = Math.abs(offset.x);
      this.camera.y = Math.abs(offset.y);
    }
    /*******************************************************************************
    * GamePad Inputs
    *******************************************************************************/

  }, {
    key: "pressD",
    value: function pressD(dir) {
      var poi = this.hero.getNextPoiByDir(dir);
      this.handleHero(poi, dir);
    }
  }, {
    key: "releaseD",
    value: function releaseD() {
      if (this.locked || this.jumping || this.falling || this.attacking) {
        return;
      }

      if (this.interact.push) {
        this.interact.push = 0;
      }

      if (this.interact.tile) {
        this.hero.cycle(this.hero.verb, this.hero.dir);
      } else {
        this.hero.face(this.hero.dir);
      }
    }
  }, {
    key: "pressA",
    value: function pressA() {
      if (this.locked || this.jumping || this.falling || this.attacking) {
        return;
      }

      var poi = this.hero.getNextPoiByDir(this.hero.dir, 1);
      var collision = {
        npc: this.checkNPC(poi, this.hero),
        tiles: this.checkTiles(poi, this.hero)
      };

      if (collision.npc) {
        this.handleHeroNPCAction(poi, this.hero.dir, collision.npc);
      } else if (collision.tiles && collision.tiles.action.length && collision.tiles.action[0].action) {
        if (!this.interact.tile) {
          this.handleHeroTileAction(poi, this.hero.dir, collision.tiles.action[0]);
        } // Jump...

      } else if (this.hero.verb !== _Config__WEBPACK_IMPORTED_MODULE_6__["default"].verbs.LIFT && this.hero.verb !== _Config__WEBPACK_IMPORTED_MODULE_6__["default"].verbs.GRAB) {
        this.handleHeroJump(poi, this.hero.dir);
      }
    }
  }, {
    key: "holdA",
    value: function holdA() {
      if (this.jumping || this.falling || this.attacking) {
        return;
      }

      _Utils__WEBPACK_IMPORTED_MODULE_5__["default"].log("A Hold");
    }
  }, {
    key: "releaseA",
    value: function releaseA() {
      if (this.jumping || this.falling || this.attacking) {
        return;
      }

      this.dialogue.check(true, false);
      this.handleReleaseA();
    }
  }, {
    key: "releaseHoldA",
    value: function releaseHoldA() {
      if (this.jumping || this.falling || this.attacking) {
        return;
      }

      this.handleReleaseA();
    }
  }, {
    key: "pressB",
    value: function pressB() {
      if (this.attacking) {
        return;
      } // There will be extra blocking checks wrapped around this action


      if (!this.jumping) {
        this.handleHeroAttack();
      }
    }
  }, {
    key: "holdB",
    value: function holdB() {
      if (this.jumping || this.falling || this.attacking) {
        return;
      }

      _Utils__WEBPACK_IMPORTED_MODULE_5__["default"].log("B Hold");
    }
  }, {
    key: "releaseB",
    value: function releaseB() {
      if (this.jumping || this.falling) {
        return;
      }

      if (this.attacking) {
        this.attacking = false;
      }

      this.dialogue.check(false, true);
    }
  }, {
    key: "releaseHoldB",
    value: function releaseHoldB() {
      if (this.jumping || this.falling) {
        return;
      }

      if (this.attacking) {
        this.attacking = false;
      }

      _Utils__WEBPACK_IMPORTED_MODULE_5__["default"].log("B Hold Release");
    }
    /*******************************************************************************
    * Hero Handlers...
    *******************************************************************************/

  }, {
    key: "handleReleaseA",
    value: function handleReleaseA() {
      if (this.jumping || this.attacking) {
        return;
      }

      if (this.hero.verb === _Config__WEBPACK_IMPORTED_MODULE_6__["default"].verbs.GRAB) {
        this.hero.face(this.hero.dir);
      }

      if (this.hero.verb === _Config__WEBPACK_IMPORTED_MODULE_6__["default"].verbs.LIFT) {
        if (this.interact.tile["throw"]) {
          this.handleHeroThrow();
        } else {
          this.interact.tile["throw"] = true;
        }
      } else {
        delete this.interact.tile;
      }
    }
  }, {
    key: "applyHero",
    value: function applyHero(poi, dir) {
      // Apply position
      this.hero.applyPosition(poi, dir); // Applly offset

      this.hero.applyOffset(); // Apply the sprite animation cycle

      this.hero.applyCycle();
    }
  }, {
    key: "handleCriticalReset",
    value: function handleCriticalReset() {
      // Timer used for jumping / parkour
      if (this.keyTimer) {
        clearTimeout(this.keyTimer);
        this.keyTimer = null;
      } // Applied for parkour


      this.player.controls[this.hero.dir] = false; // To kill any animated sprite cycling (jump etc...)

      this.hero.face(this.hero.dir); // Reset flags

      this.parkour = false;
      this.jumping = false;
      this.falling = false;
      this.attacking = false;
    }
  }, {
    key: "handleHero",
    value: function handleHero(poi, dir) {
      var collision = {
        map: this.checkMap(poi, this.hero),
        npc: this.checkNPC(poi, this.hero),
        tiles: this.checkTiles(poi, this.hero),
        event: this.checkEvents(poi, this.hero),
        camera: this.checkCamera(poi, this.hero)
      };

      if (this.locked || this.jumping || this.falling || this.parkour) {
        this.interact.push = 0;
      }

      if (this.locked || this.falling || this.attacking) {
        return;
      } else if (this.parkour) {
        if (collision.event) {
          if (this.canHeroEventDoor(poi, dir, collision) && collision.event.amount >= 786 / this.camera.resolution) {
            this.dropin = true;
            this.handleCriticalReset();
            this.handleHeroEventDoor(poi, dir, collision.event);
            return;
          }
        }

        this.applyHeroTileJump(poi, dir);
        this.applyHero(poi, dir);
        return;
      } else if (this.jumping) {
        if (this.canHeroMoveWhileJumping(poi, dir, collision)) {
          this.applyHero(poi, dir);
        }

        return;
      }

      if (collision.event) {
        if (this.canHeroEventBoundary(poi, dir, collision)) {
          this.handleHeroEventBoundary(poi, dir, collision.event);
          return;
        } else if (this.canHeroEventDoor(poi, dir, collision)) {
          this.handleHeroEventDoor(poi, dir, collision.event);
          return;
        }
      }

      if (collision.npc) {
        this.handleHeroPush(poi, dir);
        return;
      }

      if (collision.map) {
        // Tile will allow leaping from it's edge, like a ledge...
        if (this.canHeroTileJump(poi, dir, collision)) {
          this.handleHeroTileJump(poi, dir, collision.tiles.action[0]);
        } else {
          this.handleHeroPush(poi, dir);
          return;
        }
      }

      if (collision.camera) {
        this.handleHeroCamera(poi, dir);
        return;
      }

      if (this.hero.verb === _Config__WEBPACK_IMPORTED_MODULE_6__["default"].verbs.GRAB) {
        if (this.canHeroLift(poi, dir, collision)) {
          this.handleHeroLift(poi, dir);
        }

        return;
      }

      if (collision.tiles) {
        this.handleHeroTiles(poi, dir, collision.tiles); // Tile is behaves like a WALL, or Object you cannot walk on

        if (this.canHeroTileStop(poi, dir, collision)) {
          this.handleHeroPush(poi, dir, collision.tiles.action[0]);
          return;
        }
      } else if (this.canHeroResetMaxV(poi, dir, collision)) {
        this.hero.physics.maxv = this.hero.physics.controlmaxv;
      }

      this.applyHero(poi, dir);
    }
  }, {
    key: "canHeroMoveWhileJumping",
    value: function canHeroMoveWhileJumping(poi, dir, collision) {
      return !collision.map && !collision.npc && !(collision.tiles && collision.tiles.action.length && collision.tiles.action[0].stop);
    }
  }, {
    key: "canHeroResetMaxV",
    value: function canHeroResetMaxV() {
      return this.hero.physics.maxv !== this.hero.physics.controlmaxv && this.hero.verb !== _Config__WEBPACK_IMPORTED_MODULE_6__["default"].verbs.LIFT;
    }
  }, {
    key: "canHeroEventDoor",
    value: function canHeroEventDoor(poi, dir, collision) {
      return collision.event.type === _Config__WEBPACK_IMPORTED_MODULE_6__["default"].events.DOOR;
    }
  }, {
    key: "canHeroEventBoundary",
    value: function canHeroEventBoundary(poi, dir, collision) {
      return collision.event.type === _Config__WEBPACK_IMPORTED_MODULE_6__["default"].events.BOUNDARY && collision.camera;
    }
  }, {
    key: "canHeroTileStop",
    value: function canHeroTileStop(poi, dir, collision) {
      return collision.tiles && collision.tiles.action.length && collision.tiles.action[0].stop;
    }
  }, {
    key: "canHeroLift",
    value: function canHeroLift(poi, dir) {
      return dir === _Config__WEBPACK_IMPORTED_MODULE_6__["default"].opposites[this.hero.dir];
    }
  }, {
    key: "canHeroTileJump",
    value: function canHeroTileJump(poi, dir, collision) {
      return collision.tiles && collision.tiles.action.length && collision.tiles.action[0].jump && (collision.tiles.action[0].collides.width > collision.tiles.action[0].tilebox.width / 2 || collision.tiles.action[0].collides.height > collision.tiles.action[0].tilebox.height / 2) && this.hero.verb !== _Config__WEBPACK_IMPORTED_MODULE_6__["default"].verbs.LIFT && dir === collision.tiles.action[0].instance.data.action.require.dir;
    }
  }, {
    key: "handleHeroJump",
    value: function handleHeroJump() {
      var _this2 = this;

      this.jumping = true;
      this.hero.cycle(_Config__WEBPACK_IMPORTED_MODULE_6__["default"].verbs.JUMP, this.hero.dir);
      this.hero.physics.vz = -16;
      this.player.gameaudio.hitSound(_Config__WEBPACK_IMPORTED_MODULE_6__["default"].verbs.JUMP);
      this.keyTimer = setTimeout(function () {
        _this2.jumping = false;

        _this2.hero.face(_this2.hero.dir);
      }, this.hero.getDur(_Config__WEBPACK_IMPORTED_MODULE_6__["default"].verbs.JUMP));
    }
  }, {
    key: "applyHeroTileJump",
    value: function applyHeroTileJump(poi, dir) {
      var _this3 = this;

      this.player.controls[this.hero.dir] = true;

      if (dir === "left" && this.hero.position.x <= this.parkour.landing.x || dir === "right" && this.hero.position.x >= this.parkour.landing.x || dir === "up" && this.hero.position.y <= this.parkour.landing.y || dir === "down" && this.hero.position.y >= this.parkour.landing.y) {
        var dpad = this.player.gamepad.checkDpad();
        var dpadDir = dpad.find(function (ctrl) {
          return ctrl.btn[0] === _this3.hero.dir;
        });

        if (!dpadDir) {
          this.player.controls[this.hero.dir] = false;
        }

        this.parkour = false;
        this.hero.face(this.hero.dir);
      }
    }
  }, {
    key: "handleHeroTileJump",
    value: function handleHeroTileJump(poi, dir, tile) {
      var _this4 = this;

      var dirs = ["left", "right", "up", "down"];
      var distance = this.map.data.tilesize + this.map.data.tilesize * tile.instance.data.elevation;
      dirs.forEach(function (d) {
        _this4.player.controls[d] = false;
      });
      this.parkour = {
        distance: distance,
        landing: {
          x: dir === "left" ? this.hero.position.x - distance : dir === "right" ? this.hero.position.x + distance : this.hero.position.x,
          y: dir === "up" ? this.hero.position.y - distance : dir === "down" ? this.hero.position.y + distance : this.hero.position.y
        }
      };
      this.jumping = true;
      this.hero.cycle(_Config__WEBPACK_IMPORTED_MODULE_6__["default"].verbs.JUMP, dir);
      this.hero.physics.vz = -16;
      this.player.controls[dir] = true;
      this.player.gameaudio.hitSound("parkour");
      this.keyTimer = setTimeout(function () {
        _this4.jumping = false;

        _this4.hero.face(dir);
      }, this.hero.getDur(_Config__WEBPACK_IMPORTED_MODULE_6__["default"].verbs.JUMP));
    }
  }, {
    key: "handleHeroPush",
    value: function handleHeroPush(poi, dir) {
      this.interact.push++;

      if (this.hero.verb !== _Config__WEBPACK_IMPORTED_MODULE_6__["default"].verbs.LIFT && this.interact.push > this.map.data.tilesize) {
        this.hero.cycle(_Config__WEBPACK_IMPORTED_MODULE_6__["default"].verbs.PUSH, dir);
      } else if (this.hero.verb !== _Config__WEBPACK_IMPORTED_MODULE_6__["default"].verbs.LIFT) {
        this.hero.cycle(_Config__WEBPACK_IMPORTED_MODULE_6__["default"].verbs.WALK, dir);
      }
    }
  }, {
    key: "handleHeroCamera",
    value: function handleHeroCamera(poi, dir) {
      this.hero.cycle(this.hero.verb, dir);
    }
  }, {
    key: "handleHeroEventDoor",
    value: function handleHeroEventDoor(poi, dir, event) {
      this.changeMap(event);
      this.player.stop();
    }
  }, {
    key: "handleHeroEventBoundary",
    value: function handleHeroEventBoundary(poi, dir, event) {
      this.changeMap(event);
      this.player.stop();
    }
  }, {
    key: "handleHeroLift",
    value: function handleHeroLift(poi, dir) {
      var _this5 = this;

      this.locked = true;
      this.hero.cycle(_Config__WEBPACK_IMPORTED_MODULE_6__["default"].verbs.PULL, dir);
      setTimeout(function () {
        var activeTiles = _this5.map.getActiveTiles(_this5.interact.tile.group);

        var tileCel = activeTiles.getTile();

        _this5.player.gameaudio.hitSound(_Config__WEBPACK_IMPORTED_MODULE_6__["default"].verbs.LIFT);

        _this5.map.spliceActiveTile(_this5.interact.tile.group, _this5.interact.tile.coord);

        _this5.interact.tile.sprite = new _sprites_Sprite__WEBPACK_IMPORTED_MODULE_11__["default"]({
          type: _Config__WEBPACK_IMPORTED_MODULE_6__["default"].npc.FLOAT,
          layer: "foreground",
          width: _this5.map.data.tilesize,
          height: _this5.map.data.tilesize,
          spawn: {
            x: _this5.interact.tile.coord[0] * _this5.map.data.tilesize,
            y: _this5.interact.tile.coord[1] * _this5.map.data.tilesize
          },
          image: _this5.map.data.image,
          hitbox: {
            x: 0,
            y: 0,
            width: _this5.map.data.tilesize,
            height: _this5.map.data.tilesize
          },
          verbs: {
            face: {
              down: {
                offsetX: tileCel[0],
                offsetY: tileCel[1]
              }
            }
          }
        }, _this5.map);
        _this5.interact.tile.sprite.hero = _this5.hero;

        _this5.map.addNPC(_this5.interact.tile.sprite);

        _this5.hero.cycle(_Config__WEBPACK_IMPORTED_MODULE_6__["default"].verbs.LIFT, _this5.hero.dir);

        _this5.hero.physics.maxv = _this5.hero.physics.controlmaxv / 2;
        _this5.locked = false;
      }, this.hero.getDur(_Config__WEBPACK_IMPORTED_MODULE_6__["default"].verbs.LIFT));
    }
  }, {
    key: "handleHeroThrow",
    value: function handleHeroThrow() {
      this.hero.face(this.hero.dir);
      this.player.gameaudio.hitSound(_Config__WEBPACK_IMPORTED_MODULE_6__["default"].verbs.THROW);
      this.hero.physics.maxv = this.hero.physics.controlmaxv;
      this.handleThrow(this.interact.tile.sprite);
    }
  }, {
    key: "handleHeroAttack",
    value: function handleHeroAttack() {
      var _this6 = this;

      this.attacking = true;
      this.hero.resetElapsed = true;
      this.hero.cycle(_Config__WEBPACK_IMPORTED_MODULE_6__["default"].verbs.ATTACK, this.hero.dir);
      var poi = this.hero.getNextPoiByDir(this.hero.dir, 1);
      var weaponBox = this.hero.getWeaponbox();
      var collision = {
        tiles: this.checkTiles(poi, weaponBox)
      };

      if (collision.tiles && collision.tiles.attack.length) {
        collision.tiles.attack.forEach(function (tile) {
          if (tile.attack) {
            _this6.handleHeroTileAttack(poi, _this6.hero.dir, tile);
          }
        });
      }

      setTimeout(function () {
        // this.attacking = false;
        _this6.hero.face(_this6.hero.dir);
      }, this.hero.getDur(_Config__WEBPACK_IMPORTED_MODULE_6__["default"].verbs.ATTACK));
    }
  }, {
    key: "handleHeroTiles",
    value: function handleHeroTiles(poi, dir, tiles) {
      var _this7 = this;

      tiles.passive.forEach(function (tile) {
        // Stairs are hard, you have to take it slow...
        if (tile.group === _Config__WEBPACK_IMPORTED_MODULE_6__["default"].tiles.STAIRS) {
          _this7.hero.physics.maxv = _this7.hero.physics.controlmaxv / 2; // Grass is thick, it will slow you down a bit...
        } else if (tile.group === _Config__WEBPACK_IMPORTED_MODULE_6__["default"].tiles.GRASS) {
          _this7.hero.physics.maxv = _this7.hero.physics.controlmaxv / 1.5;
        } else if (tile.group === _Config__WEBPACK_IMPORTED_MODULE_6__["default"].tiles.HOLES) {// if ( tile.amount >= (this.hero.footbox.width * this.hero.footbox.height) ) {
          //     this.falling = true;
          //     setTimeout(() => {
          //         this.falling = false;
          //
          //     }, 1000 );
          // }
        }
      });
    }
  }, {
    key: "handleHeroNPCAction",
    value: function handleHeroNPCAction(poi, dir, obj) {
      if (obj.canInteract(dir)) {
        obj.doInteract(dir);
      }
    }
  }, {
    key: "handleHeroTileAction",
    value: function handleHeroTileAction(poi, dir, tile) {
      if (tile.instance.canInteract()) {
        this.interact.tile = tile;

        if (tile.instance.data.action.verb === _Config__WEBPACK_IMPORTED_MODULE_6__["default"].verbs.LIFT) {
          this.hero.cycle(_Config__WEBPACK_IMPORTED_MODULE_6__["default"].verbs.GRAB, this.hero.dir);
        }
      }
    }
  }, {
    key: "handleHeroTileAttack",
    value: function handleHeroTileAttack(poi, dir, tile) {
      if (tile.instance.canAttack()) {
        tile.instance.attack(tile.coord);
      }
    }
    /*******************************************************************************
    * Sprite Handlers
    *******************************************************************************/

  }, {
    key: "handleControls",
    value: function handleControls(controls, sprite) {
      if (controls.left) {
        sprite.physics.vx = _Utils__WEBPACK_IMPORTED_MODULE_5__["default"].limit(sprite.physics.vx - sprite.speed, -sprite.physics.controlmaxv, sprite.physics.controlmaxv);
        sprite.idle.x = false;
      } else if (controls.right) {
        sprite.physics.vx = _Utils__WEBPACK_IMPORTED_MODULE_5__["default"].limit(sprite.physics.vx + sprite.speed, -sprite.physics.controlmaxv, sprite.physics.controlmaxv);
        sprite.idle.x = false;
      } else {
        sprite.idle.x = true;
      }

      if (controls.up) {
        sprite.physics.vy = _Utils__WEBPACK_IMPORTED_MODULE_5__["default"].limit(sprite.physics.vy - sprite.speed, -sprite.physics.controlmaxv, sprite.physics.controlmaxv);
        sprite.idle.y = false;
      } else if (controls.down) {
        sprite.physics.vy = _Utils__WEBPACK_IMPORTED_MODULE_5__["default"].limit(sprite.physics.vy + sprite.speed, -sprite.physics.controlmaxv, sprite.physics.controlmaxv);
        sprite.idle.y = false;
      } else {
        sprite.idle.y = true;
      } // Handle sprite AI logics...
      // Hero sprite will NEVER have AI data...


      if (sprite.data.ai) {
        if (sprite.data.ai === _Config__WEBPACK_IMPORTED_MODULE_6__["default"].npc.ROAM) {
          this.handleRoam(sprite);
        } else if (sprite.data.ai === _Config__WEBPACK_IMPORTED_MODULE_6__["default"].npc.WANDER) {
          this.handleWander(sprite);
        }
      }
    }
  }, {
    key: "handleThrow",
    value: function handleThrow(sprite) {
      sprite.throwing = this.hero.dir;
      var throwX;
      var throwY;
      var dist = this.map.data.tilesize * 2;

      if (sprite.throwing === "left") {
        throwX = sprite.position.x - dist;
        throwY = sprite.hero.footbox.y - (sprite.height - this.hero.footbox.height);
      } else if (sprite.throwing === "right") {
        throwX = sprite.position.x + dist;
        throwY = sprite.hero.footbox.y - (sprite.height - this.hero.footbox.height);
      } else if (sprite.throwing === "up") {
        throwX = sprite.position.x;
        throwY = sprite.position.y - dist;
      } else if (sprite.throwing === "down") {
        throwX = sprite.position.x;
        throwY = this.hero.footbox.y + dist;
      }

      this.interact.tile.spring = new _Spring__WEBPACK_IMPORTED_MODULE_10__["default"](this.player, sprite.position.x, sprite.position.y, 60, 3.5);
      this.interact.tile.spring.poi = {
        x: throwX,
        y: throwY
      };
      this.interact.tile.spring.bind(sprite);
    }
  }, {
    key: "handleThrowing",
    value: function handleThrowing(elapsed) {
      if (this.interact.tile.spring.isResting) {
        this.handleThrew();
      } else {
        var collision = {
          map: this.checkMap(this.interact.tile.sprite.position, this.interact.tile.sprite),
          npc: this.checkNPC(this.interact.tile.sprite.position, this.interact.tile.sprite),
          camera: this.checkCamera(this.interact.tile.sprite.position, this.interact.tile.sprite)
        };

        if (collision.map || collision.npc || collision.camera) {
          this.handleThrew();
        } else {
          this.interact.tile.spring.blit(elapsed);
        }
      }
    }
  }, {
    key: "handleThrew",
    value: function handleThrew() {
      this.smokeObject(this.interact.tile.sprite);
      this.player.gameaudio.hitSound(_Config__WEBPACK_IMPORTED_MODULE_6__["default"].verbs.SMASH);
      this.map.killObj("npcs", this.interact.tile.sprite);
      delete this.interact.tile;
    }
  }, {
    key: "handleRoam",
    value: function handleRoam(sprite) {
      var dirs = ["left", "right", "up", "down"];

      if (!sprite.counter) {
        sprite.counter = _Utils__WEBPACK_IMPORTED_MODULE_5__["default"].random(64, 192);
        sprite.dir = dirs[_Utils__WEBPACK_IMPORTED_MODULE_5__["default"].random(0, dirs.length)];
        _Utils__WEBPACK_IMPORTED_MODULE_5__["default"].log("Roam: ".concat(sprite.data.id), "Steps: ".concat(sprite.dir, " ").concat(sprite.counter));
      } else {
        sprite.counter--;
      }

      dirs.forEach(function (dir) {
        if (dir === sprite.dir) {
          sprite.controls[dir] = 1;
        } else {
          sprite.controls[dir] = 0;
        }
      });
    }
  }, {
    key: "handleWander",
    value: function handleWander(sprite) {
      if (sprite.cooldown) {
        return sprite.cooldown--;
      }

      if (!sprite.counter) {
        sprite.counter = _Utils__WEBPACK_IMPORTED_MODULE_5__["default"].random(100, 200);
        sprite.stepsX = _Utils__WEBPACK_IMPORTED_MODULE_5__["default"].random(4, 60);
        sprite.stepsY = _Utils__WEBPACK_IMPORTED_MODULE_5__["default"].random(4, 60);

        if (sprite.collided) {
          sprite.collided = false;
          sprite.dirX = _Config__WEBPACK_IMPORTED_MODULE_6__["default"].opposites[sprite.dirX];
          sprite.dirY = _Config__WEBPACK_IMPORTED_MODULE_6__["default"].opposites[sprite.dirY];
        } else {
          sprite.dirX = ["left", "right"][_Utils__WEBPACK_IMPORTED_MODULE_5__["default"].random(0, 2)];
          sprite.dirY = ["down", "up"][_Utils__WEBPACK_IMPORTED_MODULE_5__["default"].random(0, 2)];
        }
      } else {
        sprite.counter--;
      }

      if (sprite.stepsX) {
        sprite.stepsX--;
        sprite.controls[sprite.dirX] = 1;
        sprite.controls[_Config__WEBPACK_IMPORTED_MODULE_6__["default"].opposites[sprite.dirX]] = 0;

        if (sprite.data.verbs[sprite.verb][sprite.dirX]) {
          sprite.dir = sprite.dirX;
        }
      } else {
        sprite.controls.left = 0;
        sprite.controls.right = 0;
      }

      if (sprite.stepsY) {
        sprite.stepsY--;
        sprite.controls[sprite.dirY] = 1;
        sprite.controls[_Config__WEBPACK_IMPORTED_MODULE_6__["default"].opposites[sprite.dirY]] = 0;

        if (sprite.data.verbs[sprite.verb][sprite.dirY]) {
          sprite.dir = sprite.dirY;
        }
      } else {
        sprite.controls.up = 0;
        sprite.controls.down = 0;
      }

      if (!sprite.stepsX && !sprite.stepsY) {
        sprite.verb = _Config__WEBPACK_IMPORTED_MODULE_6__["default"].verbs.FACE;
        sprite.controls = {};
      } else {
        if (sprite.data.bounce && sprite.position.z === 0) {
          sprite.physics.vz = -6;
        }

        if (sprite.data.verbs[_Config__WEBPACK_IMPORTED_MODULE_6__["default"].verbs.WALK]) {
          sprite.verb = _Config__WEBPACK_IMPORTED_MODULE_6__["default"].verbs.WALK;
        }
      }
    }
    /*******************************************************************************
    * Map Switching
    *******************************************************************************/

  }, {
    key: "getNewHeroPosition",
    value: function getNewHeroPosition() {
      if (this.hero.dir === "down") {
        return {
          x: this.hero.position.x,
          y: 0,
          z: 0
        };
      } else if (this.hero.dir === "up") {
        return {
          x: this.hero.position.x,
          y: this.map.height - this.hero.height,
          z: 0
        };
      } else if (this.hero.dir === "right") {
        return {
          x: 0,
          y: this.hero.position.y,
          z: 0
        };
      } else if (this.hero.dir === "left") {
        return {
          x: this.map.width - this.hero.width,
          y: this.hero.position.y,
          z: 0
        };
      }
    }
  }, {
    key: "changeMap",
    value: function changeMap(event) {
      var _this8 = this;

      // Pause the Player so no game buttons dispatch
      this.player.pause(); // Fade out...

      this.player.element.classList.add("is-fader"); // Emit map change event

      this.player.emit(_Config__WEBPACK_IMPORTED_MODULE_6__["default"].broadcast.MAPEVENT, event);
      setTimeout(function () {
        // New Map data
        var newMapData = _Loader__WEBPACK_IMPORTED_MODULE_7__["default"].cash(event.map);

        var newHeroPos = _this8.getNewHeroPosition(); // Set a spawn index...


        _this8.hero.position.x = event.spawn !== undefined ? newMapData.spawn[event.spawn].x : newHeroPos.x;
        _this8.hero.position.y = event.spawn !== undefined ? newMapData.spawn[event.spawn].y : newHeroPos.y; // Destroy old Map

        _this8.map.destroy(); // Create new Map


        _this8.map = new _Map__WEBPACK_IMPORTED_MODULE_9__["default"](newMapData, _this8);
        _this8.hero.map = _this8.map; // Initialize the new Map
        // Applies new hero offset!

        _this8.initMap(); // Handle the `dropin` effect


        if (_this8.dropin) {
          _this8.dropin = false;
          _this8.hero.position.z = -(_this8.camera.height / 2);
        } // Create a new Companion


        if (_this8.companion) {
          var newCompanionData = _Utils__WEBPACK_IMPORTED_MODULE_5__["default"].copy(_this8.hero.data.companion);
          newCompanionData.spawn = {
            x: _this8.hero.position.x,
            y: _this8.hero.position.y
          };

          _this8.companion.destroy();

          _this8.companion = new _sprites_Companion__WEBPACK_IMPORTED_MODULE_12__["default"](newCompanionData, _this8.hero);
        } // Fade in...


        _this8.player.element.classList.remove("is-fader"); // Resume game blit cycle...


        _this8.player.resume();
      }, 1000);
    }
  }]);

  return TopView;
}(_GameBox__WEBPACK_IMPORTED_MODULE_8__["default"]);

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (TopView);

/***/ }),

/***/ "./src/lib/sprites/Companion.js":
/*!**************************************!*\
  !*** ./src/lib/sprites/Companion.js ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _babel_runtime_helpers_assertThisInitialized__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/assertThisInitialized */ "./node_modules/@babel/runtime/helpers/esm/assertThisInitialized.js");
/* harmony import */ var _babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @babel/runtime/helpers/inherits */ "./node_modules/@babel/runtime/helpers/esm/inherits.js");
/* harmony import */ var _babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @babel/runtime/helpers/possibleConstructorReturn */ "./node_modules/@babel/runtime/helpers/esm/possibleConstructorReturn.js");
/* harmony import */ var _babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @babel/runtime/helpers/getPrototypeOf */ "./node_modules/@babel/runtime/helpers/esm/getPrototypeOf.js");
/* harmony import */ var _Utils__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../Utils */ "./src/lib/Utils.js");
/* harmony import */ var _Config__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../Config */ "./src/lib/Config.js");
/* harmony import */ var _Spring__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../Spring */ "./src/lib/Spring.js");
/* harmony import */ var _Sprite__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./Sprite */ "./src/lib/sprites/Sprite.js");







function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0,_babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_5__["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0,_babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_5__["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0,_babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_4__["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }





/*******************************************************************************
* Companion NPC
* Have different behaviors for being "anchored" to a Hero
*******************************************************************************/

var Companion = /*#__PURE__*/function (_Sprite) {
  (0,_babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_3__["default"])(Companion, _Sprite);

  var _super = _createSuper(Companion);

  function Companion(data, hero) {
    var _this;

    (0,_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__["default"])(this, Companion);

    _this = _super.call(this, data, hero.map);
    _this.layer = _this.data.type === _Config__WEBPACK_IMPORTED_MODULE_7__["default"].npc.FLOAT ? "foreground" : "heroground";
    _this.hero = hero;
    _this.spring = new _Spring__WEBPACK_IMPORTED_MODULE_8__["default"](_this.gamebox.player, _this.position.x, _this.position.y, 10);

    _this.spring.bind((0,_babel_runtime_helpers_assertThisInitialized__WEBPACK_IMPORTED_MODULE_2__["default"])(_this));

    return _this;
  }

  (0,_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__["default"])(Companion, [{
    key: "visible",
    value: function visible() {
      return true;
    }
  }, {
    key: "destroy",
    value: function destroy() {}
    /*******************************************************************************
    * Rendering
    * Order is: blit, update, render
    *******************************************************************************/

  }, {
    key: "blit",
    value: function blit(elapsed) {
      if (!this.visible()) {
        return;
      }

      if (this.previousElapsed === null) {
        this.previousElapsed = elapsed;
      } // Companion type?


      if (this.data.type === _Config__WEBPACK_IMPORTED_MODULE_7__["default"].npc.WALK) {
        this.blitWalk();
      } else if (this.data.type === _Config__WEBPACK_IMPORTED_MODULE_7__["default"].npc.FLOAT) {
        this.blitFloat();
      } // Spring blit...


      this.spring.blit(elapsed);
      this.applyFrame(elapsed);
    }
  }, {
    key: "blitFloat",
    value: function blitFloat() {
      this.position.z = -(this.map.data.tilesize * 2);

      if (this.hero.position.x + this.hero.width / 2 > this.position.x + this.width / 2) {
        this.dir = "right";
      } else {
        this.dir = "left";
      }
    }
  }, {
    key: "blitWalk",
    value: function blitWalk() {
      var distance = _Utils__WEBPACK_IMPORTED_MODULE_6__["default"].getDistance(this.position, this.spring.poi); // Hero is NOT idle, so moving
      // Hero IS idle but companion is within a threshold distance...

      if (!this.hero.idle.x || !this.hero.idle.y || this.hero.idle.x && this.hero.idle.y && distance > this.map.data.tilesize / 2) {
        // Bounce condition is TRUE
        // Position Z is zero, so bounce a bit...
        if (this.data.bounce && this.position.z === 0) {
          this.physics.vz = -8;
        }
      }

      if (Math.ceil(this.hero.position.x) > Math.floor(this.position.x)) {
        this.dir = "right";
      } else {
        this.dir = "left";
      }
    }
    /*******************************************************************************
    * Applications
    *******************************************************************************/

  }, {
    key: "applyPosition",
    value: function applyPosition() {
      if (this.data.type === _Config__WEBPACK_IMPORTED_MODULE_7__["default"].npc.WALK) {
        this.applyWalkPosition();
      } else if (this.data.type === _Config__WEBPACK_IMPORTED_MODULE_7__["default"].npc.FLOAT) {
        this.applyFloatPosition();
      }
    }
  }, {
    key: "applyFloatPosition",
    value: function applyFloatPosition() {
      var poi = {};
      var heroCenter = {
        x: this.hero.position.x + this.hero.width / 2,
        y: this.hero.position.y + this.hero.height / 2
      };
      var selfCenter = {
        x: this.position.x + this.width / 2,
        y: this.position.y + this.height / 2
      };

      if (this.hero.dir === "right" && heroCenter.x > selfCenter.x) {
        poi.x = heroCenter.x - this.width;
        poi.y = heroCenter.y;
      } else if (this.hero.dir === "left" && heroCenter.x < selfCenter.x) {
        poi.x = heroCenter.x;
        poi.y = heroCenter.y;
      } else if (this.hero.dir === "up" && heroCenter.y < selfCenter.y) {
        poi.x = heroCenter.x - this.width / 2;
        poi.y = heroCenter.y + this.height;
      } else if (this.hero.dir === "down" && heroCenter.y > selfCenter.y) {
        poi.x = heroCenter.x - this.width / 2;
        poi.y = heroCenter.y;
      }

      if (poi.x && poi.y) {
        this.spring.poi = poi;
      }
    }
  }, {
    key: "applyWalkPosition",
    value: function applyWalkPosition() {
      var poi = {};

      if (this.hero.dir === "right" && this.hero.position.x > this.position.x) {
        poi.x = this.hero.position.x - this.width / 2;
        poi.y = this.hero.footbox.y - (this.height - this.hero.footbox.height);
      } else if (this.hero.dir === "left" && this.hero.position.x < this.position.x) {
        poi.x = this.hero.position.x + this.hero.width - this.width / 2;
        poi.y = this.hero.footbox.y - (this.height - this.hero.footbox.height);
      } else if (this.hero.dir === "up" && this.hero.position.y < this.position.y) {
        poi.x = this.hero.position.x + this.hero.width / 2 - this.width / 2;
        poi.y = this.hero.position.y + this.hero.height - this.height / 2;
      } else if (this.hero.dir === "down" && this.hero.position.y > this.position.y) {
        poi.x = this.hero.position.x + this.hero.width / 2 - this.width / 2;
        poi.y = this.hero.position.y - this.height / 2;
      }

      if (poi.x && poi.y) {
        this.spring.poi = poi;
      }
    }
  }]);

  return Companion;
}(_Sprite__WEBPACK_IMPORTED_MODULE_9__["default"]);

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Companion);

/***/ }),

/***/ "./src/lib/sprites/FX.js":
/*!*******************************!*\
  !*** ./src/lib/sprites/FX.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/inherits */ "./node_modules/@babel/runtime/helpers/esm/inherits.js");
/* harmony import */ var _babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @babel/runtime/helpers/possibleConstructorReturn */ "./node_modules/@babel/runtime/helpers/esm/possibleConstructorReturn.js");
/* harmony import */ var _babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @babel/runtime/helpers/getPrototypeOf */ "./node_modules/@babel/runtime/helpers/esm/getPrototypeOf.js");
/* harmony import */ var _Sprite__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./Sprite */ "./src/lib/sprites/Sprite.js");
/* harmony import */ var _Config__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../Config */ "./src/lib/Config.js");






function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0,_babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_4__["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0,_babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_4__["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0,_babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_3__["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }



/*******************************************************************************
* Visual Effects Sprite
* Self destructive when duration is met...
*******************************************************************************/

var FX = /*#__PURE__*/function (_Sprite) {
  (0,_babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_2__["default"])(FX, _Sprite);

  var _super = _createSuper(FX);

  function FX(data, map) {
    (0,_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__["default"])(this, FX);

    return _super.call(this, data, map);
  }

  (0,_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__["default"])(FX, [{
    key: "blit",
    value: function blit(elapsed) {
      if (!this.visible()) {
        return;
      }

      if (this.previousElapsed === null) {
        this.previousElapsed = elapsed;
      }

      if (this.data.type === _Config__WEBPACK_IMPORTED_MODULE_6__["default"].npc.FLOAT) {
        this.position.y--;
      }

      this.applyFrame(elapsed);
    }
  }, {
    key: "getCel",
    value: function getCel() {
      return [Math.abs(this.data.offsetX) + this.data.width * this.frame, Math.abs(this.data.offsetY)];
    }
  }, {
    key: "applyFrame",
    value: function applyFrame(elapsed) {
      this.frame = 0;

      if (this.data.stepsX) {
        var diff = elapsed - this.previousElapsed;
        this.frame = Math.floor(diff / this.data.dur * this.data.stepsX);

        if (diff >= this.data.dur) {
          if (this.data.kill) {
            this.map.killObj("fx", this);
          } else {
            this.previousElapsed = elapsed;
            this.frame = this.data.stepsX - 1;

            if (this.data.type === _Config__WEBPACK_IMPORTED_MODULE_6__["default"].npc.FLOAT) {
              this.position.y = this.data.spawn.y;
            }
          }
        }
      }

      this.spritecel = this.getCel();
    }
  }]);

  return FX;
}(_Sprite__WEBPACK_IMPORTED_MODULE_5__["default"]);

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (FX);

/***/ }),

/***/ "./src/lib/sprites/Hero.js":
/*!*********************************!*\
  !*** ./src/lib/sprites/Hero.js ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/inherits */ "./node_modules/@babel/runtime/helpers/esm/inherits.js");
/* harmony import */ var _babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @babel/runtime/helpers/possibleConstructorReturn */ "./node_modules/@babel/runtime/helpers/esm/possibleConstructorReturn.js");
/* harmony import */ var _babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @babel/runtime/helpers/getPrototypeOf */ "./node_modules/@babel/runtime/helpers/esm/getPrototypeOf.js");
/* harmony import */ var _Config__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../Config */ "./src/lib/Config.js");
/* harmony import */ var _Sprite__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./Sprite */ "./src/lib/sprites/Sprite.js");






function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0,_babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_4__["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0,_babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_4__["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0,_babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_3__["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }



/*******************************************************************************
* Hero
* There can be only one per Map
*******************************************************************************/

var Hero = /*#__PURE__*/function (_Sprite) {
  (0,_babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_2__["default"])(Hero, _Sprite);

  var _super = _createSuper(Hero);

  function Hero(data, map) {
    var _this;

    (0,_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__["default"])(this, Hero);

    _this = _super.call(this, data, map);
    _this.layer = "heroground";
    return _this;
  }

  (0,_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__["default"])(Hero, [{
    key: "visible",
    value: function visible() {
      return true;
    }
    /*******************************************************************************
    * Rendering
    * Order is: blit, update, render
    *******************************************************************************/

  }, {
    key: "update",
    value: function update() {
      // Handle player controls
      this.gamebox.handleControls(this.gamebox.player.controls, this); // The physics stack...

      this.handleVelocity();
      this.handleGravity();
      this.applyGravity();
    }
  }, {
    key: "renderAfter",
    value: function renderAfter() {
      if (this.verb === _Config__WEBPACK_IMPORTED_MODULE_5__["default"].verbs.ATTACK && this.data.weapon && this.data.weapon[this.dir].length) {
        this.gamebox.layers[this.layer].onCanvas.context.drawImage(this.image, Math.abs(this.data.weapon[this.dir][this.frame].offsetX), Math.abs(this.data.weapon[this.dir][this.frame].offsetY), this.data.weapon[this.dir][this.frame].width, this.data.weapon[this.dir][this.frame].height, this.offset.x + this.data.weapon[this.dir][this.frame].positionX, this.offset.y + this.data.weapon[this.dir][this.frame].positionY, this.data.weapon[this.dir][this.frame].width / this.scale, this.data.weapon[this.dir][this.frame].height / this.scale);
      }
    }
    /*******************************************************************************
    * Applications
    * Hero uses custom position and offset determinance...
    *******************************************************************************/

  }, {
    key: "applyPosition",
    value: function applyPosition(poi, dir) {
      this.dir = dir;
      this.position.x = poi.x;
      this.position.y = poi.y;
      this.applyHitbox();
    }
  }, {
    key: "applyOffset",
    value: function applyOffset() {
      var absolute = {
        x: Math.abs(this.map.offset.x),
        y: Math.abs(this.map.offset.y)
      };
      this.offset = {
        x: this.gamebox.camera.width / 2 - this.width / 2,
        y: this.gamebox.camera.height / 2 - this.height / 2
      };

      if (absolute.x <= 0) {
        this.offset.x = this.position.x;
      }

      if (absolute.x >= this.map.width - this.gamebox.camera.width) {
        this.offset.x = this.position.x + this.map.offset.x;
      }

      if (absolute.y <= 0) {
        this.offset.y = this.position.y;
      }

      if (absolute.y >= this.map.height - this.gamebox.camera.height) {
        this.offset.y = this.position.y + this.map.offset.y;
      }
    }
  }, {
    key: "applyCycle",
    value: function applyCycle() {
      // Lifting and carrying an object trumps all
      if (this.verb === _Config__WEBPACK_IMPORTED_MODULE_5__["default"].verbs.LIFT) {
        this.cycle(_Config__WEBPACK_IMPORTED_MODULE_5__["default"].verbs.LIFT, this.dir); // Jumping needs to be captured...
      } else if (this.gamebox.jumping) {
        this.cycle(_Config__WEBPACK_IMPORTED_MODULE_5__["default"].verbs.JUMP, this.dir); // Attack needs to be captured...
      } else if (this.gamebox.attacking) {
        this.cycle(_Config__WEBPACK_IMPORTED_MODULE_5__["default"].verbs.ATTACK, this.dir); // Idle comes next...LIFT has it's own idle face...
      } else if (this.idle.x && this.idle.y) {
        this.face(this.dir);
      } else {
        this.cycle(_Config__WEBPACK_IMPORTED_MODULE_5__["default"].verbs.WALK, this.dir);
      }
    }
    /*******************************************************************************
    * Getters
    *******************************************************************************/

  }, {
    key: "getWeaponbox",
    value: function getWeaponbox() {
      var _this2 = this;

      var lowX = this.data.weapon[this.dir].reduce(function (accX, record) {
        var absX = Math.abs(_this2.position.x + record.positionX);

        if (absX < accX) {
          return absX;
        }

        return accX;
      }, 999999);
      var lowY = this.data.weapon[this.dir].reduce(function (accY, record) {
        var absY = Math.abs(_this2.position.y + record.positionY);

        if (absY < accY) {
          return absY;
        }

        return accY;
      }, 999999);
      var hiX = this.data.weapon[this.dir].reduce(function (accX, record) {
        var absX = Math.abs(_this2.position.x + record.positionX + record.width);

        if (absX > accX) {
          return absX;
        }

        return accX;
      }, 0);
      var hiY = this.data.weapon[this.dir].reduce(function (accY, record) {
        var absY = Math.abs(_this2.position.y + record.positionY + record.height);

        if (absY > accY) {
          return absY;
        }

        return accY;
      }, 0);
      return {
        x: lowX,
        y: lowY,
        width: hiX - lowX,
        height: hiY - lowY
      };
    }
  }]);

  return Hero;
}(_Sprite__WEBPACK_IMPORTED_MODULE_6__["default"]);

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Hero);

/***/ }),

/***/ "./src/lib/sprites/NPC.js":
/*!********************************!*\
  !*** ./src/lib/sprites/NPC.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/inherits */ "./node_modules/@babel/runtime/helpers/esm/inherits.js");
/* harmony import */ var _babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @babel/runtime/helpers/possibleConstructorReturn */ "./node_modules/@babel/runtime/helpers/esm/possibleConstructorReturn.js");
/* harmony import */ var _babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @babel/runtime/helpers/getPrototypeOf */ "./node_modules/@babel/runtime/helpers/esm/getPrototypeOf.js");
/* harmony import */ var _Utils__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../Utils */ "./src/lib/Utils.js");
/* harmony import */ var _Config__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../Config */ "./src/lib/Config.js");
/* harmony import */ var _Sprite__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./Sprite */ "./src/lib/sprites/Sprite.js");






function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0,_babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_4__["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0,_babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_4__["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0,_babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_3__["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }




/*******************************************************************************
* NPC Sprite
* Shifting states...
* AI logics?
*******************************************************************************/

var NPC = /*#__PURE__*/function (_Sprite) {
  (0,_babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_2__["default"])(NPC, _Sprite);

  var _super = _createSuper(NPC);

  function NPC(data, map) {
    var _this;

    (0,_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__["default"])(this, NPC);

    _this = _super.call(this, data, map);
    _this.states = _Utils__WEBPACK_IMPORTED_MODULE_5__["default"].copy(_this.data.states);
    _this.dialogue = null;
    _this.controls = {}; // Initial cooldown period upon spawn (don't immediately move)
    // requestAnimationFrame runs 60fps so we use (60 * seconds)

    _this.counter = _this.data.ai ? 60 * 1 : 0;
    _this.cooldown = 0;
    _this.collided = false;

    _this.shift();

    return _this;
  }

  (0,_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__["default"])(NPC, [{
    key: "destroy",
    value: function destroy() {}
  }, {
    key: "shift",
    value: function shift() {
      if (this.states.length) {
        this.state = this.states.shift();
        this.dir = this.state.dir;
        this.verb = this.state.verb;
      }
    }
  }, {
    key: "payload",
    value: function payload() {
      var _this2 = this;

      if (this.data.payload.dialogue && !this.dialogue) {
        this.dialogue = this.gamebox.dialogue.play(this.data.payload.dialogue);
        this.dialogue.then(function () {
          _this2.handleDialogue();
        })["catch"](function () {
          _this2.handleDialogue();
        });
      }
    }
    /*******************************************************************************
    * Rendering
    * Order is: blit, update, render
    * Update is overridden for Sprite subclasses with different behaviors
    * Default behavior for a Sprite is to be static but with Physics forces
    *******************************************************************************/

  }, {
    key: "update",
    value: function update() {
      if (!this.visible()) {
        return;
      }

      this.gamebox.handleControls(this.controls, this);
      this.updateStack();
    }
    /*******************************************************************************
    * Applications
    *******************************************************************************/

  }, {
    key: "applyPosition",
    value: function applyPosition() {
      var poi = this.getNextPoi();
      var collision = {
        map: this.gamebox.checkMap(poi, this),
        npc: this.gamebox.checkNPC(poi, this),
        hero: this.gamebox.checkHero(poi, this),
        tiles: this.gamebox.checkTiles(poi, this)
      };
      var isCollision = collision.map || collision.npc || collision.hero || this.gamebox.canHeroTileStop(poi, null, collision);
      var isNotCollision = !collision.map && !collision.npc && !collision.hero && !this.gamebox.canHeroTileStop(poi, null, collision); // Reset the sprite counter if NPC has collisions...

      if (isCollision && !this.collided && this.data.ai === _Config__WEBPACK_IMPORTED_MODULE_6__["default"].npc.WANDER) {
        this.collided = true;
        this.cooldown = 60 * 4;
        this.counter = 0;
        this.controls = {};
      } // Roaming NPCs can push the hero back...


      if (collision.hero && this.data.ai === _Config__WEBPACK_IMPORTED_MODULE_6__["default"].npc.ROAM) {
        if (this.dir === "left") {
          this.gamebox.hero.physics.vx = -1;
        } else if (this.dir === "right") {
          this.gamebox.hero.physics.vx = 1;
        } else if (this.dir === "up") {
          this.gamebox.hero.physics.vy = -1;
        } else if (this.dir === "down") {
          this.gamebox.hero.physics.vy = 1;
        }
      } else if (isNotCollision) {
        this.position = poi;
      }
    }
    /*******************************************************************************
    * Handlers
    *******************************************************************************/

  }, {
    key: "handleDialogue",
    value: function handleDialogue() {
      this.dialogue = null;
      this.dir = this.state.dir;
      this.verb = this.state.verb;
    }
    /*******************************************************************************
    * Interactions
    *******************************************************************************/

  }, {
    key: "canInteract",
    value: function canInteract(dir) {
      return this.state.action && this.state.action.require && this.state.action.require.dir && dir === this.state.action.require.dir;
    }
  }, {
    key: "doInteract",
    value: function doInteract() {
      if (this.data.payload) {
        this.payload();
      }

      if (this.state.action.sound) {
        this.gamebox.player.gameaudio.hitSound(this.state.action.sound);
      }

      if (this.state.action.verb && this.data.verbs[this.state.action.verb]) {
        this.verb = this.state.action.verb;
        this.dir = this.state.action.dir || this.state.dir;
      }

      if (this.state.action.shift) {
        this.shift();
      }
    }
  }]);

  return NPC;
}(_Sprite__WEBPACK_IMPORTED_MODULE_7__["default"]);

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (NPC);

/***/ }),

/***/ "./src/lib/sprites/Sprite.js":
/*!***********************************!*\
  !*** ./src/lib/sprites/Sprite.js ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _Utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../Utils */ "./src/lib/Utils.js");
/* harmony import */ var _Loader__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../Loader */ "./src/lib/Loader.js");
/* harmony import */ var _Config__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../Config */ "./src/lib/Config.js");





/*******************************************************************************
* Sprite
* Something that is "alive"...
* All sprites need update, blit, render AND destroy methods...
*******************************************************************************/

var Sprite = /*#__PURE__*/function () {
  function Sprite(data, map) {
    (0,_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__["default"])(this, Sprite);

    this.data = data;
    this.map = map;
    this.gamebox = this.map.gamebox;
    this.scale = this.data.scale || 1;
    this.width = this.data.width / this.scale;
    this.height = this.data.height / this.scale;
    this.dir = this.data.dir || this.data.spawn.dir || "down";
    this.verb = this.data.verb || _Config__WEBPACK_IMPORTED_MODULE_4__["default"].verbs.FACE;
    this.image = _Loader__WEBPACK_IMPORTED_MODULE_3__["default"].cash(this.data.image);
    this.speed = 1;
    this.frame = 0;
    this.opacity = data.opacity || 1.0;
    this.position = {
      x: this.data.spawn && this.data.spawn.x || 0,
      y: this.data.spawn && this.data.spawn.y || 0,
      z: this.data.spawn && this.data.spawn.z || 0
    };
    this.physics = {
      vx: this.data.vx || 0,
      vy: this.data.vy || 0,
      vz: this.data.vz || 0,
      maxv: this.data.maxv || 4,
      controlmaxv: this.data.controlmaxv || 4
    }; // Hero offset is based on camera.
    // NPCs offset snaps to position.

    this.offset = {
      x: this.map.offset.x + this.position.x,
      y: this.map.offset.y + this.position.y
    };
    this.idle = {
      x: true,
      y: true
    };
    this.hitbox = {
      x: this.position.x + this.data.hitbox.x / this.scale,
      y: this.position.y + this.data.hitbox.y / this.scale,
      width: this.data.hitbox.width / this.scale,
      height: this.data.hitbox.height / this.scale
    };
    this.footbox = {
      x: this.hitbox.x,
      y: this.hitbox.y + this.hitbox.height / 2,
      width: this.hitbox.width,
      height: this.hitbox.height / 2
    };
    this.layer = this.data.layer || "background";
    this.spritecel = this.getCel();
    this.previousElapsed = null;
    this.resetElapsed = false;
  }

  (0,_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__["default"])(Sprite, [{
    key: "destroy",
    value: function destroy() {}
  }, {
    key: "visible",
    value: function visible() {
      return _Utils__WEBPACK_IMPORTED_MODULE_2__["default"].collide(this.map.camera, {
        x: this.position.x,
        y: this.position.y,
        width: this.width,
        height: this.height
      });
    }
    /*******************************************************************************
    * Rendering
    * Order is: blit, update, render { renderBefore, renderAfter }
    * Update is overridden for Sprite subclasses with different behaviors
    * Default behavior for a Sprite is to be static but with Physics forces
    *******************************************************************************/

  }, {
    key: "blit",
    value: function blit(elapsed) {
      if (!this.visible()) {
        return;
      }

      if (this.previousElapsed === null) {
        this.previousElapsed = elapsed;
      } // Set frame and sprite rendering cel


      this.applyFrame(elapsed);
    }
  }, {
    key: "update",
    value: function update() {
      if (!this.visible()) {
        return;
      }

      this.updateStack();
    }
  }, {
    key: "updateStack",
    value: function updateStack() {
      // The physics stack...
      this.handleVelocity();
      this.handleGravity();
      this.applyPosition();
      this.applyHitbox();
      this.applyOffset();
      this.applyGravity();
    }
  }, {
    key: "render",
    value: function render() {
      if (!this.visible()) {
        return;
      }

      if (typeof this.renderBefore === "function") {
        this.renderBefore();
      } // Move betweeb BG and FG relative to Hero


      if (this !== this.gamebox.hero && this !== this.gamebox.companion) {
        // Assume that FLOAT should always render to the foreground
        if (this.data.type === _Config__WEBPACK_IMPORTED_MODULE_4__["default"].npc.FLOAT) {
          this.layer = "foreground"; // Sprites that have a smaller hitbox than their actual size can flip layer
        } else if (this.hitbox.width * this.hitbox.height !== this.width * this.height) {
          if (this.hitbox.y > this.gamebox.hero.hitbox.y) {
            this.layer = "foreground";
          } else {
            this.layer = "background";
          }
        }
      }

      if (this.data.shadow) {
        this.gamebox.layers[this.layer].onCanvas.context.drawImage(this.image, Math.abs(this.data.shadow.offsetX), Math.abs(this.data.shadow.offsetY), this.data.width, this.data.height, this.offset.x, this.offset.y, this.width, this.height);
      }

      if (this.opacity) {
        this.gamebox.layers[this.layer].onCanvas.context.globalAlpha = this.opacity;
      }

      this.gamebox.layers[this.layer].onCanvas.context.drawImage(this.image, this.spritecel[0], this.spritecel[1], this.data.width, this.data.height, this.offset.x, this.offset.y + this.position.z, this.width, this.height);
      this.gamebox.layers[this.layer].onCanvas.context.globalAlpha = 1.0;

      if (typeof this.renderAfter === "function") {
        this.renderAfter();
      }
    }
  }, {
    key: "cycle",
    value: function cycle(verb, dir) {
      this.dir = dir;
      this.verb = verb;
    }
  }, {
    key: "face",
    value: function face(dir) {
      this.cycle(_Config__WEBPACK_IMPORTED_MODULE_4__["default"].verbs.FACE, dir);
    }
    /*******************************************************************************
    * Handlers
    *******************************************************************************/

  }, {
    key: "handleVelocity",
    value: function handleVelocity() {
      if (this.idle.x) {
        this.physics.vx = _Utils__WEBPACK_IMPORTED_MODULE_2__["default"].goToZero(this.physics.vx);
      }

      if (this.idle.y) {
        this.physics.vy = _Utils__WEBPACK_IMPORTED_MODULE_2__["default"].goToZero(this.physics.vy);
      }
    }
  }, {
    key: "handleGravity",
    value: function handleGravity() {
      this.physics.vz++;
    }
    /*******************************************************************************
    * Applications
    *******************************************************************************/

  }, {
    key: "applyPosition",
    value: function applyPosition() {
      // A lifted object
      if (this.hero) {
        if (!this.throwing) {
          this.position.x = this.hero.position.x + this.hero.width / 2 - this.width / 2;
          this.position.y = this.hero.position.y - this.height + 42;
        } // Basic collision for NPCs...

      } else {
        this.position = this.getNextPoi();
      }
    }
  }, {
    key: "applyHitbox",
    value: function applyHitbox() {
      this.hitbox.x = this.position.x + this.data.hitbox.x / this.scale;
      this.hitbox.y = this.position.y + this.data.hitbox.y / this.scale;
      this.footbox.x = this.hitbox.x;
      this.footbox.y = this.hitbox.y + this.hitbox.height / 2;
    }
  }, {
    key: "applyOffset",
    value: function applyOffset() {
      this.offset = {
        x: this.map.offset.x + this.position.x,
        y: this.map.offset.y + this.position.y
      };
    }
  }, {
    key: "applyGravity",
    value: function applyGravity() {
      this.position.z = this.getNextZ();

      if (this.position.z > 0) {
        this.position.z = 0;
      }
    }
  }, {
    key: "applyFrame",
    value: function applyFrame(elapsed) {
      this.frame = 0; // Useful for ensuring clean maths below for cycles like attacking...

      if (this.resetElapsed) {
        this.resetElapsed = false;
        this.previousElapsed = elapsed;
      }

      if (this.data.verbs[this.verb][this.dir].stepsX) {
        if (this.verb === _Config__WEBPACK_IMPORTED_MODULE_4__["default"].verbs.LIFT && this.idle.x && this.idle.y) {
          _Utils__WEBPACK_IMPORTED_MODULE_2__["default"].log("static lift...");
        } else {
          var diff = elapsed - this.previousElapsed;
          this.frame = Math.floor(diff / this.data.verbs[this.verb].dur * this.data.verbs[this.verb][this.dir].stepsX);

          if (diff >= this.data.verbs[this.verb].dur) {
            this.previousElapsed = elapsed;
            this.frame = this.data.verbs[this.verb][this.dir].stepsX - 1;
          }
        }
      }

      this.spritecel = this.getCel();
    }
    /*******************************************************************************
    * Getters
    *******************************************************************************/

  }, {
    key: "getCel",
    value: function getCel() {
      return [Math.abs(this.data.verbs[this.verb][this.dir].offsetX) + this.data.width * this.frame, Math.abs(this.data.verbs[this.verb][this.dir].offsetY)];
    }
  }, {
    key: "getDur",
    value: function getDur(verb) {
      return this.data.verbs[verb].dur || 0;
    }
  }, {
    key: "getNextX",
    value: function getNextX() {
      return this.position.x + _Utils__WEBPACK_IMPORTED_MODULE_2__["default"].limit(this.physics.vx, -this.physics.maxv, this.physics.maxv);
    }
  }, {
    key: "getNextY",
    value: function getNextY() {
      return this.position.y + _Utils__WEBPACK_IMPORTED_MODULE_2__["default"].limit(this.physics.vy, -this.physics.maxv, this.physics.maxv);
    }
  }, {
    key: "getNextZ",
    value: function getNextZ() {
      return this.position.z + _Utils__WEBPACK_IMPORTED_MODULE_2__["default"].limit(this.physics.vz, -this.physics.maxv, this.physics.maxv);
    }
  }, {
    key: "getNextPoi",
    value: function getNextPoi() {
      return {
        x: this.getNextX(),
        y: this.getNextY(),
        z: this.getNextZ()
      };
    }
  }, {
    key: "getNextPoiByDir",
    value: function getNextPoiByDir(dir, ahead) {
      if (ahead && dir === "left") {
        ahead = -this.physics.controlmaxv;
      }

      if (ahead && dir === "right") {
        ahead = this.physics.controlmaxv;
      }

      if (ahead && dir === "up") {
        ahead = -this.physics.controlmaxv;
      }

      if (ahead && dir === "down") {
        ahead = this.physics.controlmaxv;
      }

      if (!ahead) {
        ahead = 0;
      }

      return {
        x: dir === "left" || dir === "right" ? this.getNextX() + ahead : this.position.x,
        y: dir === "up" || dir === "down" ? this.getNextY() + ahead : this.position.y,
        z: this.position.z
      };
    }
  }, {
    key: "getHitbox",
    value: function getHitbox(poi) {
      return {
        x: poi.x + this.data.hitbox.x / this.scale,
        y: poi.y + this.data.hitbox.y / this.scale,
        width: this.hitbox.width,
        height: this.hitbox.height
      };
    }
  }, {
    key: "getFootbox",
    value: function getFootbox(poi) {
      return {
        x: poi.x + this.data.hitbox.x / this.scale,
        y: poi.y + (this.data.hitbox.y / this.scale + this.hitbox.height / 2),
        width: this.footbox.width,
        height: this.footbox.height
      };
    }
  }]);

  return Sprite;
}();

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Sprite);

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/assertThisInitialized.js":
/*!**************************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/assertThisInitialized.js ***!
  \**************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _assertThisInitialized)
/* harmony export */ });
function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/classCallCheck.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _classCallCheck)
/* harmony export */ });
function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/createClass.js":
/*!****************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/createClass.js ***!
  \****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _createClass)
/* harmony export */ });
function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  Object.defineProperty(Constructor, "prototype", {
    writable: false
  });
  return Constructor;
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/getPrototypeOf.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/getPrototypeOf.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _getPrototypeOf)
/* harmony export */ });
function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/inherits.js":
/*!*************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/inherits.js ***!
  \*************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _inherits)
/* harmony export */ });
/* harmony import */ var _setPrototypeOf_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./setPrototypeOf.js */ "./node_modules/@babel/runtime/helpers/esm/setPrototypeOf.js");

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  Object.defineProperty(subClass, "prototype", {
    writable: false
  });
  if (superClass) (0,_setPrototypeOf_js__WEBPACK_IMPORTED_MODULE_0__["default"])(subClass, superClass);
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/possibleConstructorReturn.js":
/*!******************************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/possibleConstructorReturn.js ***!
  \******************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _possibleConstructorReturn)
/* harmony export */ });
/* harmony import */ var _typeof_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./typeof.js */ "./node_modules/@babel/runtime/helpers/esm/typeof.js");
/* harmony import */ var _assertThisInitialized_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./assertThisInitialized.js */ "./node_modules/@babel/runtime/helpers/esm/assertThisInitialized.js");


function _possibleConstructorReturn(self, call) {
  if (call && ((0,_typeof_js__WEBPACK_IMPORTED_MODULE_0__["default"])(call) === "object" || typeof call === "function")) {
    return call;
  } else if (call !== void 0) {
    throw new TypeError("Derived constructors may only return object or undefined");
  }

  return (0,_assertThisInitialized_js__WEBPACK_IMPORTED_MODULE_1__["default"])(self);
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/setPrototypeOf.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/setPrototypeOf.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _setPrototypeOf)
/* harmony export */ });
function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/typeof.js":
/*!***********************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/typeof.js ***!
  \***********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _typeof)
/* harmony export */ });
function _typeof(obj) {
  "@babel/helpers - typeof";

  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  }, _typeof(obj);
}

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!********************!*\
  !*** ./src/app.js ***!
  \********************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _lib_Player__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./lib/Player */ "./src/lib/Player.js");
/* harmony import */ var _lib_Config__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./lib/Config */ "./src/lib/Config.js");
/* harmony import */ var _lib_Utils__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./lib/Utils */ "./src/lib/Utils.js");




 // 2dk entry point
// A 2dk game is a pure static web bundle
// The Player can just load "game.json" to get started

var App = /*#__PURE__*/function () {
  function App() {
    var _this = this;

    (0,_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__["default"])(this, App);

    // When playing from `file:` protocol within electron we need to clean the pathname
    this.scope = window.location.pathname.replace(/index\.html$/, "");
    this.config = {
      scope: this.scope
    };
    this.worker = "".concat(this.scope, "sw.js");

    window.onload = function () {
      _this.player = new _lib_Player__WEBPACK_IMPORTED_MODULE_2__["default"]();

      _this.player.load();

      _this.register();

      _this.bind();
    };
  }

  (0,_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__["default"])(App, [{
    key: "bind",
    value: function bind() {
      this.player.on(_lib_Config__WEBPACK_IMPORTED_MODULE_3__["default"].broadcast.MAPEVENT, function (event) {
        _lib_Utils__WEBPACK_IMPORTED_MODULE_4__["default"].log(_lib_Config__WEBPACK_IMPORTED_MODULE_3__["default"].broadcast.MAPEVENT, event);
      });
    }
  }, {
    key: "register",
    value: function register() {
      if (_lib_Utils__WEBPACK_IMPORTED_MODULE_4__["default"].dev()) {
        _lib_Utils__WEBPACK_IMPORTED_MODULE_4__["default"].log("[2dk] Skip service worker for studio dev demo!");
        return;
      }

      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register(this.worker, this.config).then(function (registration) {
          if (registration.installing) {
            _lib_Utils__WEBPACK_IMPORTED_MODULE_4__["default"].log("[2dk] Service worker installing.");
          } else if (registration.waiting) {
            _lib_Utils__WEBPACK_IMPORTED_MODULE_4__["default"].log("[2dk] Service worker installed.");
          } else if (registration.active) {
            _lib_Utils__WEBPACK_IMPORTED_MODULE_4__["default"].log("[2dk] Service worker active!");
          }
        })["catch"](function (error) {
          _lib_Utils__WEBPACK_IMPORTED_MODULE_4__["default"].error("[2dk] Service worker failed with ".concat(error));
        });
      } else {
        _lib_Utils__WEBPACK_IMPORTED_MODULE_4__["default"].log("[2dk] Service workers not available!");
      }
    }
  }, {
    key: "deregister",
    value: function deregister() {
      // This is how you can deregister the service worker...
      navigator.serviceWorker.getRegistrations().then(function (registrations) {
        registrations.forEach(function (registration) {
          registration.unregister().then(function (bool) {
            _lib_Utils__WEBPACK_IMPORTED_MODULE_4__["default"].log("[2dk] Unregistered Service Worker", bool);
          });
        });
      });
    }
  }]);

  return App;
}(); // App Instace


window.app2dk = new App(); // App Export

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (window.app);
})();

/******/ })()
;