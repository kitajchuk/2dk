const Config = {
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
        THROW: "THROW",
        ATTACK: "attack",
    },
    tiles: {
        HOLE: "hole",
        GRASS: "grass",
        WATER: "water",
        LEDGE: "ledge",
        STAIRS: "stairs",
        SWITCH: "switch",
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
        DOWNRIGHT: 444,
    },
    events: {
        DOOR: "door",
        WARP: "warp",
        BOUNDARY: "boundary",
        CUTSCENE: "cutscene",
    },
    opposites: {
        y: "x",
        x: "y",
        up: "down",
        down: "up",
        left: "right",
        right: "left",
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
        blueDark: "#004080",
    },
    values: {
        debounceDur: 256,
        boundaryAnimDur: 512,
    },
    plugins: {
        TOPVIEW: "topview",
    }
};



module.exports = Config;
