const frame = require("./frame");

// Weapon or shield frame reference
const weaponFrame = {
    offsetX: 0,
    offsetY: 0,
    width: 0,
    height: 0,
    positionX: 0,
    positionY: 0
};

const verbFrame = frame;
const verbType = {
    dur: 0,
    stop: undefined || true,
    down: {},
    up: {},
    left: {},
    right: {}
};

module.exports = {
    id: "",
    name: "", 
    width: 0,
    height: 0,
    image: "",
    scale: undefined || 1,
    vx: undefined || 0,
    vy: undefined || 0,
    vz: undefined || 0,
    maxv: undefined || 4,
    controlmaxv: undefined || 4,
    hitbox: {
        x: 0,
        y: 0,
        width: 0,
        height: 0
    },
    stats: {
        power: 1,
        health: 3,
        strength: 0
    },
    shadow: undefined || {
        offsetX: 0,
        offsetY: 0
    },
    weapon: undefined || {
        down: [],
        up: [],
        left: [],
        right: []
    },
    shield: undefined || {
        down: {},
        up: {},
        left: {},
        right: {}
    },
    verbs: {
        face: {
            down: {},
            up: {},
            left: {},
            right: {}
        },
        walk: {
            dur: 0,
            down: {},
            up: {},
            left: {},
            right: {}
        }
    }
};