module.exports = {
    keys: {
        A: 88,
        B: 90,
        UP: 38,
        DOWN: 40,
        LEFT: 37,
        RIGHT: 39,
        START: 13,
        SELECT: 32,
        UPLEFT: 111,
        UPRIGHT: 222,
        DOWNLEFT: 333,
        DOWNRIGHT: 444,
    },
    verbs: {
        PUSH: "push",
        PULL: "pull",
        LIFT: "lift",
        TOSS: "toss",
        READ: "read",
        OPEN: "open",
        HIT: "hit",
    },
    events: {
        DOOR: "door",
        BOUNDARY: "boundary",
        CUTSCENE: "cutscene",
    },
    tiles: {
        GRASS: "grass",
        WATER: "water",
        STAIRS: "stairs",
        LEDGE: "ledge",
        SWITCH: "switch",
    },
    values: {
        // px
        step: 1,
        // ms
        speed: 8,
        // ms
        repeat: 50,
    },
    colors: {
        grey: "#959595",
        red: "#F30541",
        pink: "#F49AC1",
        blue: "#1795D4",
        teal: "#2AFFEA",
        black: "#000000",
        white: "#FFFFFF",
        green: "#10FF59",
        yellow: "#EEFD02",
        purple: "#6441A4",
        greyDark: "#333",
        blueDark: "#004080",
    },
    animation: {
        fps: 24,
        fpspx: 1.333333333333,
        cycle: 240,
        bounce: 300,
        duration: {
            pushed: 0.5,
            boundary: 1.0,
            dialogue: 0.5,
        }
    }
};
