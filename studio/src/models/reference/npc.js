// Maps reference source NPC in game.json
const npcReference = {
    id: "",
    ai: "",
    spawn: {
        x: 0,
        y: 0
    }
};

const verbFrame = {
    offsetX: 0,
    offsetY: 0,
    stepsX: 0
};

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
    verb: "",
    scale: 1,
    vx: 0,
    vy: 0,
    vz: 0,
    maxv: 4,
    controlmaxv: 4,
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
            dir: ""
        }
    ]
};