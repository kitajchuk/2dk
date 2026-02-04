const action = require("./action");
const frame = require("./frame");
const payload = require("./payload");

// Maps reference source NPC in game.json
const npcReference = {
    id: "",
    ai: undefined || "",
    type: undefined || "",
    aggro: undefined || true,
    spawn: {
        x: 0,
        y: 0,
        quest: undefined || {
            checkFlag: {
                key: "",
                value: 1,
            }
        },
    },
    // Payload reference (payload.js)
    payload: undefined || payload,
    // Action reference (action.js)
    action: undefined || action,
};

const verbFrame = frame;
const verbType = {
    dur: 0,
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
    dir: undefined || "",
    verb: undefined || "",
    scale: undefined || 1,
    vx: undefined || 0,
    vy: undefined || 0,
    vz: undefined || 0,
    maxv: undefined || 4,
    controlmaxv: undefined || 4,
    opacity: undefined || 1.0,
    bounce: undefined || true,
    projectile: undefined || "",
    hitbox: {
        x: 0,
        y: 0,
        width: 0,
        height: 0
    },
    stats: {
        power: 1,
        health: 1
    },
    drops: undefined || [
        {
            id: "",
            chance: 0,
        },
    ],
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
    },
    states: [
        {
            verb: "",
            dir: "",
            // Action reference (action.js)
            action: undefined || action,
        }
    ]
};