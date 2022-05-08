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
    red: "#F30541",
    grey: "#959595",
    pink: "#F49AC1",
    blue: "#1795D4",
    teal: "#2AFFEA",
    black: "#000000",
    white: "#FFFFFF",
    green: "#10FF59",
    yellow: "#EEFD02",
    purple: "#6441A4",
    greyDark: "#333",
    blueDark: "#004080"
  }
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Config);

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




var Dialogue = /*#__PURE__*/function () {
  function Dialogue() {
    (0,_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__["default"])(this, Dialogue);

    this.ready = false;
    this.pressed = false;
    this.active = false;
    this.autoplay = false;
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
      this.element.innerHTML = this.data.text.shift();
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

        _this2.element.innerHTML = _this2.data.text.shift();
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
          this.element.innerHTML = this.data.text.shift();
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
            text.push("<span class=\"teal\">A: ".concat(this.data.yes.label, "</span>, <span class=\"blue\">B: ").concat(this.data.no.label, "</span>"));
          }

          this.element.innerHTML = text.join("<br />");
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
      this.timeout = null;
      setTimeout(function () {
        _this4.element.innerHTML = "";
        _this4.active = false;
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
        // console.log( "GameAudio disabled for mobile...", this );
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
        // console.log( "GameAudio disabled for mobile...", data );
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
    (0,_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_1__["default"])(this, GameBox);

    this.player = player;
    this.step = 1;
    this.offset = {
      x: 0,
      y: 0
    };
    this.camera = new Camera(0, 0, this.player.width * this.player.data.game.resolution, this.player.height * this.player.data.game.resolution, this.player.data.game.resolution);
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

    for (var id in initHeroData.sounds) {
      this.player.gameaudio.addSound({
        id: id,
        src: initHeroData.sounds[id],
        channel: "sfx"
      });
    } // Companion?


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
      for (var id in this.layers) {
        this.layers[id].onCanvas.clear();
      }
    }
  }, {
    key: "build",
    value: function build() {
      this.element = document.createElement("div");
      this.element.className = "_2dk__gamebox"; // Render layers

      for (var id in this.layers) {
        this.addLayer(id);
      }

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
      var data = {
        id: "smoke",
        spawn: {
          x: obj.position.x + obj.width / 2 - this.map.data.tilesize / 2,
          y: obj.position.y + obj.height / 2 - this.map.data.tilesize / 2
        }
      };
      data = this.player.getMergedData(data, "fx");
      data.hitbox = {
        x: 0,
        y: 0,
        width: data.width,
        height: data.height
      };
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
      } // console.log( `Total colliders: ${this.map.data.collision.length}`, `Visible colliders: ${colliders.length}` );


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
      } // console.log( `Total events: ${this.map.data.events.length}`, `Visible events: ${events.length}` );


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
      } // console.log( `Total npcs: ${this.map.npcs.length}`, `Visible npcs: ${npcs.length}` );


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
      } // console.log( `Total acvtiveTiles: ${this.map.activeTiles.length}`, `Visible activeTiles: ${activeTiles.length}` );


      return this.map.activeTiles;
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
    value: function checkTiles(poi) {
      var tiles = {
        action: [],
        attack: [],
        passive: []
      };
      var hitbox = this.hero.getHitbox(poi);
      var footbox = this.hero.getFootbox(poi);
      var activeTiles = this.getVisibleActiveTiles();

      for (var i = activeTiles.length; i--;) {
        var instance = activeTiles[i];
        var lookbox = footTiles.indexOf(instance.data.group) !== -1 ? footbox : hitbox;

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
/* harmony import */ var _babel_runtime_helpers_assertThisInitialized__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/assertThisInitialized */ "./node_modules/@babel/runtime/helpers/esm/assertThisInitialized.js");
/* harmony import */ var _babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @babel/runtime/helpers/inherits */ "./node_modules/@babel/runtime/helpers/esm/inherits.js");
/* harmony import */ var _babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @babel/runtime/helpers/possibleConstructorReturn */ "./node_modules/@babel/runtime/helpers/esm/possibleConstructorReturn.js");
/* harmony import */ var _babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @babel/runtime/helpers/getPrototypeOf */ "./node_modules/@babel/runtime/helpers/esm/getPrototypeOf.js");
/* harmony import */ var _Config__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./Config */ "./src/lib/Config.js");
/* harmony import */ var properjs_controller__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! properjs-controller */ "./node_modules/properjs-controller/Controller.js");







function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0,_babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_5__["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0,_babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_5__["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0,_babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_4__["default"])(this, result); }; }

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
var instance = null;

var getControl = function getControl(key) {
  for (var btn in touchControls) {
    if (touchControls[btn].key === key) {
      return touchControls[btn];
    }
  }

  return null;
}; // const getDpad = ( key ) => {
//     for ( let btn in touchControls ) {
//         if ( touchControls[ btn ].key === key && touchControls[ btn ].dpad ) {
//             return touchControls[ btn ];
//         }
//     }
//
//     return null;
// };


var getGamepad = function getGamepad(val) {
  for (var btn in touchControls) {
    if (touchControls[btn].gamepad && touchControls[btn].gamepad.indexOf(val) !== -1) {
      return touchControls[btn];
    }
  }

  return null;
};

var getAxes = function getAxes(xy, val) {
  for (var btn in touchControls) {
    if (touchControls[btn].axes && touchControls[btn].axes[xy] === val) {
      return touchControls[btn];
    }
  }

  return null;
};

var getTouched = function getTouched(touches, control) {
  for (var i = 0; i < touches.length; i++) {
    var touched = document.elementFromPoint(touches[i].pageX, touches[i].pageY);
    var key = Number(touched.dataset.key);

    if (key === control.key) {
      return control;
    }
  }

  return null;
};

var onTouchStart = function onTouchStart(e) {
  e.preventDefault();

  for (var i = 0; i < e.touches.length; i++) {
    var touched = document.elementFromPoint(e.touches[i].pageX, e.touches[i].pageY);
    var key = Number(touched.dataset.key);

    if (key) {
      var control = getControl(key);
      startTouch(control);
    }
  }

  return false;
};

var onTouchMove = function onTouchMove(e) {
  e.preventDefault();

  for (var i = 0; i < e.touches.length; i++) {
    var touched = document.elementFromPoint(e.touches[i].pageX, e.touches[i].pageY);
    var key = Number(touched.dataset.key);

    if (key) {
      var control = getControl(key);

      if (control) {
        startTouch(control);
      }
    }

    for (var btn in touchControls) {
      if (touchControls[btn].touched) {
        var _touched = getTouched(e.touches, touchControls[btn]);

        if (!_touched) {
          cancelTouch(touchControls[btn]);
        }
      }
    }
  }

  return false;
};

var onTouchEnd = function onTouchEnd(e) {
  e.preventDefault();

  if (!e.touches.length) {
    clearTouches();
    cancelTouches();
  } else {
    for (var btn in touchControls) {
      if (touchControls[btn].touched) {
        var touched = getTouched(e.touches, touchControls[btn]);

        if (!touched) {
          cancelTouch(touchControls[btn]);
        }
      }
    }
  }

  return false;
};

var onKeyDown = function onKeyDown(e) {
  if (inputStream.indexOf(e.which) === -1) {
    inputStream.push(e.which);
    var control = getControl(e.which);

    if (control) {
      startTouch(control);
    }
  }
};

var onKeyUp = function onKeyUp(e) {
  if (inputStream.indexOf(e.which) !== -1) {
    inputStream.splice(inputStream.indexOf(e.which), 1);
    var control = getControl(e.which);

    if (control) {
      cancelTouch(control);
    }
  }
};

var onGamepadConnected = function onGamepadConnected() {
  instance.stop();
  instance.go(function () {
    var gamepad = navigator.getGamepads()[0]; // GamePad Axes (dpad): [x, y]

    var controls = {
      x: getAxes(0, gamepad.axes[0]),
      y: getAxes(1, gamepad.axes[1])
    };

    if (controls.x) {
      startTouch(controls.x);
    } else {
      cancelTouch(touchControls.left);
      cancelTouch(touchControls.right);
    }

    if (controls.y) {
      startTouch(controls.y);
    } else {
      cancelTouch(touchControls.up);
      cancelTouch(touchControls.down);
    }

    for (var i = gamepad.buttons.length; i--;) {
      var control = getGamepad(i);

      if (control && gamepad.buttons[i].pressed) {
        startTouch(control);
      } else if (control) {
        cancelTouch(control);
      }
    }
  });
  console.log("GamePad Connected: ".concat(navigator.getGamepads()[0].id));
};

var onGamepadDisconnected = function onGamepadDisconnected() {
  instance.stop();
};

var clearTouches = function clearTouches() {
  for (var btn in touchControls) {
    touchControls[btn].elem.classList.remove("is-active");
  }
};

var cancelTouches = function cancelTouches() {
  for (var btn in touchControls) {
    if (touchControls[btn].touched) {
      cancelTouch(touchControls[btn]);
    }
  }
};

var cancelTouch = function cancelTouch(control) {
  if (control.timer) {
    clearInterval(control.timer);
    control.timer = null;
  }

  control.elem.classList.remove("is-active");
  control.touched = false;
  handleTouchEnd(control);
};

var startTouch = function startTouch(control) {
  if (!control.timer) {
    control.elem.classList.add("is-active");
    control.touched = true;
    handleTouchStart(control);

    if (Object.prototype.hasOwnProperty.call(control, "hold") && !control.menu) {
      control.timer = setInterval(function () {
        handleTouchStart(control);
      }, touchInterval);
    }
  }
};

var handleTouchStart = function handleTouchStart(control) {
  if (control.touched && control.menu && control.hold > 0) {
    control.hold++; // console.log( `suspended ${control.btn}` );

    return;
  }

  if (Object.prototype.hasOwnProperty.call(control, "hold")) {
    control.hold++;

    if (control.hold > touchRepeated) {
      instance.fire("".concat(control.btn[0], "-holdpress")); // console.log( `${control.btn[ 0 ]}-holdpress` );
    } else {
      instance.fire("".concat(control.btn[0], "-press")); // console.log( `${control.btn[ 0 ]}-press` );
    }
  } else if (control.dpad) {
    control.dpad.forEach(function (dpad, i) {
      instance.fire("".concat(control.btn[i], "-press"), dpad); // console.log( `${control.btn[ i ]}-press` );
    });
  } else {
    instance.fire("".concat(control.btn[0], "-press"), null); // console.log( `${control.btn[ 0 ]}-press` );
  }
};

var handleTouchEnd = function handleTouchEnd(control) {
  if (Object.prototype.hasOwnProperty.call(control, "hold")) {
    if (control.hold > touchRepeated) {
      instance.fire("".concat(control.btn[0], "-holdrelease")); // console.log( `${control.btn[ 0 ]}-holdrelease` );
    } else {
      instance.fire("".concat(control.btn[0], "-release")); // console.log( `${control.btn[ 0 ]}-release` );
    }

    control.hold = 0;
  } else if (control.dpad) {
    control.dpad.forEach(function (dpad, i) {
      instance.fire("".concat(control.btn[i], "-release"), dpad); // console.log( `${control.btn[ i ]}-release` );
    });
  } else {
    instance.fire("".concat(control.btn[0], "-release"), null); // console.log( `${control.btn[ 0 ]}-release` );
  }
};

var GamePad = /*#__PURE__*/function (_Controller) {
  (0,_babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_3__["default"])(GamePad, _Controller);

  var _super = _createSuper(GamePad);

  function GamePad(player) {
    var _this;

    (0,_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__["default"])(this, GamePad);

    _this = _super.call(this);

    if (!instance) {
      instance = (0,_babel_runtime_helpers_assertThisInitialized__WEBPACK_IMPORTED_MODULE_2__["default"])(_this);
      _this.player = player;

      _this.build();

      _this.bind();
    }

    return (0,_babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_4__["default"])(_this, instance);
  }

  (0,_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__["default"])(GamePad, [{
    key: "clear",
    value: function clear() {
      clearTouches();
      cancelTouches();
    }
  }, {
    key: "bind",
    value: function bind() {
      // Main interface is Touch
      this.element.addEventListener("touchstart", onTouchStart, false);
      this.element.addEventListener("touchmove", onTouchMove, false);
      this.element.addEventListener("touchend", onTouchEnd, false); // Support keys for Desktop

      document.addEventListener("keyup", onKeyUp, false);
      document.addEventListener("keydown", onKeyDown, false); // Native GamePad interface (NES, SNES USB controllers)

      window.addEventListener("gamepadconnected", onGamepadConnected);
      window.addEventListener("gamepaddisconnected", onGamepadDisconnected);
    }
  }, {
    key: "build",
    value: function build() {
      this.element = document.createElement("div");
      this.dpad = document.createElement("div");
      this.btns = document.createElement("div");
      this.element.className = "_2dk__gamepad";
      this.dpad.className = "_2dk__gamepad__dpad";
      this.btns.className = "_2dk__gamepad__btns";
      this.element.appendChild(this.dpad);
      this.element.appendChild(this.btns);

      for (var btn in touchControls) {
        touchControls[btn].btn = btn.split("-");
        touchControls[btn].elem = document.createElement("div");
        touchControls[btn].elem.className = "_2dk__gamepad__".concat(btn);
        touchControls[btn].elem.dataset.key = touchControls[btn].key;

        if (touchControls[btn].text) {
          touchControls[btn].elem.innerHTML = "<span>".concat(touchControls[btn].text, "</span>");
        }

        if (touchControls[btn].dpad) {
          this.dpad.appendChild(touchControls[btn].elem);
        } else {
          this.btns.appendChild(touchControls[btn].elem);
        }
      }

      this.player.element.appendChild(this.element);

      if (!this.player.device) {
        this.element.style.display = "none";
      }
    }
  }, {
    key: "checkDpad",
    value: function checkDpad() {
      var ctrls = [];

      for (var btn in touchControls) {
        if (touchControls[btn].touched && touchControls[btn].dpad) {
          ctrls.push(touchControls[btn]);
        }
      } // Sort UP and DOWN so they dispatch last in a stream of directions


      return ctrls.sort(function (ctrl) {
        if (ctrl.key === _Config__WEBPACK_IMPORTED_MODULE_6__["default"].keys.UP || ctrl.key === _Config__WEBPACK_IMPORTED_MODULE_6__["default"].keys.DOWN) {
          return 1;
        } else {
          return -1;
        }
      });
    }
  }]);

  return GamePad;
}(properjs_controller__WEBPACK_IMPORTED_MODULE_7__["default"]);

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
  }]);

  return Loader;
}();

Loader.cash = function (id, val) {
  if (val) {
    cache[id] = val;
  }

  return id ? cache[id] : cache;
};

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
  }

  (0,_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__["default"])(ActiveTiles, [{
    key: "destroy",
    value: function destroy() {}
  }, {
    key: "blit",
    value: function blit(elapsed) {
      if (typeof this.previousElapsed === "undefined") {
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
      for (var id in this.layers) {
        this.layers[id].offCanvas.destroy();
      }

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
      var _this = this;

      // Render layers
      for (var id in this.layers) {
        this.addLayer(id);
      } // NPCs


      this.data.npcs.forEach(function (data) {
        _this.npcs.push(new _sprites_NPC__WEBPACK_IMPORTED_MODULE_5__["default"](_this.gamebox.player.getMergedData(data, "npcs"), _this));
      }); // Tiles

      this.data.tiles.forEach(function (data) {
        _this.activeTiles.push(new ActiveTiles(data, _this));
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
      this.renderBox = this.getRenderbox(camera); // Separate FLOAT NPCs from the normies

      var npcs = this.npcs.filter(function (npc) {
        return npc.data.type !== _Config__WEBPACK_IMPORTED_MODULE_4__["default"].npc.FLOAT;
      });
      var floats = this.npcs.filter(function (npc) {
        return npc.data.type === _Config__WEBPACK_IMPORTED_MODULE_4__["default"].npc.FLOAT;
      }); // Draw background textures

      this.renderTextures("background"); // Draw NPCs
      // They can draw to either background OR foreground

      npcs.forEach(function (npc) {
        npc.render();
      }); // Draw foreground textures

      this.renderTextures("foreground"); // Draw float NPCs (render AFTER texture foreground)

      floats.forEach(function (_float) {
        _float.render();
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
      for (var id in this.layers) {
        this.layers[id].offCanvas.clear();
      }
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
      var ret = {};

      for (var id in this.data.textures) {
        ret[id] = [];
        var height = renderBox.height / this.data.tilesize;
        var y = 0;

        while (y < height) {
          ret[id][y] = [];
          var lookupY = renderBox.y + y;

          if (this.data.textures[id][lookupY]) {
            var width = renderBox.width / this.data.tilesize;
            var x = 0;

            while (x < width) {
              var lookupX = renderBox.x + x;

              if (this.data.textures[id][lookupY][lookupX]) {
                var celsCopy = _Utils__WEBPACK_IMPORTED_MODULE_2__["default"].copy(this.data.textures[id][lookupY][lookupX]);
                var activeTile = this.getActiveTile(id, [lookupX, lookupY], celsCopy); // Render the textures
                // Shift foreground behind hero render if coords determine so

                if (id === "foreground" && lookupY * this.data.tilesize < this.gamebox.hero.position.y) {
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
      }

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
      for (var i = this.data.tiles.length; i--;) {
        var tiles = this.data.tiles[i]; // Skip if not even the right layer to begin with...

        if (layer !== tiles.layer) {
          continue;
        }

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
/* harmony import */ var _Utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Utils */ "./src/lib/Utils.js");
/* harmony import */ var _Config__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Config */ "./src/lib/Config.js");
/* harmony import */ var _GamePad__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./GamePad */ "./src/lib/GamePad.js");
/* harmony import */ var _plugins_TopView__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./plugins/TopView */ "./src/lib/plugins/TopView.js");
/* harmony import */ var _GameAudio__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./GameAudio */ "./src/lib/GameAudio.js");
/* harmony import */ var _Loader__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./Loader */ "./src/lib/Loader.js");
/* harmony import */ var paramalama__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! paramalama */ "./node_modules/paramalama/paramalama.js");
/* harmony import */ var properjs_controller__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! properjs-controller */ "./node_modules/properjs-controller/Controller.js");











var Player = /*#__PURE__*/function () {
  function Player() {
    (0,_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__["default"])(this, Player);

    this.ready = false;
    this.paused = true;
    this.stopped = false;
    this.Loader = _Loader__WEBPACK_IMPORTED_MODULE_7__["default"];
    this.controls = {
      a: false,
      aHold: false,
      b: false,
      bHold: false,
      left: false,
      right: false,
      up: false,
      down: false
    };
    this.query = (0,paramalama__WEBPACK_IMPORTED_MODULE_8__["default"])(window.location.search);
    this.gamecycle = new properjs_controller__WEBPACK_IMPORTED_MODULE_9__["default"]();
    this.previousElapsed = 0;
    this.detect();
  }

  (0,_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__["default"])(Player, [{
    key: "detect",
    value: function detect() {
      this.device = function () {
        var match = /Android|iPhone/.exec(window.navigator.userAgent);
        return match && match[0] ? true : false;
      }();

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
        this.data.game.resolution = Number(this.query.resolution);
      }

      if (this.query.spawn) {
        this.data.hero.spawn = Number(this.query.spawn);
      }
    }
  }, {
    key: "load",
    value: function load() {
      var _this = this;

      this.loader = new _Loader__WEBPACK_IMPORTED_MODULE_7__["default"]();
      this.loader.loadJson("game.json").then(function (data) {
        _this.data = data;
        _this.data.hero = _Utils__WEBPACK_IMPORTED_MODULE_2__["default"].merge(_this.data.heroes[_this.data.hero.sprite], _this.data.hero);

        _this.debug();

        _this.data.game.resolution = _this.device ? 2 : _this.data.game.resolution;
        _this.width = _this.data.game.width / _this.data.game.resolution;
        _this.height = _this.data.game.height / _this.data.game.resolution;

        _this.build();

        _this.onRotate();

        var counter = 0; // Audio is still experimental for mobile so disabling for now...

        var resources = data.bundle.filter(function (url) {
          var type = url.split("/").pop().split(".").pop();
          return _this.device ? type !== "mp3" : true;
        }); // Map bundle resource URLs to a Loader promise types for initialization...

        resources = resources.map(function (url) {
          return _this.loader.load(url).then(function () {
            counter++;
            _this.splashLoad.innerHTML = _this.getSplash("Loaded ".concat(counter, " of ").concat(resources.length, " game resources...")); // console.log( `Loaded ${counter} of ${resources.length} game resources...` );
          });
        });
        Promise.all(resources).then(function () {
          _this.splashLoad.innerHTML = _this.getSplash("Press Start");
          _this.gameaudio = new _GameAudio__WEBPACK_IMPORTED_MODULE_6__["default"](_this);
          _this.gamepad = new _GamePad__WEBPACK_IMPORTED_MODULE_4__["default"](_this);

          if (_this.data.game.plugin === _Config__WEBPACK_IMPORTED_MODULE_3__["default"].plugins.TOPVIEW) {
            _this.gamebox = new _plugins_TopView__WEBPACK_IMPORTED_MODULE_5__["default"](_this);
          }

          _this.bind();
        });
      });
    }
  }, {
    key: "getSplash",
    value: function getSplash(display) {
      return "\n            <div>\n                <div>".concat(this.data.game.name, ": Save #").concat(this.data.game.save, ", Release v").concat(this.data.game.release, "</div>\n                <div>").concat(display, "</div>\n            </div>\n        ");
    }
  }, {
    key: "getMergedData",
    value: function getMergedData(data, type) {
      return _Utils__WEBPACK_IMPORTED_MODULE_2__["default"].merge(this.data[type].find(function (obj) {
        return obj.id === data.id;
      }), data);
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
      this.element.dataset.resolution = this.data.game.resolution;
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
        this.element.classList.remove("is-portrait");
        this.element.classList.add("is-landscape");

        if (this.ready) {
          this.resume();
        }
      } else {
        this.element.classList.remove("is-landscape");
        this.element.classList.add("is-portrait");

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

        this.gamecycle.go(this.onGameBlit.bind(this));
      }
    }
  }, {
    key: "onGameBlit",
    value: function onGameBlit(elapsed) {
      var _this2 = this;

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
              _this2.gamebox.pressD(dir);
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
      } else {
        this.pause();
        this.stop();
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
}();

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Player);

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
  copy: function copy(obj) {
    return JSON.parse(JSON.stringify(obj));
  },
  merge: function merge(base, pr, f) {
    base = Utils.copy(base);
    pr = Utils.copy(pr);

    for (var i in pr) {
      if (!base[i] || f) {
        base[i] = pr[i];
      }
    }

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
  getTransform: function getTransform(el) {
    var transform = el ? window.getComputedStyle(el)["transform"] : "none";
    var values = transform.replace(/matrix|3d|\(|\)|\s/g, "").split(",");
    var ret = {}; // No Transform

    if (values[0] === "none") {
      ret.x = 0;
      ret.y = 0;
      ret.z = 0; // Matrix 3D
    } else if (values.length === 16) {
      ret.x = parseFloat(values[12]);
      ret.y = parseFloat(values[13]);
      ret.z = parseFloat(values[14]);
    } else {
      ret.x = parseFloat(values[4]);
      ret.y = parseFloat(values[5]);
      ret.z = 0;
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
  * Adds two angles together (radians).
  * @param {Float} a Base angle.
  * @param {Float} add The angle you're adding to the base angle.
  * @returns The resultant angle, always between 0 and 2*pi.
  */
  addAngle: function addAngle(a, add) {
    a = (a + add) % (Math.PI * 2);

    if (a < 0) {
      return Math.PI * 2 + a;
    } else {
      return a;
    }
  },

  /**
  * Gets the distance between two points.
  * @param {Object} p1 This is an object containing x and y params for the first point.
  * @param {Object} p2 This is an object containing x and y params for the second point.
  * @returns The distance between p1 and p2.
  */
  getDistance: function getDistance(p1, p2) {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  },

  /**
  * Calculates the angle between two points.
  * @param {Object} p1 This is an object containing x and y params for the first point.
  * @param {Object} p2 This is an object containing x and y params for the second point.
  * @param {Float} transl (Optional) Adds an angle (in radians) to the result. Defaults to 0.
  * @returns The angle between points p1 and p2, plus transl.
  */
  getAngle: function getAngle(p1, p2, transl) {
    return Utils.addAngle(Math.atan2(p2.y - p1.y, p2.x - p1.x), transl ? transl : 0);
  },

  /**
  * Translates a point by a vector defined by angle and distance. This does not return a value but rather modifies the x and y values of p1.
  * @param {Object} p1 This is an object containing x and y params for the point.
  * @param {Float} a The angle of translation (rad).
  * @param {Float} d The distance of translation.
  */
  translate: function translate(p1, a, d) {
    return {
      x: p1.x + Math.cos(a) * d,
      y: p1.y + Math.sin(a) * d
    };
  },

  /**
  * Translates an x component of a coordinate by a vector defined by angle and distance. This returns its component translation.
  * @param {Float} x1 This is an x coordinate.
  * @param {Float} a The angle of translation (rad).
  * @param {Float} d The distance of translation.
  */
  translateX: function translateX(x1, a, d) {
    return x1 + Math.cos(a) * d;
  },

  /**
  * Translates a y component of a coordinate by a vector defined by angle and distance. This returns its component translation.
  * @param {Float} y1 This is a y coordinate.
  * @param {Float} a The angle of translation (rad).
  * @param {Float} d The distance of translation.
  */
  translateY: function translateY(y1, a, d) {
    return y1 + Math.sin(a) * d;
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
/* harmony import */ var _sprites_Sprite__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../sprites/Sprite */ "./src/lib/sprites/Sprite.js");
/* harmony import */ var _sprites_Companion__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../sprites/Companion */ "./src/lib/sprites/Companion.js");
/* harmony import */ var gsap__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! gsap */ "./node_modules/gsap/gsap-core.js");






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
      //     group,
      //     coord,
      //     throw?,
      // }
      push: 0
    }; // parkour: {
    //     distance,
    //     landing: { x, y }
    // }

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


      this.map.blit(elapsed); // update gamebox (camera)

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
        console.log(this.companion);
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
      if (this.locked || this.jumping || this.falling) {
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
      if (this.locked || this.jumping || this.falling) {
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
      if (this.jumping || this.falling) {
        return;
      }

      console.log("A Hold");
    }
  }, {
    key: "releaseA",
    value: function releaseA() {
      if (this.jumping || this.falling) {
        return;
      }

      this.dialogue.check(true, false);
      this.handleReleaseA();
    }
  }, {
    key: "releaseHoldA",
    value: function releaseHoldA() {
      if (this.jumping || this.falling) {
        return;
      }

      this.handleReleaseA();
    }
  }, {
    key: "pressB",
    value: function pressB() {
      var _this2 = this;

      var poi = this.hero.getNextPoiByDir(this.hero.dir, 1);
      var collision = {
        tiles: this.checkTiles(poi, this.hero)
      }; // Apply attack cycle...

      if (collision.tiles && collision.tiles.attack.length) {
        collision.tiles.attack.forEach(function (tile) {
          if (tile.attack) {
            _this2.handleHeroTileAttack(poi, _this2.hero.dir, tile);
          }
        });
      }
    }
  }, {
    key: "holdB",
    value: function holdB() {
      if (this.jumping || this.falling) {
        return;
      }

      console.log("B Hold");
    }
  }, {
    key: "releaseB",
    value: function releaseB() {
      if (this.jumping || this.falling) {
        return;
      }

      this.dialogue.check(false, true);
    }
  }, {
    key: "releaseHoldB",
    value: function releaseHoldB() {
      if (this.jumping || this.falling) {
        return;
      }

      console.log("B Hold Release");
    }
    /*******************************************************************************
    * Hero Handlers...
    *******************************************************************************/

  }, {
    key: "handleReleaseA",
    value: function handleReleaseA() {
      if (this.jumping) {
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

      if (this.locked || this.falling) {
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
      var _this3 = this;

      this.jumping = true;
      this.hero.cycle(_Config__WEBPACK_IMPORTED_MODULE_6__["default"].verbs.JUMP, this.hero.dir);
      this.hero.physics.vz = -16;
      this.player.gameaudio.hitSound(_Config__WEBPACK_IMPORTED_MODULE_6__["default"].verbs.JUMP);
      this.keyTimer = setTimeout(function () {
        _this3.jumping = false;

        _this3.hero.face(_this3.hero.dir);
      }, 500);
    }
  }, {
    key: "applyHeroTileJump",
    value: function applyHeroTileJump(poi, dir) {
      var _this4 = this;

      this.player.controls[this.hero.dir] = true;

      if (dir === "left" && this.hero.position.x <= this.parkour.landing.x || dir === "right" && this.hero.position.x >= this.parkour.landing.x || dir === "up" && this.hero.position.y <= this.parkour.landing.y || dir === "down" && this.hero.position.y >= this.parkour.landing.y) {
        var dpad = this.player.gamepad.checkDpad();
        var dpadDir = dpad.find(function (ctrl) {
          return ctrl.btn[0] === _this4.hero.dir;
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
      var _this5 = this;

      var distance = this.map.data.tilesize + this.map.data.tilesize * tile.instance.data.elevation;
      this.parkour = {
        distance: distance,
        landing: {
          x: dir === "left" ? this.hero.position.x - distance : dir === "right" ? this.hero.position.x + distance : this.hero.position.x,
          y: dir === "up" ? this.hero.position.y - distance : dir === "down" ? this.hero.position.y + distance : this.hero.position.y
        }
      };
      this.jumping = true;
      this.hero.cycle(_Config__WEBPACK_IMPORTED_MODULE_6__["default"].verbs.JUMP, this.hero.dir);
      this.hero.physics.vz = -16;
      this.player.controls[this.hero.dir] = true;
      this.player.gameaudio.hitSound("parkour");
      this.keyTimer = setTimeout(function () {
        _this5.jumping = false;

        _this5.hero.face(_this5.hero.dir);
      }, 500);
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
      // this.switchMap( event );
      this.changeMap(event);
      this.player.stop();
    }
  }, {
    key: "handleHeroLift",
    value: function handleHeroLift(poi, dir) {
      var _this6 = this;

      this.locked = true;
      this.hero.cycle(_Config__WEBPACK_IMPORTED_MODULE_6__["default"].verbs.PULL, dir);
      setTimeout(function () {
        var activeTiles = _this6.map.getActiveTiles(_this6.interact.tile.group);

        var tileCel = activeTiles.getTile();

        _this6.player.gameaudio.hitSound(_Config__WEBPACK_IMPORTED_MODULE_6__["default"].verbs.LIFT);

        _this6.map.spliceActiveTile(_this6.interact.tile.group, _this6.interact.tile.coord);

        _this6.interact.tile.sprite = new _sprites_Sprite__WEBPACK_IMPORTED_MODULE_10__["default"]({
          type: _Config__WEBPACK_IMPORTED_MODULE_6__["default"].npc.FLOAT,
          layer: "foreground",
          width: _this6.map.data.tilesize,
          height: _this6.map.data.tilesize,
          spawn: {
            x: _this6.interact.tile.coord[0] * _this6.map.data.tilesize,
            y: _this6.interact.tile.coord[1] * _this6.map.data.tilesize
          },
          image: _this6.map.data.image,
          hitbox: {
            x: 0,
            y: 0,
            width: _this6.map.data.tilesize,
            height: _this6.map.data.tilesize
          },
          verbs: {
            face: {
              down: {
                offsetX: tileCel[0],
                offsetY: tileCel[1]
              }
            }
          }
        }, _this6.map);
        _this6.interact.tile.sprite.hero = _this6.hero;

        _this6.map.addNPC(_this6.interact.tile.sprite);

        _this6.hero.cycle(_Config__WEBPACK_IMPORTED_MODULE_6__["default"].verbs.LIFT, _this6.hero.dir);

        _this6.hero.physics.maxv = _this6.hero.physics.controlmaxv / 2;
        _this6.locked = false;
      }, 250);
    }
  }, {
    key: "handleHeroThrow",
    value: function handleHeroThrow() {
      var _this7 = this;

      this.hero.face(this.hero.dir);
      this.player.gameaudio.hitSound(_Config__WEBPACK_IMPORTED_MODULE_6__["default"].verbs.THROW);
      this.hero.physics.maxv = this.hero.physics.controlmaxv;
      this.handleThrow(this.interact.tile.sprite).then(function () {
        _this7.player.gameaudio.hitSound(_Config__WEBPACK_IMPORTED_MODULE_6__["default"].verbs.SMASH);

        _this7.map.killObj("npcs", _this7.interact.tile.sprite);

        delete _this7.interact.tile;
      });
    }
  }, {
    key: "handleHeroTiles",
    value: function handleHeroTiles(poi, dir, tiles) {
      var _this8 = this;

      tiles.passive.forEach(function (tile) {
        // Stairs are hard, you have to take it slow...
        if (tile.group === _Config__WEBPACK_IMPORTED_MODULE_6__["default"].tiles.STAIRS) {
          _this8.hero.physics.maxv = _this8.hero.physics.controlmaxv / 2; // Grass is thick, it will slow you down a bit...
        } else if (tile.group === _Config__WEBPACK_IMPORTED_MODULE_6__["default"].tiles.GRASS) {
          _this8.hero.physics.maxv = _this8.hero.physics.controlmaxv / 1.5;
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
      console.log(obj);

      if (obj.canInteract(dir)) {
        obj.doInteract(dir);
      }
    }
  }, {
    key: "handleHeroTileAction",
    value: function handleHeroTileAction(poi, dir, tile) {
      // const activeTiles = this.map.getActiveTiles( tile.group );
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
      var _this9 = this;

      return new Promise(function (resolve) {
        sprite.resolve = resolve;
        sprite.throwing = _this9.hero.dir;
        var throwX;
        var throwY;
        var dist = _this9.map.data.tilesize * 2;
        var props = {
          x: sprite.position.x,
          y: sprite.position.y
        };

        var _complete = function _complete() {
          _this9.smokeObject(sprite);

          sprite.tween.kill();
          sprite.tween = null;
          sprite.resolve();
        };

        if (sprite.throwing === "left") {
          throwX = sprite.position.x - dist;
          throwY = sprite.hero.footbox.y - (sprite.height - _this9.hero.footbox.height);
        } else if (sprite.throwing === "right") {
          throwX = sprite.position.x + dist;
          throwY = sprite.hero.footbox.y - (sprite.height - _this9.hero.footbox.height);
        } else if (sprite.throwing === "up") {
          throwX = sprite.position.x;
          throwY = sprite.position.y - dist;
        } else if (sprite.throwing === "down") {
          throwX = sprite.position.x;
          throwY = _this9.hero.footbox.y + dist;
        }

        sprite.tween = gsap__WEBPACK_IMPORTED_MODULE_12__.TweenLite.to(props, 0.5, {
          x: throwX,
          y: throwY,
          ease: gsap__WEBPACK_IMPORTED_MODULE_12__.Power4.easeOut,
          onUpdate: function onUpdate() {
            sprite.position.x = sprite.tween._targets[0].x;
            sprite.position.y = sprite.tween._targets[0].y;
            var collision = {
              map: _this9.checkMap(sprite.position, sprite),
              npc: _this9.checkNPC(sprite.position, sprite),
              camera: _this9.checkCamera(sprite.position, sprite)
            };

            if (collision.map || collision.camera || collision.npc) {
              _complete();
            }
          },
          onComplete: function onComplete() {
            _complete();
          }
        });
      });
    }
  }, {
    key: "handleRoam",
    value: function handleRoam(sprite) {
      if (!sprite.counter) {
        sprite.counter = _Utils__WEBPACK_IMPORTED_MODULE_5__["default"].random(64, 192);
        sprite.dir = ["left", "right", "up", "down"][_Utils__WEBPACK_IMPORTED_MODULE_5__["default"].random(0, 4)]; // console.log(
        //     `Roam: ${sprite.data.id}`,
        //     `Steps: ${sprite.dir} ${sprite.counter}`,
        // );
      } else {
        sprite.counter--;
      }

      if (sprite.dir === "left") {
        sprite.controls.left = 1;
        sprite.controls.right = 0;
        sprite.controls.up = 0;
        sprite.controls.down = 0;
      } else if (sprite.dir === "right") {
        sprite.controls.left = 0;
        sprite.controls.right = 1;
        sprite.controls.up = 0;
        sprite.controls.down = 0;
      } else if (sprite.dir === "up") {
        sprite.controls.left = 0;
        sprite.controls.right = 0;
        sprite.controls.up = 1;
        sprite.controls.down = 0;
      } else if (sprite.dir === "down") {
        sprite.controls.left = 0;
        sprite.controls.right = 0;
        sprite.controls.up = 0;
        sprite.controls.down = 1;
      }
    }
  }, {
    key: "handleWander",
    value: function handleWander(sprite) {
      if (!sprite.counter) {
        sprite.counter = _Utils__WEBPACK_IMPORTED_MODULE_5__["default"].random(100, 200);
        sprite.stepsX = _Utils__WEBPACK_IMPORTED_MODULE_5__["default"].random(4, 60);
        sprite.stepsY = _Utils__WEBPACK_IMPORTED_MODULE_5__["default"].random(4, 60);
        sprite.dirX = ["left", "right"][_Utils__WEBPACK_IMPORTED_MODULE_5__["default"].random(0, 2)];
        sprite.dirY = ["down", "up"][_Utils__WEBPACK_IMPORTED_MODULE_5__["default"].random(0, 2)]; // console.log(
        //     `Wander: ${sprite.data.id}`,
        //     `StepsX: ${sprite.dirX} ${sprite.stepsX}`,
        //     `StepsY: ${sprite.dirY} ${sprite.stepsY}`,
        // );
      } else {
        sprite.counter--;
      }

      if (sprite.stepsX) {
        sprite.stepsX--;

        if (sprite.dirX === "left") {
          sprite.controls.left = 1;
          sprite.controls.right = 0;

          if (sprite.data.verbs[sprite.verb].left) {
            sprite.dir = "left";
          }
        } else {
          sprite.controls.right = 1;
          sprite.controls.left = 0;

          if (sprite.data.verbs[sprite.verb].right) {
            sprite.dir = "right";
          }
        }
      } else {
        sprite.controls.left = 0;
        sprite.controls.right = 0;
      }

      if (sprite.stepsY) {
        sprite.stepsY--;

        if (sprite.dirY === "up") {
          sprite.controls.up = 1;
          sprite.controls.down = 0;

          if (sprite.data.verbs[sprite.verb].up) {
            sprite.dir = "up";
          }
        } else {
          sprite.controls.down = 1;
          sprite.controls.up = 0;

          if (sprite.data.verbs[sprite.verb].down) {
            sprite.dir = "down";
          }
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
      var _this10 = this;

      // Pause the Player so no game buttons dispatch
      this.player.pause(); // Fade out...

      this.player.element.classList.add("is-fader");
      setTimeout(function () {
        // New Map data
        var newMapData = _Loader__WEBPACK_IMPORTED_MODULE_7__["default"].cash(event.map);

        var newHeroPos = _this10.getNewHeroPosition(); // Set a spawn index...


        _this10.hero.position.x = event.spawn !== undefined ? newMapData.spawn[event.spawn].x : newHeroPos.x;
        _this10.hero.position.y = event.spawn !== undefined ? newMapData.spawn[event.spawn].y : newHeroPos.y; // Destroy old Map

        _this10.map.destroy(); // Create new Map


        _this10.map = new _Map__WEBPACK_IMPORTED_MODULE_9__["default"](newMapData, _this10);
        _this10.hero.map = _this10.map; // Initialize the new Map
        // Applies new hero offset!

        _this10.initMap(); // Handle the `dropin` effect


        if (_this10.dropin) {
          _this10.dropin = false;
          _this10.hero.position.z = -(_this10.camera.height / 2);
        } // Create a new Companion


        if (_this10.companion) {
          var newCompanionData = _Utils__WEBPACK_IMPORTED_MODULE_5__["default"].copy(_this10.hero.data.companion);
          newCompanionData.spawn = {
            x: _this10.hero.position.x,
            y: _this10.hero.position.y
          };

          _this10.companion.destroy();

          _this10.companion = new _sprites_Companion__WEBPACK_IMPORTED_MODULE_11__["default"](newCompanionData, _this10.hero);
        } // Fade in...


        _this10.player.element.classList.remove("is-fader"); // Resume game blit cycle...


        _this10.player.resume();
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
/* harmony import */ var _babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/inherits */ "./node_modules/@babel/runtime/helpers/esm/inherits.js");
/* harmony import */ var _babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @babel/runtime/helpers/possibleConstructorReturn */ "./node_modules/@babel/runtime/helpers/esm/possibleConstructorReturn.js");
/* harmony import */ var _babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @babel/runtime/helpers/getPrototypeOf */ "./node_modules/@babel/runtime/helpers/esm/getPrototypeOf.js");
/* harmony import */ var _Utils__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../Utils */ "./src/lib/Utils.js");
/* harmony import */ var _Config__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../Config */ "./src/lib/Config.js");
/* harmony import */ var _Sprite__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./Sprite */ "./src/lib/sprites/Sprite.js");
/* harmony import */ var gsap__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! gsap */ "./node_modules/gsap/gsap-core.js");






function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0,_babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_4__["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0,_babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_4__["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0,_babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_3__["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }





/*******************************************************************************
* Companion NPC
* Have different behaviors for being "anchored" to a Hero
*******************************************************************************/

var Companion = /*#__PURE__*/function (_Sprite) {
  (0,_babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_2__["default"])(Companion, _Sprite);

  var _super = _createSuper(Companion);

  function Companion(data, hero) {
    var _this;

    (0,_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__["default"])(this, Companion);

    _this = _super.call(this, data, hero.map);
    _this.layer = _this.data.type === _Config__WEBPACK_IMPORTED_MODULE_6__["default"].npc.FLOAT ? "foreground" : "heroground";
    _this.hero = hero;
    _this.watchFPS = 24;
    _this.watchFrame = 0;
    _this.checkFrame = 0;
    _this.watchDur = 1000;
    return _this;
  }

  (0,_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__["default"])(Companion, [{
    key: "visible",
    value: function visible() {
      return true;
    }
  }, {
    key: "destroy",
    value: function destroy() {
      if (this.tween) {
        this.tween.kill();
        this.tween = null;
      }
    }
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

      if (typeof this.previousElapsed === "undefined") {
        this.previousElapsed = elapsed;
      }

      if (typeof this.watchElapsed === "undefined") {
        this.watchElapsed = elapsed;
      } // Companion type?


      if (this.data.type === _Config__WEBPACK_IMPORTED_MODULE_6__["default"].npc.WALK) {
        this.blitWalk();
      } else if (this.data.type === _Config__WEBPACK_IMPORTED_MODULE_6__["default"].npc.FLOAT) {
        this.blitFloat();
      } // Set watch cycle frame


      this.watchDiff = elapsed - this.watchElapsed;
      this.checkFrame = Math.floor(this.watchDiff / this.watchDur * this.watchFPS);

      if (this.watchDiff >= this.watchDur) {
        this.watchElapsed = elapsed;
        this.watchFrame = 0;
        this.checkFrame = 0;
      }

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
      // Hero is NOT idle, so moving
      // Hero IS idle but companion is within a threshold distance...
      if (!this.hero.idle.x || !this.hero.idle.y || this.hero.idle.x && this.hero.idle.y && this.distance > this.map.data.tilesize / 2) {
        // Bounce condition is TRUE
        // Position Z is zero, so bounce a bit...
        if (this.data.bounce && this.position.z === 0) {
          this.physics.vz = -8;
        }
      }

      if (this.hero.position.x + this.hero.width / 2 > this.position.x + this.width / 2) {
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
      if (this.data.type === _Config__WEBPACK_IMPORTED_MODULE_6__["default"].npc.WALK) {
        this.applyWalkPosition();
      } else if (this.data.type === _Config__WEBPACK_IMPORTED_MODULE_6__["default"].npc.FLOAT) {
        this.applyFloatPosition();
      }
    }
  }, {
    key: "applyFloatPosition",
    value: function applyFloatPosition() {
      var _this2 = this;

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

      if (!this.origin) {
        this.origin = this.position; // console.log( `Companion spawn origin ${this.data.id} (${this.position.x}, ${this.position.y})` );
      }

      if (poi.x && poi.y && this.checkFrame !== this.watchFrame) {
        this.watchFrame = this.checkFrame;

        if (this.tween) {
          this.tween.kill();
        }

        var angle = _Utils__WEBPACK_IMPORTED_MODULE_5__["default"].getAngle(this.position, poi);
        var distance = _Utils__WEBPACK_IMPORTED_MODULE_5__["default"].getDistance(this.position, poi);
        var origin = {
          x: this.position.x,
          y: this.position.y
        };
        var props = {
          dist: 0
        };
        var duration = !this.hero.idle.x && !this.hero.idle.y ? 2.0 : 1.5;

        if (distance > 1) {
          this.idle.x = false;
          this.idle.y = false;
          this.tween = gsap__WEBPACK_IMPORTED_MODULE_8__.TweenLite.to(props, duration, {
            dist: distance,
            ease: gsap__WEBPACK_IMPORTED_MODULE_8__.Power2.easeOut,
            onUpdate: function onUpdate() {
              var dist = distance - (distance - props.dist);
              var pos = _Utils__WEBPACK_IMPORTED_MODULE_5__["default"].translate(origin, angle, dist);
              _this2.position.x = pos.x;
              _this2.position.y = pos.y;
            },
            onComplete: function onComplete() {
              _this2.tween = null;
            }
          });
        } else {
          this.idle.x = true;
          this.idle.y = true;
        }
      }
    }
  }, {
    key: "applyWalkPosition",
    value: function applyWalkPosition() {
      var _this3 = this;

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

      if (!this.origin) {
        this.origin = this.position; // console.log( `Spawn Origin ${this.data.id} (${this.position.x}, ${this.position.y})`, this );
      }

      if (poi.x && poi.y && this.checkFrame !== this.watchFrame && this.hero.verb !== _Config__WEBPACK_IMPORTED_MODULE_6__["default"].verbs.GRAB) {
        this.watchFrame = this.checkFrame;

        if (this.tween) {
          this.tween.kill();
        }

        var angle = _Utils__WEBPACK_IMPORTED_MODULE_5__["default"].getAngle(this.position, poi);
        var distance = _Utils__WEBPACK_IMPORTED_MODULE_5__["default"].getDistance(this.position, poi);
        var origin = {
          x: this.position.x,
          y: this.position.y
        };
        var props = {
          dist: 0
        };
        var duration = !this.hero.idle.x && !this.hero.idle.y ? 2.0 : 1.5;
        this.distance = distance; // Simple NPCs can operate with just FACE data
        // Checking for WALK data to shift sprite cycles while moving...

        if (distance >= this.map.data.tilesize / 4 && this.data.verbs[_Config__WEBPACK_IMPORTED_MODULE_6__["default"].verbs.WALK]) {
          this.verb = _Config__WEBPACK_IMPORTED_MODULE_6__["default"].verbs.WALK;
        } else {
          this.verb = _Config__WEBPACK_IMPORTED_MODULE_6__["default"].verbs.FACE;
        }

        if (distance >= 1) {
          this.idle.x = false;
          this.idle.y = false;
          this.tween = gsap__WEBPACK_IMPORTED_MODULE_8__.TweenLite.to(props, duration, {
            dist: distance,
            ease: gsap__WEBPACK_IMPORTED_MODULE_8__.Power2.easeOut,
            onUpdate: function onUpdate() {
              var dist = distance - (distance - props.dist);
              var pos = _Utils__WEBPACK_IMPORTED_MODULE_5__["default"].translate(origin, angle, dist);
              _this3.position.x = pos.x;
              _this3.position.y = pos.y;
            },
            onComplete: function onComplete() {
              _this3.tween = null;
            }
          });
        } else {
          this.idle.x = true;
          this.idle.y = true;
        }
      }
    }
  }]);

  return Companion;
}(_Sprite__WEBPACK_IMPORTED_MODULE_7__["default"]);

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

      if (typeof this.previousElapsed === "undefined") {
        this.previousElapsed = elapsed;
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
          this.map.killObj("fx", this);
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
        this.cycle(_Config__WEBPACK_IMPORTED_MODULE_5__["default"].verbs.JUMP, this.dir); // Idle comes next...LIFT has it's own idle face...
      } else if (this.idle.x && this.idle.y) {
        this.face(this.dir);
      } else {
        this.cycle(_Config__WEBPACK_IMPORTED_MODULE_5__["default"].verbs.WALK, this.dir);
      }
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
      var dirs = [];

      if (this.controls.left) {
        dirs.push("left");
      } else if (this.controls.right) {
        dirs.push("right");
      }

      if (this.controls.up) {
        dirs.push("up");
      } else if (this.controls.down) {
        dirs.push("down");
      }

      var poi = this.getNextPoi();
      var collision = {
        map: this.gamebox.checkMap(poi, this),
        npc: this.gamebox.checkNPC(poi, this),
        hero: this.gamebox.checkHero(poi, this),
        tiles: this.gamebox.checkTiles(poi, this)
      };

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
      } else if (!collision.map && !collision.npc && !collision.hero && !this.gamebox.canHeroTileStop(poi, null, collision)) {
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
    * Order is: blit, update, render
    * Update is overridden for Sprite subclasses with different behaviors
    * Default behavior for a Sprite is to be static but with Physics forces
    *******************************************************************************/

  }, {
    key: "blit",
    value: function blit(elapsed) {
      if (!this.visible()) {
        return;
      }

      if (typeof this.previousElapsed === "undefined") {
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
      } // Move betweeb BG and FG relative to Hero


      if (this !== this.gamebox.hero && this !== this.gamebox.companion) {
        // Assume that FLOAT should always render to the foreground
        if (this.data.type === _Config__WEBPACK_IMPORTED_MODULE_4__["default"].npc.FLOAT) {
          this.layer = "foreground"; // Sprites that have a smaller hitbox than their actual size can flip layer
        } else if (this.hitbox.width * this.hitbox.height !== this.width * this.height && this.hitbox.y > this.gamebox.hero.hitbox.y) {
          this.layer = "foreground";
        } else {
          this.layer = "background";
        }
      }

      if (this.data.shadow) {
        this.map.gamebox.layers[this.layer].onCanvas.context.drawImage(this.image, Math.abs(this.data.shadow.offsetX), Math.abs(this.data.shadow.offsetY), this.data.width, this.data.height, this.offset.x, this.offset.y, this.width, this.height);
      }

      if (this.opacity) {
        this.map.gamebox.layers[this.layer].onCanvas.context.globalAlpha = this.opacity;
      }

      this.map.gamebox.layers[this.layer].onCanvas.context.drawImage(this.image, this.spritecel[0], this.spritecel[1], this.data.width, this.data.height, this.offset.x, this.offset.y + this.position.z, this.width, this.height);
      this.map.gamebox.layers[this.layer].onCanvas.context.globalAlpha = 1.0;
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
      this.frame = 0;

      if (this.data.verbs[this.verb][this.dir].stepsX) {
        if (this.verb === _Config__WEBPACK_IMPORTED_MODULE_4__["default"].verbs.LIFT && this.idle.x && this.idle.y) {// console.log( "static lift..." );
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

/***/ "./node_modules/gsap/gsap-core.js":
/*!****************************************!*\
  !*** ./node_modules/gsap/gsap-core.js ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Animation": () => (/* binding */ Animation),
/* harmony export */   "Back": () => (/* binding */ Back),
/* harmony export */   "Bounce": () => (/* binding */ Bounce),
/* harmony export */   "Circ": () => (/* binding */ Circ),
/* harmony export */   "Cubic": () => (/* binding */ Cubic),
/* harmony export */   "Elastic": () => (/* binding */ Elastic),
/* harmony export */   "Expo": () => (/* binding */ Expo),
/* harmony export */   "GSCache": () => (/* binding */ GSCache),
/* harmony export */   "Linear": () => (/* binding */ Linear),
/* harmony export */   "Power0": () => (/* binding */ Power0),
/* harmony export */   "Power1": () => (/* binding */ Power1),
/* harmony export */   "Power2": () => (/* binding */ Power2),
/* harmony export */   "Power3": () => (/* binding */ Power3),
/* harmony export */   "Power4": () => (/* binding */ Power4),
/* harmony export */   "PropTween": () => (/* binding */ PropTween),
/* harmony export */   "Quad": () => (/* binding */ Quad),
/* harmony export */   "Quart": () => (/* binding */ Quart),
/* harmony export */   "Quint": () => (/* binding */ Quint),
/* harmony export */   "Sine": () => (/* binding */ Sine),
/* harmony export */   "SteppedEase": () => (/* binding */ SteppedEase),
/* harmony export */   "Strong": () => (/* binding */ Strong),
/* harmony export */   "Timeline": () => (/* binding */ Timeline),
/* harmony export */   "TimelineLite": () => (/* binding */ Timeline),
/* harmony export */   "TimelineMax": () => (/* binding */ Timeline),
/* harmony export */   "Tween": () => (/* binding */ Tween),
/* harmony export */   "TweenLite": () => (/* binding */ Tween),
/* harmony export */   "TweenMax": () => (/* binding */ Tween),
/* harmony export */   "_checkPlugin": () => (/* binding */ _checkPlugin),
/* harmony export */   "_colorExp": () => (/* binding */ _colorExp),
/* harmony export */   "_colorStringFilter": () => (/* binding */ _colorStringFilter),
/* harmony export */   "_config": () => (/* binding */ _config),
/* harmony export */   "_forEachName": () => (/* binding */ _forEachName),
/* harmony export */   "_getCache": () => (/* binding */ _getCache),
/* harmony export */   "_getProperty": () => (/* binding */ _getProperty),
/* harmony export */   "_getSetter": () => (/* binding */ _getSetter),
/* harmony export */   "_isString": () => (/* binding */ _isString),
/* harmony export */   "_isUndefined": () => (/* binding */ _isUndefined),
/* harmony export */   "_missingPlugin": () => (/* binding */ _missingPlugin),
/* harmony export */   "_numExp": () => (/* binding */ _numExp),
/* harmony export */   "_numWithUnitExp": () => (/* binding */ _numWithUnitExp),
/* harmony export */   "_plugins": () => (/* binding */ _plugins),
/* harmony export */   "_relExp": () => (/* binding */ _relExp),
/* harmony export */   "_removeLinkedListItem": () => (/* binding */ _removeLinkedListItem),
/* harmony export */   "_renderComplexString": () => (/* binding */ _renderComplexString),
/* harmony export */   "_replaceRandom": () => (/* binding */ _replaceRandom),
/* harmony export */   "_round": () => (/* binding */ _round),
/* harmony export */   "_roundModifier": () => (/* binding */ _roundModifier),
/* harmony export */   "_setDefaults": () => (/* binding */ _setDefaults),
/* harmony export */   "_sortPropTweensByPriority": () => (/* binding */ _sortPropTweensByPriority),
/* harmony export */   "_ticker": () => (/* binding */ _ticker),
/* harmony export */   "clamp": () => (/* binding */ clamp),
/* harmony export */   "default": () => (/* binding */ gsap),
/* harmony export */   "distribute": () => (/* binding */ distribute),
/* harmony export */   "getUnit": () => (/* binding */ getUnit),
/* harmony export */   "gsap": () => (/* binding */ gsap),
/* harmony export */   "interpolate": () => (/* binding */ interpolate),
/* harmony export */   "mapRange": () => (/* binding */ mapRange),
/* harmony export */   "normalize": () => (/* binding */ normalize),
/* harmony export */   "pipe": () => (/* binding */ pipe),
/* harmony export */   "random": () => (/* binding */ random),
/* harmony export */   "shuffle": () => (/* binding */ shuffle),
/* harmony export */   "snap": () => (/* binding */ snap),
/* harmony export */   "splitColor": () => (/* binding */ splitColor),
/* harmony export */   "toArray": () => (/* binding */ toArray),
/* harmony export */   "unitize": () => (/* binding */ unitize),
/* harmony export */   "wrap": () => (/* binding */ wrap),
/* harmony export */   "wrapYoyo": () => (/* binding */ wrapYoyo)
/* harmony export */ });
function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

/*!
 * GSAP 3.6.1
 * https://greensock.com
 *
 * @license Copyright 2008-2021, GreenSock. All rights reserved.
 * Subject to the terms at https://greensock.com/standard-license or for
 * Club GreenSock members, the agreement issued with that membership.
 * @author: Jack Doyle, jack@greensock.com
*/

/* eslint-disable */
var _config = {
  autoSleep: 120,
  force3D: "auto",
  nullTargetWarn: 1,
  units: {
    lineHeight: ""
  }
},
    _defaults = {
  duration: .5,
  overwrite: false,
  delay: 0
},
    _suppressOverwrites,
    _bigNum = 1e8,
    _tinyNum = 1 / _bigNum,
    _2PI = Math.PI * 2,
    _HALF_PI = _2PI / 4,
    _gsID = 0,
    _sqrt = Math.sqrt,
    _cos = Math.cos,
    _sin = Math.sin,
    _isString = function _isString(value) {
  return typeof value === "string";
},
    _isFunction = function _isFunction(value) {
  return typeof value === "function";
},
    _isNumber = function _isNumber(value) {
  return typeof value === "number";
},
    _isUndefined = function _isUndefined(value) {
  return typeof value === "undefined";
},
    _isObject = function _isObject(value) {
  return typeof value === "object";
},
    _isNotFalse = function _isNotFalse(value) {
  return value !== false;
},
    _windowExists = function _windowExists() {
  return typeof window !== "undefined";
},
    _isFuncOrString = function _isFuncOrString(value) {
  return _isFunction(value) || _isString(value);
},
    _isTypedArray = typeof ArrayBuffer === "function" && ArrayBuffer.isView || function () {},
    // note: IE10 has ArrayBuffer, but NOT ArrayBuffer.isView().
_isArray = Array.isArray,
    _strictNumExp = /(?:-?\.?\d|\.)+/gi,
    //only numbers (including negatives and decimals) but NOT relative values.
_numExp = /[-+=.]*\d+[.e\-+]*\d*[e\-+]*\d*/g,
    //finds any numbers, including ones that start with += or -=, negative numbers, and ones in scientific notation like 1e-8.
_numWithUnitExp = /[-+=.]*\d+[.e-]*\d*[a-z%]*/g,
    _complexStringNumExp = /[-+=.]*\d+\.?\d*(?:e-|e\+)?\d*/gi,
    //duplicate so that while we're looping through matches from exec(), it doesn't contaminate the lastIndex of _numExp which we use to search for colors too.
_relExp = /[+-]=-?[.\d]+/,
    _delimitedValueExp = /[#\-+.]*\b[a-z\d-=+%.]+/gi,
    _unitExp = /[\d.+\-=]+(?:e[-+]\d*)*/i,
    _globalTimeline,
    _win,
    _coreInitted,
    _doc,
    _globals = {},
    _installScope = {},
    _coreReady,
    _install = function _install(scope) {
  return (_installScope = _merge(scope, _globals)) && gsap;
},
    _missingPlugin = function _missingPlugin(property, value) {
  return console.warn("Invalid property", property, "set to", value, "Missing plugin? gsap.registerPlugin()");
},
    _warn = function _warn(message, suppress) {
  return !suppress && console.warn(message);
},
    _addGlobal = function _addGlobal(name, obj) {
  return name && (_globals[name] = obj) && _installScope && (_installScope[name] = obj) || _globals;
},
    _emptyFunc = function _emptyFunc() {
  return 0;
},
    _reservedProps = {},
    _lazyTweens = [],
    _lazyLookup = {},
    _lastRenderedFrame,
    _plugins = {},
    _effects = {},
    _nextGCFrame = 30,
    _harnessPlugins = [],
    _callbackNames = "",
    _harness = function _harness(targets) {
  var target = targets[0],
      harnessPlugin,
      i;
  _isObject(target) || _isFunction(target) || (targets = [targets]);

  if (!(harnessPlugin = (target._gsap || {}).harness)) {
    // find the first target with a harness. We assume targets passed into an animation will be of similar type, meaning the same kind of harness can be used for them all (performance optimization)
    i = _harnessPlugins.length;

    while (i-- && !_harnessPlugins[i].targetTest(target)) {}

    harnessPlugin = _harnessPlugins[i];
  }

  i = targets.length;

  while (i--) {
    targets[i] && (targets[i]._gsap || (targets[i]._gsap = new GSCache(targets[i], harnessPlugin))) || targets.splice(i, 1);
  }

  return targets;
},
    _getCache = function _getCache(target) {
  return target._gsap || _harness(toArray(target))[0]._gsap;
},
    _getProperty = function _getProperty(target, property, v) {
  return (v = target[property]) && _isFunction(v) ? target[property]() : _isUndefined(v) && target.getAttribute && target.getAttribute(property) || v;
},
    _forEachName = function _forEachName(names, func) {
  return (names = names.split(",")).forEach(func) || names;
},
    //split a comma-delimited list of names into an array, then run a forEach() function and return the split array (this is just a way to consolidate/shorten some code).
_round = function _round(value) {
  return Math.round(value * 100000) / 100000 || 0;
},
    _arrayContainsAny = function _arrayContainsAny(toSearch, toFind) {
  //searches one array to find matches for any of the items in the toFind array. As soon as one is found, it returns true. It does NOT return all the matches; it's simply a boolean search.
  var l = toFind.length,
      i = 0;

  for (; toSearch.indexOf(toFind[i]) < 0 && ++i < l;) {}

  return i < l;
},
    _parseVars = function _parseVars(params, type, parent) {
  //reads the arguments passed to one of the key methods and figures out if the user is defining things with the OLD/legacy syntax where the duration is the 2nd parameter, and then it adjusts things accordingly and spits back the corrected vars object (with the duration added if necessary, as well as runBackwards or startAt or immediateRender). type 0 = to()/staggerTo(), 1 = from()/staggerFrom(), 2 = fromTo()/staggerFromTo()
  var isLegacy = _isNumber(params[1]),
      varsIndex = (isLegacy ? 2 : 1) + (type < 2 ? 0 : 1),
      vars = params[varsIndex],
      irVars;

  isLegacy && (vars.duration = params[1]);
  vars.parent = parent;

  if (type) {
    irVars = vars;

    while (parent && !("immediateRender" in irVars)) {
      // inheritance hasn't happened yet, but someone may have set a default in an ancestor timeline. We could do vars.immediateRender = _isNotFalse(_inheritDefaults(vars).immediateRender) but that'd exact a slight performance penalty because _inheritDefaults() also runs in the Tween constructor. We're paying a small kb price here to gain speed.
      irVars = parent.vars.defaults || {};
      parent = _isNotFalse(parent.vars.inherit) && parent.parent;
    }

    vars.immediateRender = _isNotFalse(irVars.immediateRender);
    type < 2 ? vars.runBackwards = 1 : vars.startAt = params[varsIndex - 1]; // "from" vars
  }

  return vars;
},
    _lazyRender = function _lazyRender() {
  var l = _lazyTweens.length,
      a = _lazyTweens.slice(0),
      i,
      tween;

  _lazyLookup = {};
  _lazyTweens.length = 0;

  for (i = 0; i < l; i++) {
    tween = a[i];
    tween && tween._lazy && (tween.render(tween._lazy[0], tween._lazy[1], true)._lazy = 0);
  }
},
    _lazySafeRender = function _lazySafeRender(animation, time, suppressEvents, force) {
  _lazyTweens.length && _lazyRender();
  animation.render(time, suppressEvents, force);
  _lazyTweens.length && _lazyRender(); //in case rendering caused any tweens to lazy-init, we should render them because typically when someone calls seek() or time() or progress(), they expect an immediate render.
},
    _numericIfPossible = function _numericIfPossible(value) {
  var n = parseFloat(value);
  return (n || n === 0) && (value + "").match(_delimitedValueExp).length < 2 ? n : _isString(value) ? value.trim() : value;
},
    _passThrough = function _passThrough(p) {
  return p;
},
    _setDefaults = function _setDefaults(obj, defaults) {
  for (var p in defaults) {
    p in obj || (obj[p] = defaults[p]);
  }

  return obj;
},
    _setKeyframeDefaults = function _setKeyframeDefaults(obj, defaults) {
  for (var p in defaults) {
    p in obj || p === "duration" || p === "ease" || (obj[p] = defaults[p]);
  }
},
    _merge = function _merge(base, toMerge) {
  for (var p in toMerge) {
    base[p] = toMerge[p];
  }

  return base;
},
    _mergeDeep = function _mergeDeep(base, toMerge) {
  for (var p in toMerge) {
    p !== "__proto__" && p !== "constructor" && p !== "prototype" && (base[p] = _isObject(toMerge[p]) ? _mergeDeep(base[p] || (base[p] = {}), toMerge[p]) : toMerge[p]);
  }

  return base;
},
    _copyExcluding = function _copyExcluding(obj, excluding) {
  var copy = {},
      p;

  for (p in obj) {
    p in excluding || (copy[p] = obj[p]);
  }

  return copy;
},
    _inheritDefaults = function _inheritDefaults(vars) {
  var parent = vars.parent || _globalTimeline,
      func = vars.keyframes ? _setKeyframeDefaults : _setDefaults;

  if (_isNotFalse(vars.inherit)) {
    while (parent) {
      func(vars, parent.vars.defaults);
      parent = parent.parent || parent._dp;
    }
  }

  return vars;
},
    _arraysMatch = function _arraysMatch(a1, a2) {
  var i = a1.length,
      match = i === a2.length;

  while (match && i-- && a1[i] === a2[i]) {}

  return i < 0;
},
    _addLinkedListItem = function _addLinkedListItem(parent, child, firstProp, lastProp, sortBy) {
  if (firstProp === void 0) {
    firstProp = "_first";
  }

  if (lastProp === void 0) {
    lastProp = "_last";
  }

  var prev = parent[lastProp],
      t;

  if (sortBy) {
    t = child[sortBy];

    while (prev && prev[sortBy] > t) {
      prev = prev._prev;
    }
  }

  if (prev) {
    child._next = prev._next;
    prev._next = child;
  } else {
    child._next = parent[firstProp];
    parent[firstProp] = child;
  }

  if (child._next) {
    child._next._prev = child;
  } else {
    parent[lastProp] = child;
  }

  child._prev = prev;
  child.parent = child._dp = parent;
  return child;
},
    _removeLinkedListItem = function _removeLinkedListItem(parent, child, firstProp, lastProp) {
  if (firstProp === void 0) {
    firstProp = "_first";
  }

  if (lastProp === void 0) {
    lastProp = "_last";
  }

  var prev = child._prev,
      next = child._next;

  if (prev) {
    prev._next = next;
  } else if (parent[firstProp] === child) {
    parent[firstProp] = next;
  }

  if (next) {
    next._prev = prev;
  } else if (parent[lastProp] === child) {
    parent[lastProp] = prev;
  }

  child._next = child._prev = child.parent = null; // don't delete the _dp just so we can revert if necessary. But parent should be null to indicate the item isn't in a linked list.
},
    _removeFromParent = function _removeFromParent(child, onlyIfParentHasAutoRemove) {
  child.parent && (!onlyIfParentHasAutoRemove || child.parent.autoRemoveChildren) && child.parent.remove(child);
  child._act = 0;
},
    _uncache = function _uncache(animation, child) {
  if (animation && (!child || child._end > animation._dur || child._start < 0)) {
    // performance optimization: if a child animation is passed in we should only uncache if that child EXTENDS the animation (its end time is beyond the end)
    var a = animation;

    while (a) {
      a._dirty = 1;
      a = a.parent;
    }
  }

  return animation;
},
    _recacheAncestors = function _recacheAncestors(animation) {
  var parent = animation.parent;

  while (parent && parent.parent) {
    //sometimes we must force a re-sort of all children and update the duration/totalDuration of all ancestor timelines immediately in case, for example, in the middle of a render loop, one tween alters another tween's timeScale which shoves its startTime before 0, forcing the parent timeline to shift around and shiftChildren() which could affect that next tween's render (startTime). Doesn't matter for the root timeline though.
    parent._dirty = 1;
    parent.totalDuration();
    parent = parent.parent;
  }

  return animation;
},
    _hasNoPausedAncestors = function _hasNoPausedAncestors(animation) {
  return !animation || animation._ts && _hasNoPausedAncestors(animation.parent);
},
    _elapsedCycleDuration = function _elapsedCycleDuration(animation) {
  return animation._repeat ? _animationCycle(animation._tTime, animation = animation.duration() + animation._rDelay) * animation : 0;
},
    // feed in the totalTime and cycleDuration and it'll return the cycle (iteration minus 1) and if the playhead is exactly at the very END, it will NOT bump up to the next cycle.
_animationCycle = function _animationCycle(tTime, cycleDuration) {
  var whole = Math.floor(tTime /= cycleDuration);
  return tTime && whole === tTime ? whole - 1 : whole;
},
    _parentToChildTotalTime = function _parentToChildTotalTime(parentTime, child) {
  return (parentTime - child._start) * child._ts + (child._ts >= 0 ? 0 : child._dirty ? child.totalDuration() : child._tDur);
},
    _setEnd = function _setEnd(animation) {
  return animation._end = _round(animation._start + (animation._tDur / Math.abs(animation._ts || animation._rts || _tinyNum) || 0));
},
    _alignPlayhead = function _alignPlayhead(animation, totalTime) {
  // adjusts the animation's _start and _end according to the provided totalTime (only if the parent's smoothChildTiming is true and the animation isn't paused). It doesn't do any rendering or forcing things back into parent timelines, etc. - that's what totalTime() is for.
  var parent = animation._dp;

  if (parent && parent.smoothChildTiming && animation._ts) {
    animation._start = _round(parent._time - (animation._ts > 0 ? totalTime / animation._ts : ((animation._dirty ? animation.totalDuration() : animation._tDur) - totalTime) / -animation._ts));

    _setEnd(animation);

    parent._dirty || _uncache(parent, animation); //for performance improvement. If the parent's cache is already dirty, it already took care of marking the ancestors as dirty too, so skip the function call here.
  }

  return animation;
},

/*
_totalTimeToTime = (clampedTotalTime, duration, repeat, repeatDelay, yoyo) => {
	let cycleDuration = duration + repeatDelay,
		time = _round(clampedTotalTime % cycleDuration);
	if (time > duration) {
		time = duration;
	}
	return (yoyo && (~~(clampedTotalTime / cycleDuration) & 1)) ? duration - time : time;
},
*/
_postAddChecks = function _postAddChecks(timeline, child) {
  var t;

  if (child._time || child._initted && !child._dur) {
    //in case, for example, the _start is moved on a tween that has already rendered. Imagine it's at its end state, then the startTime is moved WAY later (after the end of this timeline), it should render at its beginning.
    t = _parentToChildTotalTime(timeline.rawTime(), child);

    if (!child._dur || _clamp(0, child.totalDuration(), t) - child._tTime > _tinyNum) {
      child.render(t, true);
    }
  } //if the timeline has already ended but the inserted tween/timeline extends the duration, we should enable this timeline again so that it renders properly. We should also align the playhead with the parent timeline's when appropriate.


  if (_uncache(timeline, child)._dp && timeline._initted && timeline._time >= timeline._dur && timeline._ts) {
    //in case any of the ancestors had completed but should now be enabled...
    if (timeline._dur < timeline.duration()) {
      t = timeline;

      while (t._dp) {
        t.rawTime() >= 0 && t.totalTime(t._tTime); //moves the timeline (shifts its startTime) if necessary, and also enables it. If it's currently zero, though, it may not be scheduled to render until later so there's no need to force it to align with the current playhead position. Only move to catch up with the playhead.

        t = t._dp;
      }
    }

    timeline._zTime = -_tinyNum; // helps ensure that the next render() will be forced (crossingStart = true in render()), even if the duration hasn't changed (we're adding a child which would need to get rendered). Definitely an edge case. Note: we MUST do this AFTER the loop above where the totalTime() might trigger a render() because this _addToTimeline() method gets called from the Animation constructor, BEFORE tweens even record their targets, etc. so we wouldn't want things to get triggered in the wrong order.
  }
},
    _addToTimeline = function _addToTimeline(timeline, child, position, skipChecks) {
  child.parent && _removeFromParent(child);
  child._start = _round(position + child._delay);
  child._end = _round(child._start + (child.totalDuration() / Math.abs(child.timeScale()) || 0));

  _addLinkedListItem(timeline, child, "_first", "_last", timeline._sort ? "_start" : 0);

  timeline._recent = child;
  skipChecks || _postAddChecks(timeline, child);
  return timeline;
},
    _scrollTrigger = function _scrollTrigger(animation, trigger) {
  return (_globals.ScrollTrigger || _missingPlugin("scrollTrigger", trigger)) && _globals.ScrollTrigger.create(trigger, animation);
},
    _attemptInitTween = function _attemptInitTween(tween, totalTime, force, suppressEvents) {
  _initTween(tween, totalTime);

  if (!tween._initted) {
    return 1;
  }

  if (!force && tween._pt && (tween._dur && tween.vars.lazy !== false || !tween._dur && tween.vars.lazy) && _lastRenderedFrame !== _ticker.frame) {
    _lazyTweens.push(tween);

    tween._lazy = [totalTime, suppressEvents];
    return 1;
  }
},
    _parentPlayheadIsBeforeStart = function _parentPlayheadIsBeforeStart(_ref) {
  var parent = _ref.parent;
  return parent && parent._ts && parent._initted && !parent._lock && (parent.rawTime() < 0 || _parentPlayheadIsBeforeStart(parent));
},
    // check parent's _lock because when a timeline repeats/yoyos and does its artificial wrapping, we shouldn't force the ratio back to 0
_renderZeroDurationTween = function _renderZeroDurationTween(tween, totalTime, suppressEvents, force) {
  var prevRatio = tween.ratio,
      ratio = totalTime < 0 || !totalTime && (!tween._start && _parentPlayheadIsBeforeStart(tween) || (tween._ts < 0 || tween._dp._ts < 0) && tween.data !== "isFromStart" && tween.data !== "isStart") ? 0 : 1,
      // if the tween or its parent is reversed and the totalTime is 0, we should go to a ratio of 0.
  repeatDelay = tween._rDelay,
      tTime = 0,
      pt,
      iteration,
      prevIteration;

  if (repeatDelay && tween._repeat) {
    // in case there's a zero-duration tween that has a repeat with a repeatDelay
    tTime = _clamp(0, tween._tDur, totalTime);
    iteration = _animationCycle(tTime, repeatDelay);
    prevIteration = _animationCycle(tween._tTime, repeatDelay);
    tween._yoyo && iteration & 1 && (ratio = 1 - ratio);

    if (iteration !== prevIteration) {
      prevRatio = 1 - ratio;
      tween.vars.repeatRefresh && tween._initted && tween.invalidate();
    }
  }

  if (ratio !== prevRatio || force || tween._zTime === _tinyNum || !totalTime && tween._zTime) {
    if (!tween._initted && _attemptInitTween(tween, totalTime, force, suppressEvents)) {
      // if we render the very beginning (time == 0) of a fromTo(), we must force the render (normal tweens wouldn't need to render at a time of 0 when the prevTime was also 0). This is also mandatory to make sure overwriting kicks in immediately.
      return;
    }

    prevIteration = tween._zTime;
    tween._zTime = totalTime || (suppressEvents ? _tinyNum : 0); // when the playhead arrives at EXACTLY time 0 (right on top) of a zero-duration tween, we need to discern if events are suppressed so that when the playhead moves again (next time), it'll trigger the callback. If events are NOT suppressed, obviously the callback would be triggered in this render. Basically, the callback should fire either when the playhead ARRIVES or LEAVES this exact spot, not both. Imagine doing a timeline.seek(0) and there's a callback that sits at 0. Since events are suppressed on that seek() by default, nothing will fire, but when the playhead moves off of that position, the callback should fire. This behavior is what people intuitively expect.

    suppressEvents || (suppressEvents = totalTime && !prevIteration); // if it was rendered previously at exactly 0 (_zTime) and now the playhead is moving away, DON'T fire callbacks otherwise they'll seem like duplicates.

    tween.ratio = ratio;
    tween._from && (ratio = 1 - ratio);
    tween._time = 0;
    tween._tTime = tTime;
    pt = tween._pt;

    while (pt) {
      pt.r(ratio, pt.d);
      pt = pt._next;
    }

    tween._startAt && totalTime < 0 && tween._startAt.render(totalTime, true, true);
    tween._onUpdate && !suppressEvents && _callback(tween, "onUpdate");
    tTime && tween._repeat && !suppressEvents && tween.parent && _callback(tween, "onRepeat");

    if ((totalTime >= tween._tDur || totalTime < 0) && tween.ratio === ratio) {
      ratio && _removeFromParent(tween, 1);

      if (!suppressEvents) {
        _callback(tween, ratio ? "onComplete" : "onReverseComplete", true);

        tween._prom && tween._prom();
      }
    }
  } else if (!tween._zTime) {
    tween._zTime = totalTime;
  }
},
    _findNextPauseTween = function _findNextPauseTween(animation, prevTime, time) {
  var child;

  if (time > prevTime) {
    child = animation._first;

    while (child && child._start <= time) {
      if (!child._dur && child.data === "isPause" && child._start > prevTime) {
        return child;
      }

      child = child._next;
    }
  } else {
    child = animation._last;

    while (child && child._start >= time) {
      if (!child._dur && child.data === "isPause" && child._start < prevTime) {
        return child;
      }

      child = child._prev;
    }
  }
},
    _setDuration = function _setDuration(animation, duration, skipUncache, leavePlayhead) {
  var repeat = animation._repeat,
      dur = _round(duration) || 0,
      totalProgress = animation._tTime / animation._tDur;
  totalProgress && !leavePlayhead && (animation._time *= dur / animation._dur);
  animation._dur = dur;
  animation._tDur = !repeat ? dur : repeat < 0 ? 1e10 : _round(dur * (repeat + 1) + animation._rDelay * repeat);
  totalProgress && !leavePlayhead ? _alignPlayhead(animation, animation._tTime = animation._tDur * totalProgress) : animation.parent && _setEnd(animation);
  skipUncache || _uncache(animation.parent, animation);
  return animation;
},
    _onUpdateTotalDuration = function _onUpdateTotalDuration(animation) {
  return animation instanceof Timeline ? _uncache(animation) : _setDuration(animation, animation._dur);
},
    _zeroPosition = {
  _start: 0,
  endTime: _emptyFunc
},
    _parsePosition = function _parsePosition(animation, position) {
  var labels = animation.labels,
      recent = animation._recent || _zeroPosition,
      clippedDuration = animation.duration() >= _bigNum ? recent.endTime(false) : animation._dur,
      //in case there's a child that infinitely repeats, users almost never intend for the insertion point of a new child to be based on a SUPER long value like that so we clip it and assume the most recently-added child's endTime should be used instead.
  i,
      offset;

  if (_isString(position) && (isNaN(position) || position in labels)) {
    //if the string is a number like "1", check to see if there's a label with that name, otherwise interpret it as a number (absolute value).
    i = position.charAt(0);

    if (i === "<" || i === ">") {
      return (i === "<" ? recent._start : recent.endTime(recent._repeat >= 0)) + (parseFloat(position.substr(1)) || 0);
    }

    i = position.indexOf("=");

    if (i < 0) {
      position in labels || (labels[position] = clippedDuration);
      return labels[position];
    }

    offset = +(position.charAt(i - 1) + position.substr(i + 1));
    return i > 1 ? _parsePosition(animation, position.substr(0, i - 1)) + offset : clippedDuration + offset;
  }

  return position == null ? clippedDuration : +position;
},
    _conditionalReturn = function _conditionalReturn(value, func) {
  return value || value === 0 ? func(value) : func;
},
    _clamp = function _clamp(min, max, value) {
  return value < min ? min : value > max ? max : value;
},
    getUnit = function getUnit(value) {
  if (typeof value !== "string") {
    return "";
  }

  var v = _unitExp.exec(value);

  return v ? value.substr(v.index + v[0].length) : "";
},
    // note: protect against padded numbers as strings, like "100.100". That shouldn't return "00" as the unit. If it's numeric, return no unit.
clamp = function clamp(min, max, value) {
  return _conditionalReturn(value, function (v) {
    return _clamp(min, max, v);
  });
},
    _slice = [].slice,
    _isArrayLike = function _isArrayLike(value, nonEmpty) {
  return value && _isObject(value) && "length" in value && (!nonEmpty && !value.length || value.length - 1 in value && _isObject(value[0])) && !value.nodeType && value !== _win;
},
    _flatten = function _flatten(ar, leaveStrings, accumulator) {
  if (accumulator === void 0) {
    accumulator = [];
  }

  return ar.forEach(function (value) {
    var _accumulator;

    return _isString(value) && !leaveStrings || _isArrayLike(value, 1) ? (_accumulator = accumulator).push.apply(_accumulator, toArray(value)) : accumulator.push(value);
  }) || accumulator;
},
    //takes any value and returns an array. If it's a string (and leaveStrings isn't true), it'll use document.querySelectorAll() and convert that to an array. It'll also accept iterables like jQuery objects.
toArray = function toArray(value, leaveStrings) {
  return _isString(value) && !leaveStrings && (_coreInitted || !_wake()) ? _slice.call(_doc.querySelectorAll(value), 0) : _isArray(value) ? _flatten(value, leaveStrings) : _isArrayLike(value) ? _slice.call(value, 0) : value ? [value] : [];
},
    shuffle = function shuffle(a) {
  return a.sort(function () {
    return .5 - Math.random();
  });
},
    // alternative that's a bit faster and more reliably diverse but bigger:   for (let j, v, i = a.length; i; j = Math.floor(Math.random() * i), v = a[--i], a[i] = a[j], a[j] = v); return a;
//for distributing values across an array. Can accept a number, a function or (most commonly) a function which can contain the following properties: {base, amount, from, ease, grid, axis, length, each}. Returns a function that expects the following parameters: index, target, array. Recognizes the following
distribute = function distribute(v) {
  if (_isFunction(v)) {
    return v;
  }

  var vars = _isObject(v) ? v : {
    each: v
  },
      //n:1 is just to indicate v was a number; we leverage that later to set v according to the length we get. If a number is passed in, we treat it like the old stagger value where 0.1, for example, would mean that things would be distributed with 0.1 between each element in the array rather than a total "amount" that's chunked out among them all.
  ease = _parseEase(vars.ease),
      from = vars.from || 0,
      base = parseFloat(vars.base) || 0,
      cache = {},
      isDecimal = from > 0 && from < 1,
      ratios = isNaN(from) || isDecimal,
      axis = vars.axis,
      ratioX = from,
      ratioY = from;

  if (_isString(from)) {
    ratioX = ratioY = {
      center: .5,
      edges: .5,
      end: 1
    }[from] || 0;
  } else if (!isDecimal && ratios) {
    ratioX = from[0];
    ratioY = from[1];
  }

  return function (i, target, a) {
    var l = (a || vars).length,
        distances = cache[l],
        originX,
        originY,
        x,
        y,
        d,
        j,
        max,
        min,
        wrapAt;

    if (!distances) {
      wrapAt = vars.grid === "auto" ? 0 : (vars.grid || [1, _bigNum])[1];

      if (!wrapAt) {
        max = -_bigNum;

        while (max < (max = a[wrapAt++].getBoundingClientRect().left) && wrapAt < l) {}

        wrapAt--;
      }

      distances = cache[l] = [];
      originX = ratios ? Math.min(wrapAt, l) * ratioX - .5 : from % wrapAt;
      originY = ratios ? l * ratioY / wrapAt - .5 : from / wrapAt | 0;
      max = 0;
      min = _bigNum;

      for (j = 0; j < l; j++) {
        x = j % wrapAt - originX;
        y = originY - (j / wrapAt | 0);
        distances[j] = d = !axis ? _sqrt(x * x + y * y) : Math.abs(axis === "y" ? y : x);
        d > max && (max = d);
        d < min && (min = d);
      }

      from === "random" && shuffle(distances);
      distances.max = max - min;
      distances.min = min;
      distances.v = l = (parseFloat(vars.amount) || parseFloat(vars.each) * (wrapAt > l ? l - 1 : !axis ? Math.max(wrapAt, l / wrapAt) : axis === "y" ? l / wrapAt : wrapAt) || 0) * (from === "edges" ? -1 : 1);
      distances.b = l < 0 ? base - l : base;
      distances.u = getUnit(vars.amount || vars.each) || 0; //unit

      ease = ease && l < 0 ? _invertEase(ease) : ease;
    }

    l = (distances[i] - distances.min) / distances.max || 0;
    return _round(distances.b + (ease ? ease(l) : l) * distances.v) + distances.u; //round in order to work around floating point errors
  };
},
    _roundModifier = function _roundModifier(v) {
  //pass in 0.1 get a function that'll round to the nearest tenth, or 5 to round to the closest 5, or 0.001 to the closest 1000th, etc.
  var p = v < 1 ? Math.pow(10, (v + "").length - 2) : 1; //to avoid floating point math errors (like 24 * 0.1 == 2.4000000000000004), we chop off at a specific number of decimal places (much faster than toFixed()

  return function (raw) {
    var n = Math.round(parseFloat(raw) / v) * v * p;
    return (n - n % 1) / p + (_isNumber(raw) ? 0 : getUnit(raw)); // n - n % 1 replaces Math.floor() in order to handle negative values properly. For example, Math.floor(-150.00000000000003) is 151!
  };
},
    snap = function snap(snapTo, value) {
  var isArray = _isArray(snapTo),
      radius,
      is2D;

  if (!isArray && _isObject(snapTo)) {
    radius = isArray = snapTo.radius || _bigNum;

    if (snapTo.values) {
      snapTo = toArray(snapTo.values);

      if (is2D = !_isNumber(snapTo[0])) {
        radius *= radius; //performance optimization so we don't have to Math.sqrt() in the loop.
      }
    } else {
      snapTo = _roundModifier(snapTo.increment);
    }
  }

  return _conditionalReturn(value, !isArray ? _roundModifier(snapTo) : _isFunction(snapTo) ? function (raw) {
    is2D = snapTo(raw);
    return Math.abs(is2D - raw) <= radius ? is2D : raw;
  } : function (raw) {
    var x = parseFloat(is2D ? raw.x : raw),
        y = parseFloat(is2D ? raw.y : 0),
        min = _bigNum,
        closest = 0,
        i = snapTo.length,
        dx,
        dy;

    while (i--) {
      if (is2D) {
        dx = snapTo[i].x - x;
        dy = snapTo[i].y - y;
        dx = dx * dx + dy * dy;
      } else {
        dx = Math.abs(snapTo[i] - x);
      }

      if (dx < min) {
        min = dx;
        closest = i;
      }
    }

    closest = !radius || min <= radius ? snapTo[closest] : raw;
    return is2D || closest === raw || _isNumber(raw) ? closest : closest + getUnit(raw);
  });
},
    random = function random(min, max, roundingIncrement, returnFunction) {
  return _conditionalReturn(_isArray(min) ? !max : roundingIncrement === true ? !!(roundingIncrement = 0) : !returnFunction, function () {
    return _isArray(min) ? min[~~(Math.random() * min.length)] : (roundingIncrement = roundingIncrement || 1e-5) && (returnFunction = roundingIncrement < 1 ? Math.pow(10, (roundingIncrement + "").length - 2) : 1) && Math.floor(Math.round((min - roundingIncrement / 2 + Math.random() * (max - min + roundingIncrement * .99)) / roundingIncrement) * roundingIncrement * returnFunction) / returnFunction;
  });
},
    pipe = function pipe() {
  for (var _len = arguments.length, functions = new Array(_len), _key = 0; _key < _len; _key++) {
    functions[_key] = arguments[_key];
  }

  return function (value) {
    return functions.reduce(function (v, f) {
      return f(v);
    }, value);
  };
},
    unitize = function unitize(func, unit) {
  return function (value) {
    return func(parseFloat(value)) + (unit || getUnit(value));
  };
},
    normalize = function normalize(min, max, value) {
  return mapRange(min, max, 0, 1, value);
},
    _wrapArray = function _wrapArray(a, wrapper, value) {
  return _conditionalReturn(value, function (index) {
    return a[~~wrapper(index)];
  });
},
    wrap = function wrap(min, max, value) {
  // NOTE: wrap() CANNOT be an arrow function! A very odd compiling bug causes problems (unrelated to GSAP).
  var range = max - min;
  return _isArray(min) ? _wrapArray(min, wrap(0, min.length), max) : _conditionalReturn(value, function (value) {
    return (range + (value - min) % range) % range + min;
  });
},
    wrapYoyo = function wrapYoyo(min, max, value) {
  var range = max - min,
      total = range * 2;
  return _isArray(min) ? _wrapArray(min, wrapYoyo(0, min.length - 1), max) : _conditionalReturn(value, function (value) {
    value = (total + (value - min) % total) % total || 0;
    return min + (value > range ? total - value : value);
  });
},
    _replaceRandom = function _replaceRandom(value) {
  //replaces all occurrences of random(...) in a string with the calculated random value. can be a range like random(-100, 100, 5) or an array like random([0, 100, 500])
  var prev = 0,
      s = "",
      i,
      nums,
      end,
      isArray;

  while (~(i = value.indexOf("random(", prev))) {
    end = value.indexOf(")", i);
    isArray = value.charAt(i + 7) === "[";
    nums = value.substr(i + 7, end - i - 7).match(isArray ? _delimitedValueExp : _strictNumExp);
    s += value.substr(prev, i - prev) + random(isArray ? nums : +nums[0], isArray ? 0 : +nums[1], +nums[2] || 1e-5);
    prev = end + 1;
  }

  return s + value.substr(prev, value.length - prev);
},
    mapRange = function mapRange(inMin, inMax, outMin, outMax, value) {
  var inRange = inMax - inMin,
      outRange = outMax - outMin;
  return _conditionalReturn(value, function (value) {
    return outMin + ((value - inMin) / inRange * outRange || 0);
  });
},
    interpolate = function interpolate(start, end, progress, mutate) {
  var func = isNaN(start + end) ? 0 : function (p) {
    return (1 - p) * start + p * end;
  };

  if (!func) {
    var isString = _isString(start),
        master = {},
        p,
        i,
        interpolators,
        l,
        il;

    progress === true && (mutate = 1) && (progress = null);

    if (isString) {
      start = {
        p: start
      };
      end = {
        p: end
      };
    } else if (_isArray(start) && !_isArray(end)) {
      interpolators = [];
      l = start.length;
      il = l - 2;

      for (i = 1; i < l; i++) {
        interpolators.push(interpolate(start[i - 1], start[i])); //build the interpolators up front as a performance optimization so that when the function is called many times, it can just reuse them.
      }

      l--;

      func = function func(p) {
        p *= l;
        var i = Math.min(il, ~~p);
        return interpolators[i](p - i);
      };

      progress = end;
    } else if (!mutate) {
      start = _merge(_isArray(start) ? [] : {}, start);
    }

    if (!interpolators) {
      for (p in end) {
        _addPropTween.call(master, start, p, "get", end[p]);
      }

      func = function func(p) {
        return _renderPropTweens(p, master) || (isString ? start.p : start);
      };
    }
  }

  return _conditionalReturn(progress, func);
},
    _getLabelInDirection = function _getLabelInDirection(timeline, fromTime, backward) {
  //used for nextLabel() and previousLabel()
  var labels = timeline.labels,
      min = _bigNum,
      p,
      distance,
      label;

  for (p in labels) {
    distance = labels[p] - fromTime;

    if (distance < 0 === !!backward && distance && min > (distance = Math.abs(distance))) {
      label = p;
      min = distance;
    }
  }

  return label;
},
    _callback = function _callback(animation, type, executeLazyFirst) {
  var v = animation.vars,
      callback = v[type],
      params,
      scope;

  if (!callback) {
    return;
  }

  params = v[type + "Params"];
  scope = v.callbackScope || animation;
  executeLazyFirst && _lazyTweens.length && _lazyRender(); //in case rendering caused any tweens to lazy-init, we should render them because typically when a timeline finishes, users expect things to have rendered fully. Imagine an onUpdate on a timeline that reports/checks tweened values.

  return params ? callback.apply(scope, params) : callback.call(scope);
},
    _interrupt = function _interrupt(animation) {
  _removeFromParent(animation);

  animation.scrollTrigger && animation.scrollTrigger.kill(false);
  animation.progress() < 1 && _callback(animation, "onInterrupt");
  return animation;
},
    _quickTween,
    _createPlugin = function _createPlugin(config) {
  config = !config.name && config["default"] || config; //UMD packaging wraps things oddly, so for example MotionPathHelper becomes {MotionPathHelper:MotionPathHelper, default:MotionPathHelper}.

  var name = config.name,
      isFunc = _isFunction(config),
      Plugin = name && !isFunc && config.init ? function () {
    this._props = [];
  } : config,
      //in case someone passes in an object that's not a plugin, like CustomEase
  instanceDefaults = {
    init: _emptyFunc,
    render: _renderPropTweens,
    add: _addPropTween,
    kill: _killPropTweensOf,
    modifier: _addPluginModifier,
    rawVars: 0
  },
      statics = {
    targetTest: 0,
    get: 0,
    getSetter: _getSetter,
    aliases: {},
    register: 0
  };

  _wake();

  if (config !== Plugin) {
    if (_plugins[name]) {
      return;
    }

    _setDefaults(Plugin, _setDefaults(_copyExcluding(config, instanceDefaults), statics)); //static methods


    _merge(Plugin.prototype, _merge(instanceDefaults, _copyExcluding(config, statics))); //instance methods


    _plugins[Plugin.prop = name] = Plugin;

    if (config.targetTest) {
      _harnessPlugins.push(Plugin);

      _reservedProps[name] = 1;
    }

    name = (name === "css" ? "CSS" : name.charAt(0).toUpperCase() + name.substr(1)) + "Plugin"; //for the global name. "motionPath" should become MotionPathPlugin
  }

  _addGlobal(name, Plugin);

  config.register && config.register(gsap, Plugin, PropTween);
},

/*
 * --------------------------------------------------------------------------------------
 * COLORS
 * --------------------------------------------------------------------------------------
 */
_255 = 255,
    _colorLookup = {
  aqua: [0, _255, _255],
  lime: [0, _255, 0],
  silver: [192, 192, 192],
  black: [0, 0, 0],
  maroon: [128, 0, 0],
  teal: [0, 128, 128],
  blue: [0, 0, _255],
  navy: [0, 0, 128],
  white: [_255, _255, _255],
  olive: [128, 128, 0],
  yellow: [_255, _255, 0],
  orange: [_255, 165, 0],
  gray: [128, 128, 128],
  purple: [128, 0, 128],
  green: [0, 128, 0],
  red: [_255, 0, 0],
  pink: [_255, 192, 203],
  cyan: [0, _255, _255],
  transparent: [_255, _255, _255, 0]
},
    _hue = function _hue(h, m1, m2) {
  h = h < 0 ? h + 1 : h > 1 ? h - 1 : h;
  return (h * 6 < 1 ? m1 + (m2 - m1) * h * 6 : h < .5 ? m2 : h * 3 < 2 ? m1 + (m2 - m1) * (2 / 3 - h) * 6 : m1) * _255 + .5 | 0;
},
    splitColor = function splitColor(v, toHSL, forceAlpha) {
  var a = !v ? _colorLookup.black : _isNumber(v) ? [v >> 16, v >> 8 & _255, v & _255] : 0,
      r,
      g,
      b,
      h,
      s,
      l,
      max,
      min,
      d,
      wasHSL;

  if (!a) {
    if (v.substr(-1) === ",") {
      //sometimes a trailing comma is included and we should chop it off (typically from a comma-delimited list of values like a textShadow:"2px 2px 2px blue, 5px 5px 5px rgb(255,0,0)" - in this example "blue," has a trailing comma. We could strip it out inside parseComplex() but we'd need to do it to the beginning and ending values plus it wouldn't provide protection from other potential scenarios like if the user passes in a similar value.
      v = v.substr(0, v.length - 1);
    }

    if (_colorLookup[v]) {
      a = _colorLookup[v];
    } else if (v.charAt(0) === "#") {
      if (v.length < 6) {
        //for shorthand like #9F0 or #9F0F (could have alpha)
        r = v.charAt(1);
        g = v.charAt(2);
        b = v.charAt(3);
        v = "#" + r + r + g + g + b + b + (v.length === 5 ? v.charAt(4) + v.charAt(4) : "");
      }

      if (v.length === 9) {
        // hex with alpha, like #fd5e53ff
        a = parseInt(v.substr(1, 6), 16);
        return [a >> 16, a >> 8 & _255, a & _255, parseInt(v.substr(7), 16) / 255];
      }

      v = parseInt(v.substr(1), 16);
      a = [v >> 16, v >> 8 & _255, v & _255];
    } else if (v.substr(0, 3) === "hsl") {
      a = wasHSL = v.match(_strictNumExp);

      if (!toHSL) {
        h = +a[0] % 360 / 360;
        s = +a[1] / 100;
        l = +a[2] / 100;
        g = l <= .5 ? l * (s + 1) : l + s - l * s;
        r = l * 2 - g;
        a.length > 3 && (a[3] *= 1); //cast as number

        a[0] = _hue(h + 1 / 3, r, g);
        a[1] = _hue(h, r, g);
        a[2] = _hue(h - 1 / 3, r, g);
      } else if (~v.indexOf("=")) {
        //if relative values are found, just return the raw strings with the relative prefixes in place.
        a = v.match(_numExp);
        forceAlpha && a.length < 4 && (a[3] = 1);
        return a;
      }
    } else {
      a = v.match(_strictNumExp) || _colorLookup.transparent;
    }

    a = a.map(Number);
  }

  if (toHSL && !wasHSL) {
    r = a[0] / _255;
    g = a[1] / _255;
    b = a[2] / _255;
    max = Math.max(r, g, b);
    min = Math.min(r, g, b);
    l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
      h *= 60;
    }

    a[0] = ~~(h + .5);
    a[1] = ~~(s * 100 + .5);
    a[2] = ~~(l * 100 + .5);
  }

  forceAlpha && a.length < 4 && (a[3] = 1);
  return a;
},
    _colorOrderData = function _colorOrderData(v) {
  // strips out the colors from the string, finds all the numeric slots (with units) and returns an array of those. The Array also has a "c" property which is an Array of the index values where the colors belong. This is to help work around issues where there's a mis-matched order of color/numeric data like drop-shadow(#f00 0px 1px 2px) and drop-shadow(0x 1px 2px #f00). This is basically a helper function used in _formatColors()
  var values = [],
      c = [],
      i = -1;
  v.split(_colorExp).forEach(function (v) {
    var a = v.match(_numWithUnitExp) || [];
    values.push.apply(values, a);
    c.push(i += a.length + 1);
  });
  values.c = c;
  return values;
},
    _formatColors = function _formatColors(s, toHSL, orderMatchData) {
  var result = "",
      colors = (s + result).match(_colorExp),
      type = toHSL ? "hsla(" : "rgba(",
      i = 0,
      c,
      shell,
      d,
      l;

  if (!colors) {
    return s;
  }

  colors = colors.map(function (color) {
    return (color = splitColor(color, toHSL, 1)) && type + (toHSL ? color[0] + "," + color[1] + "%," + color[2] + "%," + color[3] : color.join(",")) + ")";
  });

  if (orderMatchData) {
    d = _colorOrderData(s);
    c = orderMatchData.c;

    if (c.join(result) !== d.c.join(result)) {
      shell = s.replace(_colorExp, "1").split(_numWithUnitExp);
      l = shell.length - 1;

      for (; i < l; i++) {
        result += shell[i] + (~c.indexOf(i) ? colors.shift() || type + "0,0,0,0)" : (d.length ? d : colors.length ? colors : orderMatchData).shift());
      }
    }
  }

  if (!shell) {
    shell = s.split(_colorExp);
    l = shell.length - 1;

    for (; i < l; i++) {
      result += shell[i] + colors[i];
    }
  }

  return result + shell[l];
},
    _colorExp = function () {
  var s = "(?:\\b(?:(?:rgb|rgba|hsl|hsla)\\(.+?\\))|\\B#(?:[0-9a-f]{3,4}){1,2}\\b",
      //we'll dynamically build this Regular Expression to conserve file size. After building it, it will be able to find rgb(), rgba(), # (hexadecimal), and named color values like red, blue, purple, etc.,
  p;

  for (p in _colorLookup) {
    s += "|" + p + "\\b";
  }

  return new RegExp(s + ")", "gi");
}(),
    _hslExp = /hsl[a]?\(/,
    _colorStringFilter = function _colorStringFilter(a) {
  var combined = a.join(" "),
      toHSL;
  _colorExp.lastIndex = 0;

  if (_colorExp.test(combined)) {
    toHSL = _hslExp.test(combined);
    a[1] = _formatColors(a[1], toHSL);
    a[0] = _formatColors(a[0], toHSL, _colorOrderData(a[1])); // make sure the order of numbers/colors match with the END value.

    return true;
  }
},

/*
 * --------------------------------------------------------------------------------------
 * TICKER
 * --------------------------------------------------------------------------------------
 */
_tickerActive,
    _ticker = function () {
  var _getTime = Date.now,
      _lagThreshold = 500,
      _adjustedLag = 33,
      _startTime = _getTime(),
      _lastUpdate = _startTime,
      _gap = 1000 / 240,
      _nextTime = _gap,
      _listeners = [],
      _id,
      _req,
      _raf,
      _self,
      _delta,
      _i,
      _tick = function _tick(v) {
    var elapsed = _getTime() - _lastUpdate,
        manual = v === true,
        overlap,
        dispatch,
        time,
        frame;

    elapsed > _lagThreshold && (_startTime += elapsed - _adjustedLag);
    _lastUpdate += elapsed;
    time = _lastUpdate - _startTime;
    overlap = time - _nextTime;

    if (overlap > 0 || manual) {
      frame = ++_self.frame;
      _delta = time - _self.time * 1000;
      _self.time = time = time / 1000;
      _nextTime += overlap + (overlap >= _gap ? 4 : _gap - overlap);
      dispatch = 1;
    }

    manual || (_id = _req(_tick)); //make sure the request is made before we dispatch the "tick" event so that timing is maintained. Otherwise, if processing the "tick" requires a bunch of time (like 15ms) and we're using a setTimeout() that's based on 16.7ms, it'd technically take 31.7ms between frames otherwise.

    if (dispatch) {
      for (_i = 0; _i < _listeners.length; _i++) {
        // use _i and check _listeners.length instead of a variable because a listener could get removed during the loop, and if that happens to an element less than the current index, it'd throw things off in the loop.
        _listeners[_i](time, _delta, frame, v);
      }
    }
  };

  _self = {
    time: 0,
    frame: 0,
    tick: function tick() {
      _tick(true);
    },
    deltaRatio: function deltaRatio(fps) {
      return _delta / (1000 / (fps || 60));
    },
    wake: function wake() {
      if (_coreReady) {
        if (!_coreInitted && _windowExists()) {
          _win = _coreInitted = window;
          _doc = _win.document || {};
          _globals.gsap = gsap;
          (_win.gsapVersions || (_win.gsapVersions = [])).push(gsap.version);

          _install(_installScope || _win.GreenSockGlobals || !_win.gsap && _win || {});

          _raf = _win.requestAnimationFrame;
        }

        _id && _self.sleep();

        _req = _raf || function (f) {
          return setTimeout(f, _nextTime - _self.time * 1000 + 1 | 0);
        };

        _tickerActive = 1;

        _tick(2);
      }
    },
    sleep: function sleep() {
      (_raf ? _win.cancelAnimationFrame : clearTimeout)(_id);
      _tickerActive = 0;
      _req = _emptyFunc;
    },
    lagSmoothing: function lagSmoothing(threshold, adjustedLag) {
      _lagThreshold = threshold || 1 / _tinyNum; //zero should be interpreted as basically unlimited

      _adjustedLag = Math.min(adjustedLag, _lagThreshold, 0);
    },
    fps: function fps(_fps) {
      _gap = 1000 / (_fps || 240);
      _nextTime = _self.time * 1000 + _gap;
    },
    add: function add(callback) {
      _listeners.indexOf(callback) < 0 && _listeners.push(callback);

      _wake();
    },
    remove: function remove(callback) {
      var i;
      ~(i = _listeners.indexOf(callback)) && _listeners.splice(i, 1) && _i >= i && _i--;
    },
    _listeners: _listeners
  };
  return _self;
}(),
    _wake = function _wake() {
  return !_tickerActive && _ticker.wake();
},
    //also ensures the core classes are initialized.

/*
* -------------------------------------------------
* EASING
* -------------------------------------------------
*/
_easeMap = {},
    _customEaseExp = /^[\d.\-M][\d.\-,\s]/,
    _quotesExp = /["']/g,
    _parseObjectInString = function _parseObjectInString(value) {
  //takes a string like "{wiggles:10, type:anticipate})" and turns it into a real object. Notice it ends in ")" and includes the {} wrappers. This is because we only use this function for parsing ease configs and prioritized optimization rather than reusability.
  var obj = {},
      split = value.substr(1, value.length - 3).split(":"),
      key = split[0],
      i = 1,
      l = split.length,
      index,
      val,
      parsedVal;

  for (; i < l; i++) {
    val = split[i];
    index = i !== l - 1 ? val.lastIndexOf(",") : val.length;
    parsedVal = val.substr(0, index);
    obj[key] = isNaN(parsedVal) ? parsedVal.replace(_quotesExp, "").trim() : +parsedVal;
    key = val.substr(index + 1).trim();
  }

  return obj;
},
    _valueInParentheses = function _valueInParentheses(value) {
  var open = value.indexOf("(") + 1,
      close = value.indexOf(")"),
      nested = value.indexOf("(", open);
  return value.substring(open, ~nested && nested < close ? value.indexOf(")", close + 1) : close);
},
    _configEaseFromString = function _configEaseFromString(name) {
  //name can be a string like "elastic.out(1,0.5)", and pass in _easeMap as obj and it'll parse it out and call the actual function like _easeMap.Elastic.easeOut.config(1,0.5). It will also parse custom ease strings as long as CustomEase is loaded and registered (internally as _easeMap._CE).
  var split = (name + "").split("("),
      ease = _easeMap[split[0]];
  return ease && split.length > 1 && ease.config ? ease.config.apply(null, ~name.indexOf("{") ? [_parseObjectInString(split[1])] : _valueInParentheses(name).split(",").map(_numericIfPossible)) : _easeMap._CE && _customEaseExp.test(name) ? _easeMap._CE("", name) : ease;
},
    _invertEase = function _invertEase(ease) {
  return function (p) {
    return 1 - ease(1 - p);
  };
},
    // allow yoyoEase to be set in children and have those affected when the parent/ancestor timeline yoyos.
_propagateYoyoEase = function _propagateYoyoEase(timeline, isYoyo) {
  var child = timeline._first,
      ease;

  while (child) {
    if (child instanceof Timeline) {
      _propagateYoyoEase(child, isYoyo);
    } else if (child.vars.yoyoEase && (!child._yoyo || !child._repeat) && child._yoyo !== isYoyo) {
      if (child.timeline) {
        _propagateYoyoEase(child.timeline, isYoyo);
      } else {
        ease = child._ease;
        child._ease = child._yEase;
        child._yEase = ease;
        child._yoyo = isYoyo;
      }
    }

    child = child._next;
  }
},
    _parseEase = function _parseEase(ease, defaultEase) {
  return !ease ? defaultEase : (_isFunction(ease) ? ease : _easeMap[ease] || _configEaseFromString(ease)) || defaultEase;
},
    _insertEase = function _insertEase(names, easeIn, easeOut, easeInOut) {
  if (easeOut === void 0) {
    easeOut = function easeOut(p) {
      return 1 - easeIn(1 - p);
    };
  }

  if (easeInOut === void 0) {
    easeInOut = function easeInOut(p) {
      return p < .5 ? easeIn(p * 2) / 2 : 1 - easeIn((1 - p) * 2) / 2;
    };
  }

  var ease = {
    easeIn: easeIn,
    easeOut: easeOut,
    easeInOut: easeInOut
  },
      lowercaseName;

  _forEachName(names, function (name) {
    _easeMap[name] = _globals[name] = ease;
    _easeMap[lowercaseName = name.toLowerCase()] = easeOut;

    for (var p in ease) {
      _easeMap[lowercaseName + (p === "easeIn" ? ".in" : p === "easeOut" ? ".out" : ".inOut")] = _easeMap[name + "." + p] = ease[p];
    }
  });

  return ease;
},
    _easeInOutFromOut = function _easeInOutFromOut(easeOut) {
  return function (p) {
    return p < .5 ? (1 - easeOut(1 - p * 2)) / 2 : .5 + easeOut((p - .5) * 2) / 2;
  };
},
    _configElastic = function _configElastic(type, amplitude, period) {
  var p1 = amplitude >= 1 ? amplitude : 1,
      //note: if amplitude is < 1, we simply adjust the period for a more natural feel. Otherwise the math doesn't work right and the curve starts at 1.
  p2 = (period || (type ? .3 : .45)) / (amplitude < 1 ? amplitude : 1),
      p3 = p2 / _2PI * (Math.asin(1 / p1) || 0),
      easeOut = function easeOut(p) {
    return p === 1 ? 1 : p1 * Math.pow(2, -10 * p) * _sin((p - p3) * p2) + 1;
  },
      ease = type === "out" ? easeOut : type === "in" ? function (p) {
    return 1 - easeOut(1 - p);
  } : _easeInOutFromOut(easeOut);

  p2 = _2PI / p2; //precalculate to optimize

  ease.config = function (amplitude, period) {
    return _configElastic(type, amplitude, period);
  };

  return ease;
},
    _configBack = function _configBack(type, overshoot) {
  if (overshoot === void 0) {
    overshoot = 1.70158;
  }

  var easeOut = function easeOut(p) {
    return p ? --p * p * ((overshoot + 1) * p + overshoot) + 1 : 0;
  },
      ease = type === "out" ? easeOut : type === "in" ? function (p) {
    return 1 - easeOut(1 - p);
  } : _easeInOutFromOut(easeOut);

  ease.config = function (overshoot) {
    return _configBack(type, overshoot);
  };

  return ease;
}; // a cheaper (kb and cpu) but more mild way to get a parameterized weighted ease by feeding in a value between -1 (easeIn) and 1 (easeOut) where 0 is linear.
// _weightedEase = ratio => {
// 	let y = 0.5 + ratio / 2;
// 	return p => (2 * (1 - p) * p * y + p * p);
// },
// a stronger (but more expensive kb/cpu) parameterized weighted ease that lets you feed in a value between -1 (easeIn) and 1 (easeOut) where 0 is linear.
// _weightedEaseStrong = ratio => {
// 	ratio = .5 + ratio / 2;
// 	let o = 1 / 3 * (ratio < .5 ? ratio : 1 - ratio),
// 		b = ratio - o,
// 		c = ratio + o;
// 	return p => p === 1 ? p : 3 * b * (1 - p) * (1 - p) * p + 3 * c * (1 - p) * p * p + p * p * p;
// };


_forEachName("Linear,Quad,Cubic,Quart,Quint,Strong", function (name, i) {
  var power = i < 5 ? i + 1 : i;

  _insertEase(name + ",Power" + (power - 1), i ? function (p) {
    return Math.pow(p, power);
  } : function (p) {
    return p;
  }, function (p) {
    return 1 - Math.pow(1 - p, power);
  }, function (p) {
    return p < .5 ? Math.pow(p * 2, power) / 2 : 1 - Math.pow((1 - p) * 2, power) / 2;
  });
});

_easeMap.Linear.easeNone = _easeMap.none = _easeMap.Linear.easeIn;

_insertEase("Elastic", _configElastic("in"), _configElastic("out"), _configElastic());

(function (n, c) {
  var n1 = 1 / c,
      n2 = 2 * n1,
      n3 = 2.5 * n1,
      easeOut = function easeOut(p) {
    return p < n1 ? n * p * p : p < n2 ? n * Math.pow(p - 1.5 / c, 2) + .75 : p < n3 ? n * (p -= 2.25 / c) * p + .9375 : n * Math.pow(p - 2.625 / c, 2) + .984375;
  };

  _insertEase("Bounce", function (p) {
    return 1 - easeOut(1 - p);
  }, easeOut);
})(7.5625, 2.75);

_insertEase("Expo", function (p) {
  return p ? Math.pow(2, 10 * (p - 1)) : 0;
});

_insertEase("Circ", function (p) {
  return -(_sqrt(1 - p * p) - 1);
});

_insertEase("Sine", function (p) {
  return p === 1 ? 1 : -_cos(p * _HALF_PI) + 1;
});

_insertEase("Back", _configBack("in"), _configBack("out"), _configBack());

_easeMap.SteppedEase = _easeMap.steps = _globals.SteppedEase = {
  config: function config(steps, immediateStart) {
    if (steps === void 0) {
      steps = 1;
    }

    var p1 = 1 / steps,
        p2 = steps + (immediateStart ? 0 : 1),
        p3 = immediateStart ? 1 : 0,
        max = 1 - _tinyNum;
    return function (p) {
      return ((p2 * _clamp(0, max, p) | 0) + p3) * p1;
    };
  }
};
_defaults.ease = _easeMap["quad.out"];

_forEachName("onComplete,onUpdate,onStart,onRepeat,onReverseComplete,onInterrupt", function (name) {
  return _callbackNames += name + "," + name + "Params,";
});
/*
 * --------------------------------------------------------------------------------------
 * CACHE
 * --------------------------------------------------------------------------------------
 */


var GSCache = function GSCache(target, harness) {
  this.id = _gsID++;
  target._gsap = this;
  this.target = target;
  this.harness = harness;
  this.get = harness ? harness.get : _getProperty;
  this.set = harness ? harness.getSetter : _getSetter;
};
/*
 * --------------------------------------------------------------------------------------
 * ANIMATION
 * --------------------------------------------------------------------------------------
 */

var Animation = /*#__PURE__*/function () {
  function Animation(vars, time) {
    var parent = vars.parent || _globalTimeline;
    this.vars = vars;
    this._delay = +vars.delay || 0;

    if (this._repeat = vars.repeat === Infinity ? -2 : vars.repeat || 0) {
      // TODO: repeat: Infinity on a timeline's children must flag that timeline internally and affect its totalDuration, otherwise it'll stop in the negative direction when reaching the start.
      this._rDelay = vars.repeatDelay || 0;
      this._yoyo = !!vars.yoyo || !!vars.yoyoEase;
    }

    this._ts = 1;

    _setDuration(this, +vars.duration, 1, 1);

    this.data = vars.data;
    _tickerActive || _ticker.wake();
    parent && _addToTimeline(parent, this, time || time === 0 ? time : parent._time, 1);
    vars.reversed && this.reverse();
    vars.paused && this.paused(true);
  }

  var _proto = Animation.prototype;

  _proto.delay = function delay(value) {
    if (value || value === 0) {
      this.parent && this.parent.smoothChildTiming && this.startTime(this._start + value - this._delay);
      this._delay = value;
      return this;
    }

    return this._delay;
  };

  _proto.duration = function duration(value) {
    return arguments.length ? this.totalDuration(this._repeat > 0 ? value + (value + this._rDelay) * this._repeat : value) : this.totalDuration() && this._dur;
  };

  _proto.totalDuration = function totalDuration(value) {
    if (!arguments.length) {
      return this._tDur;
    }

    this._dirty = 0;
    return _setDuration(this, this._repeat < 0 ? value : (value - this._repeat * this._rDelay) / (this._repeat + 1));
  };

  _proto.totalTime = function totalTime(_totalTime, suppressEvents) {
    _wake();

    if (!arguments.length) {
      return this._tTime;
    }

    var parent = this._dp;

    if (parent && parent.smoothChildTiming && this._ts) {
      _alignPlayhead(this, _totalTime);

      !parent._dp || parent.parent || _postAddChecks(parent, this); // edge case: if this is a child of a timeline that already completed, for example, we must re-activate the parent.
      //in case any of the ancestor timelines had completed but should now be enabled, we should reset their totalTime() which will also ensure that they're lined up properly and enabled. Skip for animations that are on the root (wasteful). Example: a TimelineLite.exportRoot() is performed when there's a paused tween on the root, the export will not complete until that tween is unpaused, but imagine a child gets restarted later, after all [unpaused] tweens have completed. The start of that child would get pushed out, but one of the ancestors may have completed.

      while (parent.parent) {
        if (parent.parent._time !== parent._start + (parent._ts >= 0 ? parent._tTime / parent._ts : (parent.totalDuration() - parent._tTime) / -parent._ts)) {
          parent.totalTime(parent._tTime, true);
        }

        parent = parent.parent;
      }

      if (!this.parent && this._dp.autoRemoveChildren && (this._ts > 0 && _totalTime < this._tDur || this._ts < 0 && _totalTime > 0 || !this._tDur && !_totalTime)) {
        //if the animation doesn't have a parent, put it back into its last parent (recorded as _dp for exactly cases like this). Limit to parents with autoRemoveChildren (like globalTimeline) so that if the user manually removes an animation from a timeline and then alters its playhead, it doesn't get added back in.
        _addToTimeline(this._dp, this, this._start - this._delay);
      }
    }

    if (this._tTime !== _totalTime || !this._dur && !suppressEvents || this._initted && Math.abs(this._zTime) === _tinyNum || !_totalTime && !this._initted && (this.add || this._ptLookup)) {
      // check for _ptLookup on a Tween instance to ensure it has actually finished being instantiated, otherwise if this.reverse() gets called in the Animation constructor, it could trigger a render() here even though the _targets weren't populated, thus when _init() is called there won't be any PropTweens (it'll act like the tween is non-functional)
      this._ts || (this._pTime = _totalTime); // otherwise, if an animation is paused, then the playhead is moved back to zero, then resumed, it'd revert back to the original time at the pause
      //if (!this._lock) { // avoid endless recursion (not sure we need this yet or if it's worth the performance hit)
      //   this._lock = 1;

      _lazySafeRender(this, _totalTime, suppressEvents); //   this._lock = 0;
      //}

    }

    return this;
  };

  _proto.time = function time(value, suppressEvents) {
    return arguments.length ? this.totalTime(Math.min(this.totalDuration(), value + _elapsedCycleDuration(this)) % this._dur || (value ? this._dur : 0), suppressEvents) : this._time; // note: if the modulus results in 0, the playhead could be exactly at the end or the beginning, and we always defer to the END with a non-zero value, otherwise if you set the time() to the very end (duration()), it would render at the START!
  };

  _proto.totalProgress = function totalProgress(value, suppressEvents) {
    return arguments.length ? this.totalTime(this.totalDuration() * value, suppressEvents) : this.totalDuration() ? Math.min(1, this._tTime / this._tDur) : this.ratio;
  };

  _proto.progress = function progress(value, suppressEvents) {
    return arguments.length ? this.totalTime(this.duration() * (this._yoyo && !(this.iteration() & 1) ? 1 - value : value) + _elapsedCycleDuration(this), suppressEvents) : this.duration() ? Math.min(1, this._time / this._dur) : this.ratio;
  };

  _proto.iteration = function iteration(value, suppressEvents) {
    var cycleDuration = this.duration() + this._rDelay;

    return arguments.length ? this.totalTime(this._time + (value - 1) * cycleDuration, suppressEvents) : this._repeat ? _animationCycle(this._tTime, cycleDuration) + 1 : 1;
  } // potential future addition:
  // isPlayingBackwards() {
  // 	let animation = this,
  // 		orientation = 1; // 1 = forward, -1 = backward
  // 	while (animation) {
  // 		orientation *= animation.reversed() || (animation.repeat() && !(animation.iteration() & 1)) ? -1 : 1;
  // 		animation = animation.parent;
  // 	}
  // 	return orientation < 0;
  // }
  ;

  _proto.timeScale = function timeScale(value) {
    if (!arguments.length) {
      return this._rts === -_tinyNum ? 0 : this._rts; // recorded timeScale. Special case: if someone calls reverse() on an animation with timeScale of 0, we assign it -_tinyNum to remember it's reversed.
    }

    if (this._rts === value) {
      return this;
    }

    var tTime = this.parent && this._ts ? _parentToChildTotalTime(this.parent._time, this) : this._tTime; // make sure to do the parentToChildTotalTime() BEFORE setting the new _ts because the old one must be used in that calculation.
    // prioritize rendering where the parent's playhead lines up instead of this._tTime because there could be a tween that's animating another tween's timeScale in the same rendering loop (same parent), thus if the timeScale tween renders first, it would alter _start BEFORE _tTime was set on that tick (in the rendering loop), effectively freezing it until the timeScale tween finishes.

    this._rts = +value || 0;
    this._ts = this._ps || value === -_tinyNum ? 0 : this._rts; // _ts is the functional timeScale which would be 0 if the animation is paused.

    return _recacheAncestors(this.totalTime(_clamp(-this._delay, this._tDur, tTime), true));
  };

  _proto.paused = function paused(value) {
    if (!arguments.length) {
      return this._ps;
    }

    if (this._ps !== value) {
      this._ps = value;

      if (value) {
        this._pTime = this._tTime || Math.max(-this._delay, this.rawTime()); // if the pause occurs during the delay phase, make sure that's factored in when resuming.

        this._ts = this._act = 0; // _ts is the functional timeScale, so a paused tween would effectively have a timeScale of 0. We record the "real" timeScale as _rts (recorded time scale)
      } else {
        _wake();

        this._ts = this._rts; //only defer to _pTime (pauseTime) if tTime is zero. Remember, someone could pause() an animation, then scrub the playhead and resume(). If the parent doesn't have smoothChildTiming, we render at the rawTime() because the startTime won't get updated.

        this.totalTime(this.parent && !this.parent.smoothChildTiming ? this.rawTime() : this._tTime || this._pTime, this.progress() === 1 && (this._tTime -= _tinyNum) && Math.abs(this._zTime) !== _tinyNum); // edge case: animation.progress(1).pause().play() wouldn't render again because the playhead is already at the end, but the call to totalTime() below will add it back to its parent...and not remove it again (since removing only happens upon rendering at a new time). Offsetting the _tTime slightly is done simply to cause the final render in totalTime() that'll pop it off its timeline (if autoRemoveChildren is true, of course). Check to make sure _zTime isn't -_tinyNum to avoid an edge case where the playhead is pushed to the end but INSIDE a tween/callback, the timeline itself is paused thus halting rendering and leaving a few unrendered. When resuming, it wouldn't render those otherwise.
      }
    }

    return this;
  };

  _proto.startTime = function startTime(value) {
    if (arguments.length) {
      this._start = value;
      var parent = this.parent || this._dp;
      parent && (parent._sort || !this.parent) && _addToTimeline(parent, this, value - this._delay);
      return this;
    }

    return this._start;
  };

  _proto.endTime = function endTime(includeRepeats) {
    return this._start + (_isNotFalse(includeRepeats) ? this.totalDuration() : this.duration()) / Math.abs(this._ts);
  };

  _proto.rawTime = function rawTime(wrapRepeats) {
    var parent = this.parent || this._dp; // _dp = detatched parent

    return !parent ? this._tTime : wrapRepeats && (!this._ts || this._repeat && this._time && this.totalProgress() < 1) ? this._tTime % (this._dur + this._rDelay) : !this._ts ? this._tTime : _parentToChildTotalTime(parent.rawTime(wrapRepeats), this);
  };

  _proto.globalTime = function globalTime(rawTime) {
    var animation = this,
        time = arguments.length ? rawTime : animation.rawTime();

    while (animation) {
      time = animation._start + time / (animation._ts || 1);
      animation = animation._dp;
    }

    return time;
  };

  _proto.repeat = function repeat(value) {
    if (arguments.length) {
      this._repeat = value === Infinity ? -2 : value;
      return _onUpdateTotalDuration(this);
    }

    return this._repeat === -2 ? Infinity : this._repeat;
  };

  _proto.repeatDelay = function repeatDelay(value) {
    if (arguments.length) {
      this._rDelay = value;
      return _onUpdateTotalDuration(this);
    }

    return this._rDelay;
  };

  _proto.yoyo = function yoyo(value) {
    if (arguments.length) {
      this._yoyo = value;
      return this;
    }

    return this._yoyo;
  };

  _proto.seek = function seek(position, suppressEvents) {
    return this.totalTime(_parsePosition(this, position), _isNotFalse(suppressEvents));
  };

  _proto.restart = function restart(includeDelay, suppressEvents) {
    return this.play().totalTime(includeDelay ? -this._delay : 0, _isNotFalse(suppressEvents));
  };

  _proto.play = function play(from, suppressEvents) {
    from != null && this.seek(from, suppressEvents);
    return this.reversed(false).paused(false);
  };

  _proto.reverse = function reverse(from, suppressEvents) {
    from != null && this.seek(from || this.totalDuration(), suppressEvents);
    return this.reversed(true).paused(false);
  };

  _proto.pause = function pause(atTime, suppressEvents) {
    atTime != null && this.seek(atTime, suppressEvents);
    return this.paused(true);
  };

  _proto.resume = function resume() {
    return this.paused(false);
  };

  _proto.reversed = function reversed(value) {
    if (arguments.length) {
      !!value !== this.reversed() && this.timeScale(-this._rts || (value ? -_tinyNum : 0)); // in case timeScale is zero, reversing would have no effect so we use _tinyNum.

      return this;
    }

    return this._rts < 0;
  };

  _proto.invalidate = function invalidate() {
    this._initted = this._act = 0;
    this._zTime = -_tinyNum;
    return this;
  };

  _proto.isActive = function isActive() {
    var parent = this.parent || this._dp,
        start = this._start,
        rawTime;
    return !!(!parent || this._ts && this._initted && parent.isActive() && (rawTime = parent.rawTime(true)) >= start && rawTime < this.endTime(true) - _tinyNum);
  };

  _proto.eventCallback = function eventCallback(type, callback, params) {
    var vars = this.vars;

    if (arguments.length > 1) {
      if (!callback) {
        delete vars[type];
      } else {
        vars[type] = callback;
        params && (vars[type + "Params"] = params);
        type === "onUpdate" && (this._onUpdate = callback);
      }

      return this;
    }

    return vars[type];
  };

  _proto.then = function then(onFulfilled) {
    var self = this;
    return new Promise(function (resolve) {
      var f = _isFunction(onFulfilled) ? onFulfilled : _passThrough,
          _resolve = function _resolve() {
        var _then = self.then;
        self.then = null; // temporarily null the then() method to avoid an infinite loop (see https://github.com/greensock/GSAP/issues/322)

        _isFunction(f) && (f = f(self)) && (f.then || f === self) && (self.then = _then);
        resolve(f);
        self.then = _then;
      };

      if (self._initted && self.totalProgress() === 1 && self._ts >= 0 || !self._tTime && self._ts < 0) {
        _resolve();
      } else {
        self._prom = _resolve;
      }
    });
  };

  _proto.kill = function kill() {
    _interrupt(this);
  };

  return Animation;
}();

_setDefaults(Animation.prototype, {
  _time: 0,
  _start: 0,
  _end: 0,
  _tTime: 0,
  _tDur: 0,
  _dirty: 0,
  _repeat: 0,
  _yoyo: false,
  parent: null,
  _initted: false,
  _rDelay: 0,
  _ts: 1,
  _dp: 0,
  ratio: 0,
  _zTime: -_tinyNum,
  _prom: 0,
  _ps: false,
  _rts: 1
});
/*
 * -------------------------------------------------
 * TIMELINE
 * -------------------------------------------------
 */


var Timeline = /*#__PURE__*/function (_Animation) {
  _inheritsLoose(Timeline, _Animation);

  function Timeline(vars, time) {
    var _this;

    if (vars === void 0) {
      vars = {};
    }

    _this = _Animation.call(this, vars, time) || this;
    _this.labels = {};
    _this.smoothChildTiming = !!vars.smoothChildTiming;
    _this.autoRemoveChildren = !!vars.autoRemoveChildren;
    _this._sort = _isNotFalse(vars.sortChildren);
    _this.parent && _postAddChecks(_this.parent, _assertThisInitialized(_this));
    vars.scrollTrigger && _scrollTrigger(_assertThisInitialized(_this), vars.scrollTrigger);
    return _this;
  }

  var _proto2 = Timeline.prototype;

  _proto2.to = function to(targets, vars, position) {
    new Tween(targets, _parseVars(arguments, 0, this), _parsePosition(this, _isNumber(vars) ? arguments[3] : position));
    return this;
  };

  _proto2.from = function from(targets, vars, position) {
    new Tween(targets, _parseVars(arguments, 1, this), _parsePosition(this, _isNumber(vars) ? arguments[3] : position));
    return this;
  };

  _proto2.fromTo = function fromTo(targets, fromVars, toVars, position) {
    new Tween(targets, _parseVars(arguments, 2, this), _parsePosition(this, _isNumber(fromVars) ? arguments[4] : position));
    return this;
  };

  _proto2.set = function set(targets, vars, position) {
    vars.duration = 0;
    vars.parent = this;
    _inheritDefaults(vars).repeatDelay || (vars.repeat = 0);
    vars.immediateRender = !!vars.immediateRender;
    new Tween(targets, vars, _parsePosition(this, position), 1);
    return this;
  };

  _proto2.call = function call(callback, params, position) {
    return _addToTimeline(this, Tween.delayedCall(0, callback, params), _parsePosition(this, position));
  } //ONLY for backward compatibility! Maybe delete?
  ;

  _proto2.staggerTo = function staggerTo(targets, duration, vars, stagger, position, onCompleteAll, onCompleteAllParams) {
    vars.duration = duration;
    vars.stagger = vars.stagger || stagger;
    vars.onComplete = onCompleteAll;
    vars.onCompleteParams = onCompleteAllParams;
    vars.parent = this;
    new Tween(targets, vars, _parsePosition(this, position));
    return this;
  };

  _proto2.staggerFrom = function staggerFrom(targets, duration, vars, stagger, position, onCompleteAll, onCompleteAllParams) {
    vars.runBackwards = 1;
    _inheritDefaults(vars).immediateRender = _isNotFalse(vars.immediateRender);
    return this.staggerTo(targets, duration, vars, stagger, position, onCompleteAll, onCompleteAllParams);
  };

  _proto2.staggerFromTo = function staggerFromTo(targets, duration, fromVars, toVars, stagger, position, onCompleteAll, onCompleteAllParams) {
    toVars.startAt = fromVars;
    _inheritDefaults(toVars).immediateRender = _isNotFalse(toVars.immediateRender);
    return this.staggerTo(targets, duration, toVars, stagger, position, onCompleteAll, onCompleteAllParams);
  };

  _proto2.render = function render(totalTime, suppressEvents, force) {
    var prevTime = this._time,
        tDur = this._dirty ? this.totalDuration() : this._tDur,
        dur = this._dur,
        tTime = this !== _globalTimeline && totalTime > tDur - _tinyNum && totalTime >= 0 ? tDur : totalTime < _tinyNum ? 0 : totalTime,
        crossingStart = this._zTime < 0 !== totalTime < 0 && (this._initted || !dur),
        time,
        child,
        next,
        iteration,
        cycleDuration,
        prevPaused,
        pauseTween,
        timeScale,
        prevStart,
        prevIteration,
        yoyo,
        isYoyo;

    if (tTime !== this._tTime || force || crossingStart) {
      if (prevTime !== this._time && dur) {
        //if totalDuration() finds a child with a negative startTime and smoothChildTiming is true, things get shifted around internally so we need to adjust the time accordingly. For example, if a tween starts at -30 we must shift EVERYTHING forward 30 seconds and move this timeline's startTime backward by 30 seconds so that things align with the playhead (no jump).
        tTime += this._time - prevTime;
        totalTime += this._time - prevTime;
      }

      time = tTime;
      prevStart = this._start;
      timeScale = this._ts;
      prevPaused = !timeScale;

      if (crossingStart) {
        dur || (prevTime = this._zTime); //when the playhead arrives at EXACTLY time 0 (right on top) of a zero-duration timeline, we need to discern if events are suppressed so that when the playhead moves again (next time), it'll trigger the callback. If events are NOT suppressed, obviously the callback would be triggered in this render. Basically, the callback should fire either when the playhead ARRIVES or LEAVES this exact spot, not both. Imagine doing a timeline.seek(0) and there's a callback that sits at 0. Since events are suppressed on that seek() by default, nothing will fire, but when the playhead moves off of that position, the callback should fire. This behavior is what people intuitively expect.

        (totalTime || !suppressEvents) && (this._zTime = totalTime);
      }

      if (this._repeat) {
        //adjust the time for repeats and yoyos
        yoyo = this._yoyo;
        cycleDuration = dur + this._rDelay;

        if (this._repeat < -1 && totalTime < 0) {
          return this.totalTime(cycleDuration * 100 + totalTime, suppressEvents, force);
        }

        time = _round(tTime % cycleDuration); //round to avoid floating point errors. (4 % 0.8 should be 0 but some browsers report it as 0.79999999!)

        if (tTime === tDur) {
          // the tDur === tTime is for edge cases where there's a lengthy decimal on the duration and it may reach the very end but the time is rendered as not-quite-there (remember, tDur is rounded to 4 decimals whereas dur isn't)
          iteration = this._repeat;
          time = dur;
        } else {
          iteration = ~~(tTime / cycleDuration);

          if (iteration && iteration === tTime / cycleDuration) {
            time = dur;
            iteration--;
          }

          time > dur && (time = dur);
        }

        prevIteration = _animationCycle(this._tTime, cycleDuration);
        !prevTime && this._tTime && prevIteration !== iteration && (prevIteration = iteration); // edge case - if someone does addPause() at the very beginning of a repeating timeline, that pause is technically at the same spot as the end which causes this._time to get set to 0 when the totalTime would normally place the playhead at the end. See https://greensock.com/forums/topic/23823-closing-nav-animation-not-working-on-ie-and-iphone-6-maybe-other-older-browser/?tab=comments#comment-113005

        if (yoyo && iteration & 1) {
          time = dur - time;
          isYoyo = 1;
        }
        /*
        make sure children at the end/beginning of the timeline are rendered properly. If, for example,
        a 3-second long timeline rendered at 2.9 seconds previously, and now renders at 3.2 seconds (which
        would get translated to 2.8 seconds if the timeline yoyos or 0.2 seconds if it just repeats), there
        could be a callback or a short tween that's at 2.95 or 3 seconds in which wouldn't render. So
        we need to push the timeline to the end (and/or beginning depending on its yoyo value). Also we must
        ensure that zero-duration tweens at the very beginning or end of the Timeline work.
        */


        if (iteration !== prevIteration && !this._lock) {
          var rewinding = yoyo && prevIteration & 1,
              doesWrap = rewinding === (yoyo && iteration & 1);
          iteration < prevIteration && (rewinding = !rewinding);
          prevTime = rewinding ? 0 : dur;
          this._lock = 1;
          this.render(prevTime || (isYoyo ? 0 : _round(iteration * cycleDuration)), suppressEvents, !dur)._lock = 0;
          !suppressEvents && this.parent && _callback(this, "onRepeat");
          this.vars.repeatRefresh && !isYoyo && (this.invalidate()._lock = 1);

          if (prevTime && prevTime !== this._time || prevPaused !== !this._ts || this.vars.onRepeat && !this.parent && !this._act) {
            // if prevTime is 0 and we render at the very end, _time will be the end, thus won't match. So in this edge case, prevTime won't match _time but that's okay. If it gets killed in the onRepeat, eject as well.
            return this;
          }

          dur = this._dur; // in case the duration changed in the onRepeat

          tDur = this._tDur;

          if (doesWrap) {
            this._lock = 2;
            prevTime = rewinding ? dur : -0.0001;
            this.render(prevTime, true);
          }

          this._lock = 0;

          if (!this._ts && !prevPaused) {
            return this;
          } //in order for yoyoEase to work properly when there's a stagger, we must swap out the ease in each sub-tween.


          _propagateYoyoEase(this, isYoyo);
        }
      }

      if (this._hasPause && !this._forcing && this._lock < 2) {
        pauseTween = _findNextPauseTween(this, _round(prevTime), _round(time));

        if (pauseTween) {
          tTime -= time - (time = pauseTween._start);
        }
      }

      this._tTime = tTime;
      this._time = time;
      this._act = !timeScale; //as long as it's not paused, force it to be active so that if the user renders independent of the parent timeline, it'll be forced to re-render on the next tick.

      if (!this._initted) {
        this._onUpdate = this.vars.onUpdate;
        this._initted = 1;
        this._zTime = totalTime;
        prevTime = 0; // upon init, the playhead should always go forward; someone could invalidate() a completed timeline and then if they restart(), that would make child tweens render in reverse order which could lock in the wrong starting values if they build on each other, like tl.to(obj, {x: 100}).to(obj, {x: 0}).
      }

      !prevTime && time && !suppressEvents && _callback(this, "onStart");

      if (time >= prevTime && totalTime >= 0) {
        child = this._first;

        while (child) {
          next = child._next;

          if ((child._act || time >= child._start) && child._ts && pauseTween !== child) {
            if (child.parent !== this) {
              // an extreme edge case - the child's render could do something like kill() the "next" one in the linked list, or reparent it. In that case we must re-initiate the whole render to be safe.
              return this.render(totalTime, suppressEvents, force);
            }

            child.render(child._ts > 0 ? (time - child._start) * child._ts : (child._dirty ? child.totalDuration() : child._tDur) + (time - child._start) * child._ts, suppressEvents, force);

            if (time !== this._time || !this._ts && !prevPaused) {
              //in case a tween pauses or seeks the timeline when rendering, like inside of an onUpdate/onComplete
              pauseTween = 0;
              next && (tTime += this._zTime = -_tinyNum); // it didn't finish rendering, so flag zTime as negative so that so that the next time render() is called it'll be forced (to render any remaining children)

              break;
            }
          }

          child = next;
        }
      } else {
        child = this._last;
        var adjustedTime = totalTime < 0 ? totalTime : time; //when the playhead goes backward beyond the start of this timeline, we must pass that information down to the child animations so that zero-duration tweens know whether to render their starting or ending values.

        while (child) {
          next = child._prev;

          if ((child._act || adjustedTime <= child._end) && child._ts && pauseTween !== child) {
            if (child.parent !== this) {
              // an extreme edge case - the child's render could do something like kill() the "next" one in the linked list, or reparent it. In that case we must re-initiate the whole render to be safe.
              return this.render(totalTime, suppressEvents, force);
            }

            child.render(child._ts > 0 ? (adjustedTime - child._start) * child._ts : (child._dirty ? child.totalDuration() : child._tDur) + (adjustedTime - child._start) * child._ts, suppressEvents, force);

            if (time !== this._time || !this._ts && !prevPaused) {
              //in case a tween pauses or seeks the timeline when rendering, like inside of an onUpdate/onComplete
              pauseTween = 0;
              next && (tTime += this._zTime = adjustedTime ? -_tinyNum : _tinyNum); // it didn't finish rendering, so adjust zTime so that so that the next time render() is called it'll be forced (to render any remaining children)

              break;
            }
          }

          child = next;
        }
      }

      if (pauseTween && !suppressEvents) {
        this.pause();
        pauseTween.render(time >= prevTime ? 0 : -_tinyNum)._zTime = time >= prevTime ? 1 : -1;

        if (this._ts) {
          //the callback resumed playback! So since we may have held back the playhead due to where the pause is positioned, go ahead and jump to where it's SUPPOSED to be (if no pause happened).
          this._start = prevStart; //if the pause was at an earlier time and the user resumed in the callback, it could reposition the timeline (changing its startTime), throwing things off slightly, so we make sure the _start doesn't shift.

          _setEnd(this);

          return this.render(totalTime, suppressEvents, force);
        }
      }

      this._onUpdate && !suppressEvents && _callback(this, "onUpdate", true);
      if (tTime === tDur && tDur >= this.totalDuration() || !tTime && prevTime) if (prevStart === this._start || Math.abs(timeScale) !== Math.abs(this._ts)) if (!this._lock) {
        (totalTime || !dur) && (tTime === tDur && this._ts > 0 || !tTime && this._ts < 0) && _removeFromParent(this, 1); // don't remove if the timeline is reversed and the playhead isn't at 0, otherwise tl.progress(1).reverse() won't work. Only remove if the playhead is at the end and timeScale is positive, or if the playhead is at 0 and the timeScale is negative.

        if (!suppressEvents && !(totalTime < 0 && !prevTime) && (tTime || prevTime)) {
          _callback(this, tTime === tDur ? "onComplete" : "onReverseComplete", true);

          this._prom && !(tTime < tDur && this.timeScale() > 0) && this._prom();
        }
      }
    }

    return this;
  };

  _proto2.add = function add(child, position) {
    var _this2 = this;

    _isNumber(position) || (position = _parsePosition(this, position));

    if (!(child instanceof Animation)) {
      if (_isArray(child)) {
        child.forEach(function (obj) {
          return _this2.add(obj, position);
        });
        return this;
      }

      if (_isString(child)) {
        return this.addLabel(child, position);
      }

      if (_isFunction(child)) {
        child = Tween.delayedCall(0, child);
      } else {
        return this;
      }
    }

    return this !== child ? _addToTimeline(this, child, position) : this; //don't allow a timeline to be added to itself as a child!
  };

  _proto2.getChildren = function getChildren(nested, tweens, timelines, ignoreBeforeTime) {
    if (nested === void 0) {
      nested = true;
    }

    if (tweens === void 0) {
      tweens = true;
    }

    if (timelines === void 0) {
      timelines = true;
    }

    if (ignoreBeforeTime === void 0) {
      ignoreBeforeTime = -_bigNum;
    }

    var a = [],
        child = this._first;

    while (child) {
      if (child._start >= ignoreBeforeTime) {
        if (child instanceof Tween) {
          tweens && a.push(child);
        } else {
          timelines && a.push(child);
          nested && a.push.apply(a, child.getChildren(true, tweens, timelines));
        }
      }

      child = child._next;
    }

    return a;
  };

  _proto2.getById = function getById(id) {
    var animations = this.getChildren(1, 1, 1),
        i = animations.length;

    while (i--) {
      if (animations[i].vars.id === id) {
        return animations[i];
      }
    }
  };

  _proto2.remove = function remove(child) {
    if (_isString(child)) {
      return this.removeLabel(child);
    }

    if (_isFunction(child)) {
      return this.killTweensOf(child);
    }

    _removeLinkedListItem(this, child);

    if (child === this._recent) {
      this._recent = this._last;
    }

    return _uncache(this);
  };

  _proto2.totalTime = function totalTime(_totalTime2, suppressEvents) {
    if (!arguments.length) {
      return this._tTime;
    }

    this._forcing = 1;

    if (!this._dp && this._ts) {
      //special case for the global timeline (or any other that has no parent or detached parent).
      this._start = _round(_ticker.time - (this._ts > 0 ? _totalTime2 / this._ts : (this.totalDuration() - _totalTime2) / -this._ts));
    }

    _Animation.prototype.totalTime.call(this, _totalTime2, suppressEvents);

    this._forcing = 0;
    return this;
  };

  _proto2.addLabel = function addLabel(label, position) {
    this.labels[label] = _parsePosition(this, position);
    return this;
  };

  _proto2.removeLabel = function removeLabel(label) {
    delete this.labels[label];
    return this;
  };

  _proto2.addPause = function addPause(position, callback, params) {
    var t = Tween.delayedCall(0, callback || _emptyFunc, params);
    t.data = "isPause";
    this._hasPause = 1;
    return _addToTimeline(this, t, _parsePosition(this, position));
  };

  _proto2.removePause = function removePause(position) {
    var child = this._first;
    position = _parsePosition(this, position);

    while (child) {
      if (child._start === position && child.data === "isPause") {
        _removeFromParent(child);
      }

      child = child._next;
    }
  };

  _proto2.killTweensOf = function killTweensOf(targets, props, onlyActive) {
    var tweens = this.getTweensOf(targets, onlyActive),
        i = tweens.length;

    while (i--) {
      _overwritingTween !== tweens[i] && tweens[i].kill(targets, props);
    }

    return this;
  };

  _proto2.getTweensOf = function getTweensOf(targets, onlyActive) {
    var a = [],
        parsedTargets = toArray(targets),
        child = this._first,
        isGlobalTime = _isNumber(onlyActive),
        // a number is interpreted as a global time. If the animation spans
    children;

    while (child) {
      if (child instanceof Tween) {
        if (_arrayContainsAny(child._targets, parsedTargets) && (isGlobalTime ? (!_overwritingTween || child._initted && child._ts) && child.globalTime(0) <= onlyActive && child.globalTime(child.totalDuration()) > onlyActive : !onlyActive || child.isActive())) {
          // note: if this is for overwriting, it should only be for tweens that aren't paused and are initted.
          a.push(child);
        }
      } else if ((children = child.getTweensOf(parsedTargets, onlyActive)).length) {
        a.push.apply(a, children);
      }

      child = child._next;
    }

    return a;
  } // potential future feature - targets() on timelines
  // targets() {
  // 	let result = [];
  // 	this.getChildren(true, true, false).forEach(t => result.push(...t.targets()));
  // 	return result;
  // }
  ;

  _proto2.tweenTo = function tweenTo(position, vars) {
    vars = vars || {};

    var tl = this,
        endTime = _parsePosition(tl, position),
        _vars = vars,
        startAt = _vars.startAt,
        _onStart = _vars.onStart,
        onStartParams = _vars.onStartParams,
        immediateRender = _vars.immediateRender,
        tween = Tween.to(tl, _setDefaults({
      ease: vars.ease || "none",
      lazy: false,
      immediateRender: false,
      time: endTime,
      overwrite: "auto",
      duration: vars.duration || Math.abs((endTime - (startAt && "time" in startAt ? startAt.time : tl._time)) / tl.timeScale()) || _tinyNum,
      onStart: function onStart() {
        tl.pause();
        var duration = vars.duration || Math.abs((endTime - tl._time) / tl.timeScale());
        tween._dur !== duration && _setDuration(tween, duration, 0, 1).render(tween._time, true, true);
        _onStart && _onStart.apply(tween, onStartParams || []); //in case the user had an onStart in the vars - we don't want to overwrite it.
      }
    }, vars));

    return immediateRender ? tween.render(0) : tween;
  };

  _proto2.tweenFromTo = function tweenFromTo(fromPosition, toPosition, vars) {
    return this.tweenTo(toPosition, _setDefaults({
      startAt: {
        time: _parsePosition(this, fromPosition)
      }
    }, vars));
  };

  _proto2.recent = function recent() {
    return this._recent;
  };

  _proto2.nextLabel = function nextLabel(afterTime) {
    if (afterTime === void 0) {
      afterTime = this._time;
    }

    return _getLabelInDirection(this, _parsePosition(this, afterTime));
  };

  _proto2.previousLabel = function previousLabel(beforeTime) {
    if (beforeTime === void 0) {
      beforeTime = this._time;
    }

    return _getLabelInDirection(this, _parsePosition(this, beforeTime), 1);
  };

  _proto2.currentLabel = function currentLabel(value) {
    return arguments.length ? this.seek(value, true) : this.previousLabel(this._time + _tinyNum);
  };

  _proto2.shiftChildren = function shiftChildren(amount, adjustLabels, ignoreBeforeTime) {
    if (ignoreBeforeTime === void 0) {
      ignoreBeforeTime = 0;
    }

    var child = this._first,
        labels = this.labels,
        p;

    while (child) {
      if (child._start >= ignoreBeforeTime) {
        child._start += amount;
        child._end += amount;
      }

      child = child._next;
    }

    if (adjustLabels) {
      for (p in labels) {
        if (labels[p] >= ignoreBeforeTime) {
          labels[p] += amount;
        }
      }
    }

    return _uncache(this);
  };

  _proto2.invalidate = function invalidate() {
    var child = this._first;
    this._lock = 0;

    while (child) {
      child.invalidate();
      child = child._next;
    }

    return _Animation.prototype.invalidate.call(this);
  };

  _proto2.clear = function clear(includeLabels) {
    if (includeLabels === void 0) {
      includeLabels = true;
    }

    var child = this._first,
        next;

    while (child) {
      next = child._next;
      this.remove(child);
      child = next;
    }

    this._dp && (this._time = this._tTime = this._pTime = 0);
    includeLabels && (this.labels = {});
    return _uncache(this);
  };

  _proto2.totalDuration = function totalDuration(value) {
    var max = 0,
        self = this,
        child = self._last,
        prevStart = _bigNum,
        prev,
        start,
        parent;

    if (arguments.length) {
      return self.timeScale((self._repeat < 0 ? self.duration() : self.totalDuration()) / (self.reversed() ? -value : value));
    }

    if (self._dirty) {
      parent = self.parent;

      while (child) {
        prev = child._prev; //record it here in case the tween changes position in the sequence...

        child._dirty && child.totalDuration(); //could change the tween._startTime, so make sure the animation's cache is clean before analyzing it.

        start = child._start;

        if (start > prevStart && self._sort && child._ts && !self._lock) {
          //in case one of the tweens shifted out of order, it needs to be re-inserted into the correct position in the sequence
          self._lock = 1; //prevent endless recursive calls - there are methods that get triggered that check duration/totalDuration when we add().

          _addToTimeline(self, child, start - child._delay, 1)._lock = 0;
        } else {
          prevStart = start;
        }

        if (start < 0 && child._ts) {
          //children aren't allowed to have negative startTimes unless smoothChildTiming is true, so adjust here if one is found.
          max -= start;

          if (!parent && !self._dp || parent && parent.smoothChildTiming) {
            self._start += start / self._ts;
            self._time -= start;
            self._tTime -= start;
          }

          self.shiftChildren(-start, false, -1e999);
          prevStart = 0;
        }

        child._end > max && child._ts && (max = child._end);
        child = prev;
      }

      _setDuration(self, self === _globalTimeline && self._time > max ? self._time : max, 1, 1);

      self._dirty = 0;
    }

    return self._tDur;
  };

  Timeline.updateRoot = function updateRoot(time) {
    if (_globalTimeline._ts) {
      _lazySafeRender(_globalTimeline, _parentToChildTotalTime(time, _globalTimeline));

      _lastRenderedFrame = _ticker.frame;
    }

    if (_ticker.frame >= _nextGCFrame) {
      _nextGCFrame += _config.autoSleep || 120;
      var child = _globalTimeline._first;
      if (!child || !child._ts) if (_config.autoSleep && _ticker._listeners.length < 2) {
        while (child && !child._ts) {
          child = child._next;
        }

        child || _ticker.sleep();
      }
    }
  };

  return Timeline;
}(Animation);

_setDefaults(Timeline.prototype, {
  _lock: 0,
  _hasPause: 0,
  _forcing: 0
});

var _addComplexStringPropTween = function _addComplexStringPropTween(target, prop, start, end, setter, stringFilter, funcParam) {
  //note: we call _addComplexStringPropTween.call(tweenInstance...) to ensure that it's scoped properly. We may call it from within a plugin too, thus "this" would refer to the plugin.
  var pt = new PropTween(this._pt, target, prop, 0, 1, _renderComplexString, null, setter),
      index = 0,
      matchIndex = 0,
      result,
      startNums,
      color,
      endNum,
      chunk,
      startNum,
      hasRandom,
      a;
  pt.b = start;
  pt.e = end;
  start += ""; //ensure values are strings

  end += "";

  if (hasRandom = ~end.indexOf("random(")) {
    end = _replaceRandom(end);
  }

  if (stringFilter) {
    a = [start, end];
    stringFilter(a, target, prop); //pass an array with the starting and ending values and let the filter do whatever it needs to the values.

    start = a[0];
    end = a[1];
  }

  startNums = start.match(_complexStringNumExp) || [];

  while (result = _complexStringNumExp.exec(end)) {
    endNum = result[0];
    chunk = end.substring(index, result.index);

    if (color) {
      color = (color + 1) % 5;
    } else if (chunk.substr(-5) === "rgba(") {
      color = 1;
    }

    if (endNum !== startNums[matchIndex++]) {
      startNum = parseFloat(startNums[matchIndex - 1]) || 0; //these nested PropTweens are handled in a special way - we'll never actually call a render or setter method on them. We'll just loop through them in the parent complex string PropTween's render method.

      pt._pt = {
        _next: pt._pt,
        p: chunk || matchIndex === 1 ? chunk : ",",
        //note: SVG spec allows omission of comma/space when a negative sign is wedged between two numbers, like 2.5-5.3 instead of 2.5,-5.3 but when tweening, the negative value may switch to positive, so we insert the comma just in case.
        s: startNum,
        c: endNum.charAt(1) === "=" ? parseFloat(endNum.substr(2)) * (endNum.charAt(0) === "-" ? -1 : 1) : parseFloat(endNum) - startNum,
        m: color && color < 4 ? Math.round : 0
      };
      index = _complexStringNumExp.lastIndex;
    }
  }

  pt.c = index < end.length ? end.substring(index, end.length) : ""; //we use the "c" of the PropTween to store the final part of the string (after the last number)

  pt.fp = funcParam;

  if (_relExp.test(end) || hasRandom) {
    pt.e = 0; //if the end string contains relative values or dynamic random(...) values, delete the end it so that on the final render we don't actually set it to the string with += or -= characters (forces it to use the calculated value).
  }

  this._pt = pt; //start the linked list with this new PropTween. Remember, we call _addComplexStringPropTween.call(tweenInstance...) to ensure that it's scoped properly. We may call it from within a plugin too, thus "this" would refer to the plugin.

  return pt;
},
    _addPropTween = function _addPropTween(target, prop, start, end, index, targets, modifier, stringFilter, funcParam) {
  _isFunction(end) && (end = end(index || 0, target, targets));
  var currentValue = target[prop],
      parsedStart = start !== "get" ? start : !_isFunction(currentValue) ? currentValue : funcParam ? target[prop.indexOf("set") || !_isFunction(target["get" + prop.substr(3)]) ? prop : "get" + prop.substr(3)](funcParam) : target[prop](),
      setter = !_isFunction(currentValue) ? _setterPlain : funcParam ? _setterFuncWithParam : _setterFunc,
      pt;

  if (_isString(end)) {
    if (~end.indexOf("random(")) {
      end = _replaceRandom(end);
    }

    if (end.charAt(1) === "=") {
      end = parseFloat(parsedStart) + parseFloat(end.substr(2)) * (end.charAt(0) === "-" ? -1 : 1) + (getUnit(parsedStart) || 0);
    }
  }

  if (parsedStart !== end) {
    if (!isNaN(parsedStart * end)) {
      pt = new PropTween(this._pt, target, prop, +parsedStart || 0, end - (parsedStart || 0), typeof currentValue === "boolean" ? _renderBoolean : _renderPlain, 0, setter);
      funcParam && (pt.fp = funcParam);
      modifier && pt.modifier(modifier, this, target);
      return this._pt = pt;
    }

    !currentValue && !(prop in target) && _missingPlugin(prop, end);
    return _addComplexStringPropTween.call(this, target, prop, parsedStart, end, setter, stringFilter || _config.stringFilter, funcParam);
  }
},
    //creates a copy of the vars object and processes any function-based values (putting the resulting values directly into the copy) as well as strings with "random()" in them. It does NOT process relative values.
_processVars = function _processVars(vars, index, target, targets, tween) {
  _isFunction(vars) && (vars = _parseFuncOrString(vars, tween, index, target, targets));

  if (!_isObject(vars) || vars.style && vars.nodeType || _isArray(vars) || _isTypedArray(vars)) {
    return _isString(vars) ? _parseFuncOrString(vars, tween, index, target, targets) : vars;
  }

  var copy = {},
      p;

  for (p in vars) {
    copy[p] = _parseFuncOrString(vars[p], tween, index, target, targets);
  }

  return copy;
},
    _checkPlugin = function _checkPlugin(property, vars, tween, index, target, targets) {
  var plugin, pt, ptLookup, i;

  if (_plugins[property] && (plugin = new _plugins[property]()).init(target, plugin.rawVars ? vars[property] : _processVars(vars[property], index, target, targets, tween), tween, index, targets) !== false) {
    tween._pt = pt = new PropTween(tween._pt, target, property, 0, 1, plugin.render, plugin, 0, plugin.priority);

    if (tween !== _quickTween) {
      ptLookup = tween._ptLookup[tween._targets.indexOf(target)]; //note: we can't use tween._ptLookup[index] because for staggered tweens, the index from the fullTargets array won't match what it is in each individual tween that spawns from the stagger.

      i = plugin._props.length;

      while (i--) {
        ptLookup[plugin._props[i]] = pt;
      }
    }
  }

  return plugin;
},
    _overwritingTween,
    //store a reference temporarily so we can avoid overwriting itself.
_initTween = function _initTween(tween, time) {
  var vars = tween.vars,
      ease = vars.ease,
      startAt = vars.startAt,
      immediateRender = vars.immediateRender,
      lazy = vars.lazy,
      onUpdate = vars.onUpdate,
      onUpdateParams = vars.onUpdateParams,
      callbackScope = vars.callbackScope,
      runBackwards = vars.runBackwards,
      yoyoEase = vars.yoyoEase,
      keyframes = vars.keyframes,
      autoRevert = vars.autoRevert,
      dur = tween._dur,
      prevStartAt = tween._startAt,
      targets = tween._targets,
      parent = tween.parent,
      fullTargets = parent && parent.data === "nested" ? parent.parent._targets : targets,
      autoOverwrite = tween._overwrite === "auto" && !_suppressOverwrites,
      tl = tween.timeline,
      cleanVars,
      i,
      p,
      pt,
      target,
      hasPriority,
      gsData,
      harness,
      plugin,
      ptLookup,
      index,
      harnessVars,
      overwritten;
  tl && (!keyframes || !ease) && (ease = "none");
  tween._ease = _parseEase(ease, _defaults.ease);
  tween._yEase = yoyoEase ? _invertEase(_parseEase(yoyoEase === true ? ease : yoyoEase, _defaults.ease)) : 0;

  if (yoyoEase && tween._yoyo && !tween._repeat) {
    //there must have been a parent timeline with yoyo:true that is currently in its yoyo phase, so flip the eases.
    yoyoEase = tween._yEase;
    tween._yEase = tween._ease;
    tween._ease = yoyoEase;
  }

  if (!tl) {
    //if there's an internal timeline, skip all the parsing because we passed that task down the chain.
    harness = targets[0] ? _getCache(targets[0]).harness : 0;
    harnessVars = harness && vars[harness.prop]; //someone may need to specify CSS-specific values AND non-CSS values, like if the element has an "x" property plus it's a standard DOM element. We allow people to distinguish by wrapping plugin-specific stuff in a css:{} object for example.

    cleanVars = _copyExcluding(vars, _reservedProps);
    prevStartAt && prevStartAt.render(-1, true).kill();

    if (startAt) {
      _removeFromParent(tween._startAt = Tween.set(targets, _setDefaults({
        data: "isStart",
        overwrite: false,
        parent: parent,
        immediateRender: true,
        lazy: _isNotFalse(lazy),
        startAt: null,
        delay: 0,
        onUpdate: onUpdate,
        onUpdateParams: onUpdateParams,
        callbackScope: callbackScope,
        stagger: 0
      }, startAt))); //copy the properties/values into a new object to avoid collisions, like var to = {x:0}, from = {x:500}; timeline.fromTo(e, from, to).fromTo(e, to, from);


      if (immediateRender) {
        if (time > 0) {
          autoRevert || (tween._startAt = 0); //tweens that render immediately (like most from() and fromTo() tweens) shouldn't revert when their parent timeline's playhead goes backward past the startTime because the initial render could have happened anytime and it shouldn't be directly correlated to this tween's startTime. Imagine setting up a complex animation where the beginning states of various objects are rendered immediately but the tween doesn't happen for quite some time - if we revert to the starting values as soon as the playhead goes backward past the tween's startTime, it will throw things off visually. Reversion should only happen in Timeline instances where immediateRender was false or when autoRevert is explicitly set to true.
        } else if (dur && !(time < 0 && prevStartAt)) {
          time && (tween._zTime = time);
          return; //we skip initialization here so that overwriting doesn't occur until the tween actually begins. Otherwise, if you create several immediateRender:true tweens of the same target/properties to drop into a Timeline, the last one created would overwrite the first ones because they didn't get placed into the timeline yet before the first render occurs and kicks in overwriting.
        }
      } else if (autoRevert === false) {
        tween._startAt = 0;
      }
    } else if (runBackwards && dur) {
      //from() tweens must be handled uniquely: their beginning values must be rendered but we don't want overwriting to occur yet (when time is still 0). Wait until the tween actually begins before doing all the routines like overwriting. At that time, we should render at the END of the tween to ensure that things initialize correctly (remember, from() tweens go backwards)
      if (prevStartAt) {
        !autoRevert && (tween._startAt = 0);
      } else {
        time && (immediateRender = false); //in rare cases (like if a from() tween runs and then is invalidate()-ed), immediateRender could be true but the initial forced-render gets skipped, so there's no need to force the render in this context when the _time is greater than 0

        p = _setDefaults({
          overwrite: false,
          data: "isFromStart",
          //we tag the tween with as "isFromStart" so that if [inside a plugin] we need to only do something at the very END of a tween, we have a way of identifying this tween as merely the one that's setting the beginning values for a "from()" tween. For example, clearProps in CSSPlugin should only get applied at the very END of a tween and without this tag, from(...{height:100, clearProps:"height", delay:1}) would wipe the height at the beginning of the tween and after 1 second, it'd kick back in.
          lazy: immediateRender && _isNotFalse(lazy),
          immediateRender: immediateRender,
          //zero-duration tweens render immediately by default, but if we're not specifically instructed to render this tween immediately, we should skip this and merely _init() to record the starting values (rendering them immediately would push them to completion which is wasteful in that case - we'd have to render(-1) immediately after)
          stagger: 0,
          parent: parent //ensures that nested tweens that had a stagger are handled properly, like gsap.from(".class", {y:gsap.utils.wrap([-100,100])})

        }, cleanVars);
        harnessVars && (p[harness.prop] = harnessVars); // in case someone does something like .from(..., {css:{}})

        _removeFromParent(tween._startAt = Tween.set(targets, p));

        if (!immediateRender) {
          _initTween(tween._startAt, _tinyNum); //ensures that the initial values are recorded

        } else if (!time) {
          return;
        }
      }
    }

    tween._pt = 0;
    lazy = dur && _isNotFalse(lazy) || lazy && !dur;

    for (i = 0; i < targets.length; i++) {
      target = targets[i];
      gsData = target._gsap || _harness(targets)[i]._gsap;
      tween._ptLookup[i] = ptLookup = {};
      _lazyLookup[gsData.id] && _lazyTweens.length && _lazyRender(); //if other tweens of the same target have recently initted but haven't rendered yet, we've got to force the render so that the starting values are correct (imagine populating a timeline with a bunch of sequential tweens and then jumping to the end)

      index = fullTargets === targets ? i : fullTargets.indexOf(target);

      if (harness && (plugin = new harness()).init(target, harnessVars || cleanVars, tween, index, fullTargets) !== false) {
        tween._pt = pt = new PropTween(tween._pt, target, plugin.name, 0, 1, plugin.render, plugin, 0, plugin.priority);

        plugin._props.forEach(function (name) {
          ptLookup[name] = pt;
        });

        plugin.priority && (hasPriority = 1);
      }

      if (!harness || harnessVars) {
        for (p in cleanVars) {
          if (_plugins[p] && (plugin = _checkPlugin(p, cleanVars, tween, index, target, fullTargets))) {
            plugin.priority && (hasPriority = 1);
          } else {
            ptLookup[p] = pt = _addPropTween.call(tween, target, p, "get", cleanVars[p], index, fullTargets, 0, vars.stringFilter);
          }
        }
      }

      tween._op && tween._op[i] && tween.kill(target, tween._op[i]);

      if (autoOverwrite && tween._pt) {
        _overwritingTween = tween;

        _globalTimeline.killTweensOf(target, ptLookup, tween.globalTime(0)); //Also make sure the overwriting doesn't overwrite THIS tween!!!


        overwritten = !tween.parent;
        _overwritingTween = 0;
      }

      tween._pt && lazy && (_lazyLookup[gsData.id] = 1);
    }

    hasPriority && _sortPropTweensByPriority(tween);
    tween._onInit && tween._onInit(tween); //plugins like RoundProps must wait until ALL of the PropTweens are instantiated. In the plugin's init() function, it sets the _onInit on the tween instance. May not be pretty/intuitive, but it's fast and keeps file size down.
  }

  tween._from = !tl && !!vars.runBackwards; //nested timelines should never run backwards - the backwards-ness is in the child tweens.

  tween._onUpdate = onUpdate;
  tween._initted = (!tween._op || tween._pt) && !overwritten; // if overwrittenProps resulted in the entire tween being killed, do NOT flag it as initted or else it may render for one tick.
},
    _addAliasesToVars = function _addAliasesToVars(targets, vars) {
  var harness = targets[0] ? _getCache(targets[0]).harness : 0,
      propertyAliases = harness && harness.aliases,
      copy,
      p,
      i,
      aliases;

  if (!propertyAliases) {
    return vars;
  }

  copy = _merge({}, vars);

  for (p in propertyAliases) {
    if (p in copy) {
      aliases = propertyAliases[p].split(",");
      i = aliases.length;

      while (i--) {
        copy[aliases[i]] = copy[p];
      }
    }
  }

  return copy;
},
    _parseFuncOrString = function _parseFuncOrString(value, tween, i, target, targets) {
  return _isFunction(value) ? value.call(tween, i, target, targets) : _isString(value) && ~value.indexOf("random(") ? _replaceRandom(value) : value;
},
    _staggerTweenProps = _callbackNames + "repeat,repeatDelay,yoyo,repeatRefresh,yoyoEase",
    _staggerPropsToSkip = (_staggerTweenProps + ",id,stagger,delay,duration,paused,scrollTrigger").split(",");
/*
 * --------------------------------------------------------------------------------------
 * TWEEN
 * --------------------------------------------------------------------------------------
 */


var Tween = /*#__PURE__*/function (_Animation2) {
  _inheritsLoose(Tween, _Animation2);

  function Tween(targets, vars, time, skipInherit) {
    var _this3;

    if (typeof vars === "number") {
      time.duration = vars;
      vars = time;
      time = null;
    }

    _this3 = _Animation2.call(this, skipInherit ? vars : _inheritDefaults(vars), time) || this;
    var _this3$vars = _this3.vars,
        duration = _this3$vars.duration,
        delay = _this3$vars.delay,
        immediateRender = _this3$vars.immediateRender,
        stagger = _this3$vars.stagger,
        overwrite = _this3$vars.overwrite,
        keyframes = _this3$vars.keyframes,
        defaults = _this3$vars.defaults,
        scrollTrigger = _this3$vars.scrollTrigger,
        yoyoEase = _this3$vars.yoyoEase,
        parent = _this3.parent,
        parsedTargets = (_isArray(targets) || _isTypedArray(targets) ? _isNumber(targets[0]) : "length" in vars) ? [targets] : toArray(targets),
        tl,
        i,
        copy,
        l,
        p,
        curTarget,
        staggerFunc,
        staggerVarsToMerge;
    _this3._targets = parsedTargets.length ? _harness(parsedTargets) : _warn("GSAP target " + targets + " not found. https://greensock.com", !_config.nullTargetWarn) || [];
    _this3._ptLookup = []; //PropTween lookup. An array containing an object for each target, having keys for each tweening property

    _this3._overwrite = overwrite;

    if (keyframes || stagger || _isFuncOrString(duration) || _isFuncOrString(delay)) {
      vars = _this3.vars;
      tl = _this3.timeline = new Timeline({
        data: "nested",
        defaults: defaults || {}
      });
      tl.kill();
      tl.parent = tl._dp = _assertThisInitialized(_this3);
      tl._start = 0;

      if (keyframes) {
        _setDefaults(tl.vars.defaults, {
          ease: "none"
        });

        keyframes.forEach(function (frame) {
          return tl.to(parsedTargets, frame, ">");
        });
      } else {
        l = parsedTargets.length;
        staggerFunc = stagger ? distribute(stagger) : _emptyFunc;

        if (_isObject(stagger)) {
          //users can pass in callbacks like onStart/onComplete in the stagger object. These should fire with each individual tween.
          for (p in stagger) {
            if (~_staggerTweenProps.indexOf(p)) {
              staggerVarsToMerge || (staggerVarsToMerge = {});
              staggerVarsToMerge[p] = stagger[p];
            }
          }
        }

        for (i = 0; i < l; i++) {
          copy = {};

          for (p in vars) {
            if (_staggerPropsToSkip.indexOf(p) < 0) {
              copy[p] = vars[p];
            }
          }

          copy.stagger = 0;
          yoyoEase && (copy.yoyoEase = yoyoEase);
          staggerVarsToMerge && _merge(copy, staggerVarsToMerge);
          curTarget = parsedTargets[i]; //don't just copy duration or delay because if they're a string or function, we'd end up in an infinite loop because _isFuncOrString() would evaluate as true in the child tweens, entering this loop, etc. So we parse the value straight from vars and default to 0.

          copy.duration = +_parseFuncOrString(duration, _assertThisInitialized(_this3), i, curTarget, parsedTargets);
          copy.delay = (+_parseFuncOrString(delay, _assertThisInitialized(_this3), i, curTarget, parsedTargets) || 0) - _this3._delay;

          if (!stagger && l === 1 && copy.delay) {
            // if someone does delay:"random(1, 5)", repeat:-1, for example, the delay shouldn't be inside the repeat.
            _this3._delay = delay = copy.delay;
            _this3._start += delay;
            copy.delay = 0;
          }

          tl.to(curTarget, copy, staggerFunc(i, curTarget, parsedTargets));
        }

        tl.duration() ? duration = delay = 0 : _this3.timeline = 0; // if the timeline's duration is 0, we don't need a timeline internally!
      }

      duration || _this3.duration(duration = tl.duration());
    } else {
      _this3.timeline = 0; //speed optimization, faster lookups (no going up the prototype chain)
    }

    if (overwrite === true && !_suppressOverwrites) {
      _overwritingTween = _assertThisInitialized(_this3);

      _globalTimeline.killTweensOf(parsedTargets);

      _overwritingTween = 0;
    }

    parent && _postAddChecks(parent, _assertThisInitialized(_this3));

    if (immediateRender || !duration && !keyframes && _this3._start === _round(parent._time) && _isNotFalse(immediateRender) && _hasNoPausedAncestors(_assertThisInitialized(_this3)) && parent.data !== "nested") {
      _this3._tTime = -_tinyNum; //forces a render without having to set the render() "force" parameter to true because we want to allow lazying by default (using the "force" parameter always forces an immediate full render)

      _this3.render(Math.max(0, -delay)); //in case delay is negative

    }

    scrollTrigger && _scrollTrigger(_assertThisInitialized(_this3), scrollTrigger);
    return _this3;
  }

  var _proto3 = Tween.prototype;

  _proto3.render = function render(totalTime, suppressEvents, force) {
    var prevTime = this._time,
        tDur = this._tDur,
        dur = this._dur,
        tTime = totalTime > tDur - _tinyNum && totalTime >= 0 ? tDur : totalTime < _tinyNum ? 0 : totalTime,
        time,
        pt,
        iteration,
        cycleDuration,
        prevIteration,
        isYoyo,
        ratio,
        timeline,
        yoyoEase;

    if (!dur) {
      _renderZeroDurationTween(this, totalTime, suppressEvents, force);
    } else if (tTime !== this._tTime || !totalTime || force || !this._initted && this._tTime || this._startAt && this._zTime < 0 !== totalTime < 0) {
      //this senses if we're crossing over the start time, in which case we must record _zTime and force the render, but we do it in this lengthy conditional way for performance reasons (usually we can skip the calculations): this._initted && (this._zTime < 0) !== (totalTime < 0)
      time = tTime;
      timeline = this.timeline;

      if (this._repeat) {
        //adjust the time for repeats and yoyos
        cycleDuration = dur + this._rDelay;

        if (this._repeat < -1 && totalTime < 0) {
          return this.totalTime(cycleDuration * 100 + totalTime, suppressEvents, force);
        }

        time = _round(tTime % cycleDuration); //round to avoid floating point errors. (4 % 0.8 should be 0 but some browsers report it as 0.79999999!)

        if (tTime === tDur) {
          // the tDur === tTime is for edge cases where there's a lengthy decimal on the duration and it may reach the very end but the time is rendered as not-quite-there (remember, tDur is rounded to 4 decimals whereas dur isn't)
          iteration = this._repeat;
          time = dur;
        } else {
          iteration = ~~(tTime / cycleDuration);

          if (iteration && iteration === tTime / cycleDuration) {
            time = dur;
            iteration--;
          }

          time > dur && (time = dur);
        }

        isYoyo = this._yoyo && iteration & 1;

        if (isYoyo) {
          yoyoEase = this._yEase;
          time = dur - time;
        }

        prevIteration = _animationCycle(this._tTime, cycleDuration);

        if (time === prevTime && !force && this._initted) {
          //could be during the repeatDelay part. No need to render and fire callbacks.
          return this;
        }

        if (iteration !== prevIteration) {
          timeline && this._yEase && _propagateYoyoEase(timeline, isYoyo); //repeatRefresh functionality

          if (this.vars.repeatRefresh && !isYoyo && !this._lock) {
            this._lock = force = 1; //force, otherwise if lazy is true, the _attemptInitTween() will return and we'll jump out and get caught bouncing on each tick.

            this.render(_round(cycleDuration * iteration), true).invalidate()._lock = 0;
          }
        }
      }

      if (!this._initted) {
        if (_attemptInitTween(this, totalTime < 0 ? totalTime : time, force, suppressEvents)) {
          this._tTime = 0; // in constructor if immediateRender is true, we set _tTime to -_tinyNum to have the playhead cross the starting point but we can't leave _tTime as a negative number.

          return this;
        }

        if (dur !== this._dur) {
          // while initting, a plugin like InertiaPlugin might alter the duration, so rerun from the start to ensure everything renders as it should.
          return this.render(totalTime, suppressEvents, force);
        }
      }

      this._tTime = tTime;
      this._time = time;

      if (!this._act && this._ts) {
        this._act = 1; //as long as it's not paused, force it to be active so that if the user renders independent of the parent timeline, it'll be forced to re-render on the next tick.

        this._lazy = 0;
      }

      this.ratio = ratio = (yoyoEase || this._ease)(time / dur);

      if (this._from) {
        this.ratio = ratio = 1 - ratio;
      }

      time && !prevTime && !suppressEvents && _callback(this, "onStart");
      pt = this._pt;

      while (pt) {
        pt.r(ratio, pt.d);
        pt = pt._next;
      }

      timeline && timeline.render(totalTime < 0 ? totalTime : !time && isYoyo ? -_tinyNum : timeline._dur * ratio, suppressEvents, force) || this._startAt && (this._zTime = totalTime);

      if (this._onUpdate && !suppressEvents) {
        totalTime < 0 && this._startAt && this._startAt.render(totalTime, true, force); //note: for performance reasons, we tuck this conditional logic inside less traveled areas (most tweens don't have an onUpdate). We'd just have it at the end before the onComplete, but the values should be updated before any onUpdate is called, so we ALSO put it here and then if it's not called, we do so later near the onComplete.

        _callback(this, "onUpdate");
      }

      this._repeat && iteration !== prevIteration && this.vars.onRepeat && !suppressEvents && this.parent && _callback(this, "onRepeat");

      if ((tTime === this._tDur || !tTime) && this._tTime === tTime) {
        totalTime < 0 && this._startAt && !this._onUpdate && this._startAt.render(totalTime, true, true);
        (totalTime || !dur) && (tTime === this._tDur && this._ts > 0 || !tTime && this._ts < 0) && _removeFromParent(this, 1); // don't remove if we're rendering at exactly a time of 0, as there could be autoRevert values that should get set on the next tick (if the playhead goes backward beyond the startTime, negative totalTime). Don't remove if the timeline is reversed and the playhead isn't at 0, otherwise tl.progress(1).reverse() won't work. Only remove if the playhead is at the end and timeScale is positive, or if the playhead is at 0 and the timeScale is negative.

        if (!suppressEvents && !(totalTime < 0 && !prevTime) && (tTime || prevTime)) {
          // if prevTime and tTime are zero, we shouldn't fire the onReverseComplete. This could happen if you gsap.to(... {paused:true}).play();
          _callback(this, tTime === tDur ? "onComplete" : "onReverseComplete", true);

          this._prom && !(tTime < tDur && this.timeScale() > 0) && this._prom();
        }
      }
    }

    return this;
  };

  _proto3.targets = function targets() {
    return this._targets;
  };

  _proto3.invalidate = function invalidate() {
    this._pt = this._op = this._startAt = this._onUpdate = this._lazy = this.ratio = 0;
    this._ptLookup = [];
    this.timeline && this.timeline.invalidate();
    return _Animation2.prototype.invalidate.call(this);
  };

  _proto3.kill = function kill(targets, vars) {
    if (vars === void 0) {
      vars = "all";
    }

    if (!targets && (!vars || vars === "all")) {
      this._lazy = this._pt = 0;
      return this.parent ? _interrupt(this) : this;
    }

    if (this.timeline) {
      var tDur = this.timeline.totalDuration();
      this.timeline.killTweensOf(targets, vars, _overwritingTween && _overwritingTween.vars.overwrite !== true)._first || _interrupt(this); // if nothing is left tweening, interrupt.

      this.parent && tDur !== this.timeline.totalDuration() && _setDuration(this, this._dur * this.timeline._tDur / tDur, 0, 1); // if a nested tween is killed that changes the duration, it should affect this tween's duration. We must use the ratio, though, because sometimes the internal timeline is stretched like for keyframes where they don't all add up to whatever the parent tween's duration was set to.

      return this;
    }

    var parsedTargets = this._targets,
        killingTargets = targets ? toArray(targets) : parsedTargets,
        propTweenLookup = this._ptLookup,
        firstPT = this._pt,
        overwrittenProps,
        curLookup,
        curOverwriteProps,
        props,
        p,
        pt,
        i;

    if ((!vars || vars === "all") && _arraysMatch(parsedTargets, killingTargets)) {
      vars === "all" && (this._pt = 0);
      return _interrupt(this);
    }

    overwrittenProps = this._op = this._op || [];

    if (vars !== "all") {
      //so people can pass in a comma-delimited list of property names
      if (_isString(vars)) {
        p = {};

        _forEachName(vars, function (name) {
          return p[name] = 1;
        });

        vars = p;
      }

      vars = _addAliasesToVars(parsedTargets, vars);
    }

    i = parsedTargets.length;

    while (i--) {
      if (~killingTargets.indexOf(parsedTargets[i])) {
        curLookup = propTweenLookup[i];

        if (vars === "all") {
          overwrittenProps[i] = vars;
          props = curLookup;
          curOverwriteProps = {};
        } else {
          curOverwriteProps = overwrittenProps[i] = overwrittenProps[i] || {};
          props = vars;
        }

        for (p in props) {
          pt = curLookup && curLookup[p];

          if (pt) {
            if (!("kill" in pt.d) || pt.d.kill(p) === true) {
              _removeLinkedListItem(this, pt, "_pt");
            }

            delete curLookup[p];
          }

          if (curOverwriteProps !== "all") {
            curOverwriteProps[p] = 1;
          }
        }
      }
    }

    this._initted && !this._pt && firstPT && _interrupt(this); //if all tweening properties are killed, kill the tween. Without this line, if there's a tween with multiple targets and then you killTweensOf() each target individually, the tween would technically still remain active and fire its onComplete even though there aren't any more properties tweening.

    return this;
  };

  Tween.to = function to(targets, vars) {
    return new Tween(targets, vars, arguments[2]);
  };

  Tween.from = function from(targets, vars) {
    return new Tween(targets, _parseVars(arguments, 1));
  };

  Tween.delayedCall = function delayedCall(delay, callback, params, scope) {
    return new Tween(callback, 0, {
      immediateRender: false,
      lazy: false,
      overwrite: false,
      delay: delay,
      onComplete: callback,
      onReverseComplete: callback,
      onCompleteParams: params,
      onReverseCompleteParams: params,
      callbackScope: scope
    });
  };

  Tween.fromTo = function fromTo(targets, fromVars, toVars) {
    return new Tween(targets, _parseVars(arguments, 2));
  };

  Tween.set = function set(targets, vars) {
    vars.duration = 0;
    vars.repeatDelay || (vars.repeat = 0);
    return new Tween(targets, vars);
  };

  Tween.killTweensOf = function killTweensOf(targets, props, onlyActive) {
    return _globalTimeline.killTweensOf(targets, props, onlyActive);
  };

  return Tween;
}(Animation);

_setDefaults(Tween.prototype, {
  _targets: [],
  _lazy: 0,
  _startAt: 0,
  _op: 0,
  _onInit: 0
}); //add the pertinent timeline methods to Tween instances so that users can chain conveniently and create a timeline automatically. (removed due to concerns that it'd ultimately add to more confusion especially for beginners)
// _forEachName("to,from,fromTo,set,call,add,addLabel,addPause", name => {
// 	Tween.prototype[name] = function() {
// 		let tl = new Timeline();
// 		return _addToTimeline(tl, this)[name].apply(tl, toArray(arguments));
// 	}
// });
//for backward compatibility. Leverage the timeline calls.


_forEachName("staggerTo,staggerFrom,staggerFromTo", function (name) {
  Tween[name] = function () {
    var tl = new Timeline(),
        params = _slice.call(arguments, 0);

    params.splice(name === "staggerFromTo" ? 5 : 4, 0, 0);
    return tl[name].apply(tl, params);
  };
});
/*
 * --------------------------------------------------------------------------------------
 * PROPTWEEN
 * --------------------------------------------------------------------------------------
 */


var _setterPlain = function _setterPlain(target, property, value) {
  return target[property] = value;
},
    _setterFunc = function _setterFunc(target, property, value) {
  return target[property](value);
},
    _setterFuncWithParam = function _setterFuncWithParam(target, property, value, data) {
  return target[property](data.fp, value);
},
    _setterAttribute = function _setterAttribute(target, property, value) {
  return target.setAttribute(property, value);
},
    _getSetter = function _getSetter(target, property) {
  return _isFunction(target[property]) ? _setterFunc : _isUndefined(target[property]) && target.setAttribute ? _setterAttribute : _setterPlain;
},
    _renderPlain = function _renderPlain(ratio, data) {
  return data.set(data.t, data.p, Math.round((data.s + data.c * ratio) * 10000) / 10000, data);
},
    _renderBoolean = function _renderBoolean(ratio, data) {
  return data.set(data.t, data.p, !!(data.s + data.c * ratio), data);
},
    _renderComplexString = function _renderComplexString(ratio, data) {
  var pt = data._pt,
      s = "";

  if (!ratio && data.b) {
    //b = beginning string
    s = data.b;
  } else if (ratio === 1 && data.e) {
    //e = ending string
    s = data.e;
  } else {
    while (pt) {
      s = pt.p + (pt.m ? pt.m(pt.s + pt.c * ratio) : Math.round((pt.s + pt.c * ratio) * 10000) / 10000) + s; //we use the "p" property for the text inbetween (like a suffix). And in the context of a complex string, the modifier (m) is typically just Math.round(), like for RGB colors.

      pt = pt._next;
    }

    s += data.c; //we use the "c" of the PropTween to store the final chunk of non-numeric text.
  }

  data.set(data.t, data.p, s, data);
},
    _renderPropTweens = function _renderPropTweens(ratio, data) {
  var pt = data._pt;

  while (pt) {
    pt.r(ratio, pt.d);
    pt = pt._next;
  }
},
    _addPluginModifier = function _addPluginModifier(modifier, tween, target, property) {
  var pt = this._pt,
      next;

  while (pt) {
    next = pt._next;
    pt.p === property && pt.modifier(modifier, tween, target);
    pt = next;
  }
},
    _killPropTweensOf = function _killPropTweensOf(property) {
  var pt = this._pt,
      hasNonDependentRemaining,
      next;

  while (pt) {
    next = pt._next;

    if (pt.p === property && !pt.op || pt.op === property) {
      _removeLinkedListItem(this, pt, "_pt");
    } else if (!pt.dep) {
      hasNonDependentRemaining = 1;
    }

    pt = next;
  }

  return !hasNonDependentRemaining;
},
    _setterWithModifier = function _setterWithModifier(target, property, value, data) {
  data.mSet(target, property, data.m.call(data.tween, value, data.mt), data);
},
    _sortPropTweensByPriority = function _sortPropTweensByPriority(parent) {
  var pt = parent._pt,
      next,
      pt2,
      first,
      last; //sorts the PropTween linked list in order of priority because some plugins need to do their work after ALL of the PropTweens were created (like RoundPropsPlugin and ModifiersPlugin)

  while (pt) {
    next = pt._next;
    pt2 = first;

    while (pt2 && pt2.pr > pt.pr) {
      pt2 = pt2._next;
    }

    if (pt._prev = pt2 ? pt2._prev : last) {
      pt._prev._next = pt;
    } else {
      first = pt;
    }

    if (pt._next = pt2) {
      pt2._prev = pt;
    } else {
      last = pt;
    }

    pt = next;
  }

  parent._pt = first;
}; //PropTween key: t = target, p = prop, r = renderer, d = data, s = start, c = change, op = overwriteProperty (ONLY populated when it's different than p), pr = priority, _next/_prev for the linked list siblings, set = setter, m = modifier, mSet = modifierSetter (the original setter, before a modifier was added)


var PropTween = /*#__PURE__*/function () {
  function PropTween(next, target, prop, start, change, renderer, data, setter, priority) {
    this.t = target;
    this.s = start;
    this.c = change;
    this.p = prop;
    this.r = renderer || _renderPlain;
    this.d = data || this;
    this.set = setter || _setterPlain;
    this.pr = priority || 0;
    this._next = next;

    if (next) {
      next._prev = this;
    }
  }

  var _proto4 = PropTween.prototype;

  _proto4.modifier = function modifier(func, tween, target) {
    this.mSet = this.mSet || this.set; //in case it was already set (a PropTween can only have one modifier)

    this.set = _setterWithModifier;
    this.m = func;
    this.mt = target; //modifier target

    this.tween = tween;
  };

  return PropTween;
}(); //Initialization tasks

_forEachName(_callbackNames + "parent,duration,ease,delay,overwrite,runBackwards,startAt,yoyo,immediateRender,repeat,repeatDelay,data,paused,reversed,lazy,callbackScope,stringFilter,id,yoyoEase,stagger,inherit,repeatRefresh,keyframes,autoRevert,scrollTrigger", function (name) {
  return _reservedProps[name] = 1;
});

_globals.TweenMax = _globals.TweenLite = Tween;
_globals.TimelineLite = _globals.TimelineMax = Timeline;
_globalTimeline = new Timeline({
  sortChildren: false,
  defaults: _defaults,
  autoRemoveChildren: true,
  id: "root",
  smoothChildTiming: true
});
_config.stringFilter = _colorStringFilter;
/*
 * --------------------------------------------------------------------------------------
 * GSAP
 * --------------------------------------------------------------------------------------
 */

var _gsap = {
  registerPlugin: function registerPlugin() {
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    args.forEach(function (config) {
      return _createPlugin(config);
    });
  },
  timeline: function timeline(vars) {
    return new Timeline(vars);
  },
  getTweensOf: function getTweensOf(targets, onlyActive) {
    return _globalTimeline.getTweensOf(targets, onlyActive);
  },
  getProperty: function getProperty(target, property, unit, uncache) {
    _isString(target) && (target = toArray(target)[0]); //in case selector text or an array is passed in

    var getter = _getCache(target || {}).get,
        format = unit ? _passThrough : _numericIfPossible;

    unit === "native" && (unit = "");
    return !target ? target : !property ? function (property, unit, uncache) {
      return format((_plugins[property] && _plugins[property].get || getter)(target, property, unit, uncache));
    } : format((_plugins[property] && _plugins[property].get || getter)(target, property, unit, uncache));
  },
  quickSetter: function quickSetter(target, property, unit) {
    target = toArray(target);

    if (target.length > 1) {
      var setters = target.map(function (t) {
        return gsap.quickSetter(t, property, unit);
      }),
          l = setters.length;
      return function (value) {
        var i = l;

        while (i--) {
          setters[i](value);
        }
      };
    }

    target = target[0] || {};

    var Plugin = _plugins[property],
        cache = _getCache(target),
        p = cache.harness && (cache.harness.aliases || {})[property] || property,
        // in case it's an alias, like "rotate" for "rotation".
    setter = Plugin ? function (value) {
      var p = new Plugin();
      _quickTween._pt = 0;
      p.init(target, unit ? value + unit : value, _quickTween, 0, [target]);
      p.render(1, p);
      _quickTween._pt && _renderPropTweens(1, _quickTween);
    } : cache.set(target, p);

    return Plugin ? setter : function (value) {
      return setter(target, p, unit ? value + unit : value, cache, 1);
    };
  },
  isTweening: function isTweening(targets) {
    return _globalTimeline.getTweensOf(targets, true).length > 0;
  },
  defaults: function defaults(value) {
    value && value.ease && (value.ease = _parseEase(value.ease, _defaults.ease));
    return _mergeDeep(_defaults, value || {});
  },
  config: function config(value) {
    return _mergeDeep(_config, value || {});
  },
  registerEffect: function registerEffect(_ref2) {
    var name = _ref2.name,
        effect = _ref2.effect,
        plugins = _ref2.plugins,
        defaults = _ref2.defaults,
        extendTimeline = _ref2.extendTimeline;
    (plugins || "").split(",").forEach(function (pluginName) {
      return pluginName && !_plugins[pluginName] && !_globals[pluginName] && _warn(name + " effect requires " + pluginName + " plugin.");
    });

    _effects[name] = function (targets, vars, tl) {
      return effect(toArray(targets), _setDefaults(vars || {}, defaults), tl);
    };

    if (extendTimeline) {
      Timeline.prototype[name] = function (targets, vars, position) {
        return this.add(_effects[name](targets, _isObject(vars) ? vars : (position = vars) && {}, this), position);
      };
    }
  },
  registerEase: function registerEase(name, ease) {
    _easeMap[name] = _parseEase(ease);
  },
  parseEase: function parseEase(ease, defaultEase) {
    return arguments.length ? _parseEase(ease, defaultEase) : _easeMap;
  },
  getById: function getById(id) {
    return _globalTimeline.getById(id);
  },
  exportRoot: function exportRoot(vars, includeDelayedCalls) {
    if (vars === void 0) {
      vars = {};
    }

    var tl = new Timeline(vars),
        child,
        next;
    tl.smoothChildTiming = _isNotFalse(vars.smoothChildTiming);

    _globalTimeline.remove(tl);

    tl._dp = 0; //otherwise it'll get re-activated when adding children and be re-introduced into _globalTimeline's linked list (then added to itself).

    tl._time = tl._tTime = _globalTimeline._time;
    child = _globalTimeline._first;

    while (child) {
      next = child._next;

      if (includeDelayedCalls || !(!child._dur && child instanceof Tween && child.vars.onComplete === child._targets[0])) {
        _addToTimeline(tl, child, child._start - child._delay);
      }

      child = next;
    }

    _addToTimeline(_globalTimeline, tl, 0);

    return tl;
  },
  utils: {
    wrap: wrap,
    wrapYoyo: wrapYoyo,
    distribute: distribute,
    random: random,
    snap: snap,
    normalize: normalize,
    getUnit: getUnit,
    clamp: clamp,
    splitColor: splitColor,
    toArray: toArray,
    mapRange: mapRange,
    pipe: pipe,
    unitize: unitize,
    interpolate: interpolate,
    shuffle: shuffle
  },
  install: _install,
  effects: _effects,
  ticker: _ticker,
  updateRoot: Timeline.updateRoot,
  plugins: _plugins,
  globalTimeline: _globalTimeline,
  core: {
    PropTween: PropTween,
    globals: _addGlobal,
    Tween: Tween,
    Timeline: Timeline,
    Animation: Animation,
    getCache: _getCache,
    _removeLinkedListItem: _removeLinkedListItem,
    suppressOverwrites: function suppressOverwrites(value) {
      return _suppressOverwrites = value;
    }
  }
};

_forEachName("to,from,fromTo,delayedCall,set,killTweensOf", function (name) {
  return _gsap[name] = Tween[name];
});

_ticker.add(Timeline.updateRoot);

_quickTween = _gsap.to({}, {
  duration: 0
}); // ---- EXTRA PLUGINS --------------------------------------------------------

var _getPluginPropTween = function _getPluginPropTween(plugin, prop) {
  var pt = plugin._pt;

  while (pt && pt.p !== prop && pt.op !== prop && pt.fp !== prop) {
    pt = pt._next;
  }

  return pt;
},
    _addModifiers = function _addModifiers(tween, modifiers) {
  var targets = tween._targets,
      p,
      i,
      pt;

  for (p in modifiers) {
    i = targets.length;

    while (i--) {
      pt = tween._ptLookup[i][p];

      if (pt && (pt = pt.d)) {
        if (pt._pt) {
          // is a plugin
          pt = _getPluginPropTween(pt, p);
        }

        pt && pt.modifier && pt.modifier(modifiers[p], tween, targets[i], p);
      }
    }
  }
},
    _buildModifierPlugin = function _buildModifierPlugin(name, modifier) {
  return {
    name: name,
    rawVars: 1,
    //don't pre-process function-based values or "random()" strings.
    init: function init(target, vars, tween) {
      tween._onInit = function (tween) {
        var temp, p;

        if (_isString(vars)) {
          temp = {};

          _forEachName(vars, function (name) {
            return temp[name] = 1;
          }); //if the user passes in a comma-delimited list of property names to roundProps, like "x,y", we round to whole numbers.


          vars = temp;
        }

        if (modifier) {
          temp = {};

          for (p in vars) {
            temp[p] = modifier(vars[p]);
          }

          vars = temp;
        }

        _addModifiers(tween, vars);
      };
    }
  };
}; //register core plugins


var gsap = _gsap.registerPlugin({
  name: "attr",
  init: function init(target, vars, tween, index, targets) {
    var p, pt;

    for (p in vars) {
      pt = this.add(target, "setAttribute", (target.getAttribute(p) || 0) + "", vars[p], index, targets, 0, 0, p);
      pt && (pt.op = p);

      this._props.push(p);
    }
  }
}, {
  name: "endArray",
  init: function init(target, value) {
    var i = value.length;

    while (i--) {
      this.add(target, i, target[i] || 0, value[i]);
    }
  }
}, _buildModifierPlugin("roundProps", _roundModifier), _buildModifierPlugin("modifiers"), _buildModifierPlugin("snap", snap)) || _gsap; //to prevent the core plugins from being dropped via aggressive tree shaking, we must include them in the variable declaration in this way.

Tween.version = Timeline.version = gsap.version = "3.6.1";
_coreReady = 1;

if (_windowExists()) {
  _wake();
}

var Power0 = _easeMap.Power0,
    Power1 = _easeMap.Power1,
    Power2 = _easeMap.Power2,
    Power3 = _easeMap.Power3,
    Power4 = _easeMap.Power4,
    Linear = _easeMap.Linear,
    Quad = _easeMap.Quad,
    Cubic = _easeMap.Cubic,
    Quart = _easeMap.Quart,
    Quint = _easeMap.Quint,
    Strong = _easeMap.Strong,
    Elastic = _easeMap.Elastic,
    Back = _easeMap.Back,
    SteppedEase = _easeMap.SteppedEase,
    Bounce = _easeMap.Bounce,
    Sine = _easeMap.Sine,
    Expo = _easeMap.Expo,
    Circ = _easeMap.Circ;

 //export some internal methods/orojects for use in CSSPlugin so that we can externalize that file and allow custom builds that exclude it.



/***/ }),

/***/ "./node_modules/paramalama/paramalama.js":
/*!***********************************************!*\
  !*** ./node_modules/paramalama/paramalama.js ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (( str ) => {
    let query = decodeURIComponent( str ).match( /[#|?].*$/g );
    const ret = {};

    if ( query ) {
        query = query[ 0 ].replace( /^\?|^#|^\/|\/$|\[|\]/g, "" );
        query = query.split( "&" );

        for ( let i = query.length; i--; ) {
            const pair = query[ i ].split( "=" );
            const key = pair[ 0 ];
            const val = pair[ 1 ];

            if ( ret[ key ] ) {
                // #2 https://github.com/kitajchuk/paramalama/issues/2
                // This supposedly will work as of ECMA-262
                // This works since we are not passing objects across frame boundaries
                // and we are not considering Array-like objects. This WILL be an Array.
                if ( {}.toString.call( ret[ key ] ) !== "[object Array]" ) {
                    ret[ key ] = [ ret[ key ] ];
                }

                ret[ key ].push( val );

            } else {
                ret[ key ] = val;
            }
        }
    }

    return ret;
});


/***/ }),

/***/ "./node_modules/properjs-controller/Controller.js":
/*!********************************************************!*\
  !*** ./node_modules/properjs-controller/Controller.js ***!
  \********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Controller)
/* harmony export */ });
const raf = window.requestAnimationFrame;
const caf = window.cancelAnimationFrame;



/**
 *
 * Easing functions
 * @namespace Easing
 * @memberof! <global>
 *
 */
const ease = {
    /**
     *
     * Produce a linear ease
     * @method linear
     * @param {number} t Difference in time
     * @returns a new t value
     *
     */
    linear ( t ) { return t; },

    /**
     *
     * Produce a swing ease like in jQuery
     * @method swing
     * @param {number} t Difference in time
     * @returns a new t value
     *
     */
    swing ( t ) { return (1-Math.cos( t*Math.PI ))/2; },

    /**
     *
     * Accelerating from zero velocity
     * @method easeInQuad
     * @param {number} t Difference in time
     * @returns a new t value
     *
     */
    easeInQuad ( t ) { return t*t; },

    /**
     *
     * Decelerating to zero velocity
     * @method easeOutQuad
     * @param {number} t Difference in time
     * @returns a new t value
     *
     */
    easeOutQuad ( t ) { return t*(2-t); },

    /**
     *
     * Acceleration until halfway, then deceleration
     * @method easeInOutQuad
     * @param {number} t Difference in time
     * @returns a new t value
     *
     */
    easeInOutQuad ( t ) { return t<0.5 ? 2*t*t : -1+(4-2*t)*t; },

    /**
     *
     * Accelerating from zero velocity
     * @method easeInCubic
     * @param {number} t Difference in time
     * @returns a new t value
     *
     */
    easeInCubic ( t ) { return t*t*t; },

    /**
     *
     * Decelerating to zero velocity
     * @method easeOutCubic
     * @param {number} t Difference in time
     * @returns a new t value
     *
     */
    easeOutCubic ( t ) { return (--t)*t*t+1; },

    /**
     *
     * Acceleration until halfway, then deceleration
     * @method easeInOutCubic
     * @param {number} t Difference in time
     * @returns a new t value
     *
     */
    easeInOutCubic ( t ) { return t<0.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1; },

    /**
     *
     * Accelerating from zero velocity
     * @method easeInQuart
     * @param {number} t Difference in time
     * @returns a new t value
     *
     */
    easeInQuart ( t ) { return t*t*t*t; },

    /**
     *
     * Decelerating to zero velocity
     * @method easeOutQuart
     * @param {number} t Difference in time
     * @returns a new t value
     *
     */
    easeOutQuart ( t ) { return 1-(--t)*t*t*t; },

    /**
     *
     * Acceleration until halfway, then deceleration
     * @method easeInOutQuart
     * @param {number} t Difference in time
     * @returns a new t value
     *
     */
    easeInOutQuart ( t ) { return t<0.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t; },

    /**
     *
     * Accelerating from zero velocity
     * @method easeInQuint
     * @param {number} t Difference in time
     * @returns a new t value
     *
     */
    easeInQuint ( t ) { return t*t*t*t*t; },

    /**
     *
     * Decelerating to zero velocity
     * @method easeOutQuint
     * @param {number} t Difference in time
     * @returns a new t value
     *
     */
    easeOutQuint ( t ) { return 1+(--t)*t*t*t*t; },

    /**
     *
     * Acceleration until halfway, then deceleration
     * @method easeInOutQuint
     * @param {number} t Difference in time
     * @returns a new t value
     *
     */
    easeInOutQuint ( t ) { return t<0.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t; }
};



const defs = {
    ease: ease.swing,
    duration: 500,
    from: 0,
    to: 500,
    update: () => {},
    complete: () => {},
};



class Controller {
    constructor () {
        // Unique event IDs
        this._uid = 0;
        this._uprop = "properjsUID";

        // Store for event handlers
        this._handlers = {};

        // RAF manager props
        this._started = false;
        this._paused = false;
        this._cycle = null;
    }


    uid () {
        this._uid = (this._uid + 1);

        return this._uid;
    }


    go ( callback ) {
        if ( this._started ) {
            return this;
        }

        this._started = true;
        this._anim = ( elapsed ) => {
            this._cycle = raf( this._anim );

            if ( typeof callback === "function" ) {
                callback( elapsed );
            }
        };
        this._cycle = raf( this._anim );
    }


    pause () {
        this._paused = true;

        return this;
    }


    play () {
        this._paused = false;

        return this;
    }


    stop () {
        caf( this._cycle );

        this._paused = false;
        this._started = false;
        this._cycle = null;

        return this;
    }


    tween ( opts ) {
        for ( let i in defs ) {
            if ( opts[ i ] === undefined ) {
                opts[ i ] = defs[ i ];
            }
        }

        let startTime = null;
        const tweenDiff = (opts.to - opts.from);

        this.stop().go(( elapsed ) => {
            if ( startTime === null ) {
                startTime = elapsed;
            }

            const diff = elapsed - startTime;
            const tweenTo = (tweenDiff * opts.ease( diff / opts.duration )) + opts.from;

            opts.update( tweenTo );

            if ( diff > opts.duration ) {
                opts.complete( opts.to );

                this.stop();
            }
        });
    }


    on ( event, handler ) {
        const events = event.split( " " );

        handler[ this._uprop ] = this.uid();

        for ( let i = events.length; i--; ) {
            if ( typeof handler === "function" ) {
                if ( !this._handlers[ events[ i ] ] ) {
                    this._handlers[ events[ i ] ] = [];
                }

                this._handlers[ events[ i ] ].push( handler );
            }
        }

        return this;
    }


    off ( event, handler ) {
        if ( !this._handlers[ event ] ) {
            return this;
        }

        if ( handler ) {
            this._offOne( event, handler );

        } else {
            this._offAll( event );
        }

        return this;
    }


    fire ( event, ...args ) {
        if ( !this._handlers[ event ] ) {
            return this;
        }

        for ( let i = this._handlers[ event ].length; i--; ) {
            this._handlers[ event ][ i ].apply( this, args );
        }

        return this;
    }


    _offOne ( event, handler ) {
        for ( let i = 0, len = this._handlers[ event ].length; i < len; i++ ) {
            if ( handler[ this._uprop ] === this._handlers[ event ][ i ][ this._uprop ] ) {
                this._handlers[ event ].splice( i, 1 );

                break;
            }
        }
    }


    _offAll ( event ) {
        for ( let i = this._handlers[ event ].length; i--; ) {
            this._handlers[ event ][ i ] = null;
        }

        delete this._handlers[ event ];
    }
}


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
      _this.register();

      _this.player = new _lib_Player__WEBPACK_IMPORTED_MODULE_2__["default"]();

      _this.player.load();
    };
  }

  (0,_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__["default"])(App, [{
    key: "register",
    value: function register() {
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register(this.worker, this.config).then(function (registration) {
          if (registration.installing) {
            console.log("[2dk] Service worker installing.");
          } else if (registration.waiting) {
            console.log("[2dk] Service worker installed.");
          } else if (registration.active) {
            console.log("[2dk] Service worker active!");
          }
        })["catch"](function (error) {
          console.error("[2dk] Service worker failed with ".concat(error));
        });
      } else {
        console.log("[2dk] Service workers not available!");
      }
    }
  }, {
    key: "deregister",
    value: function deregister() {
      // This is how you can deregister the service worker...
      navigator.serviceWorker.getRegistrations().then(function (registrations) {
        registrations.forEach(function (registration) {
          registration.unregister().then(function (bool) {
            console.log("[2dk] Unregistered Service Worker", bool);
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