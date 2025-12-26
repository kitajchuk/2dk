// Maps reference source NPC in game.json
const npcReference = {
    id: "",
    ai: "",
    spawn: {
        x: 0,
        y: 0
    },
    payload: undefined || {
        dialogue: {
            type: "",
            text: [],
            yes: undefined || {
                label: "",
                text: []
            },
            no: undefined || {
                label: "",
                text: []
            }
        }
    },
    // Action reference (action.js)
    action: undefined || {
        verb: "",
        dir: undefined || "",
        fx: undefined || "",
        sound: undefined || ""
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
            dir: "",
            // Action reference (action.js)
            action: undefined || {
                verb: "",
                dir: "",
                shift: undefined || true,
                sound: undefined || ""
            }
        }
    ]
};