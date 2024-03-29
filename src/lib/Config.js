const styleRoot = window.getComputedStyle( document.documentElement );


const getStyleVar = ( prop ) => {
    return styleRoot.getPropertyValue( prop );
};



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
        BOMB: "bomb",
        THROW: "throw",
        SMASH: "smash",
        ATTACK: "attack",
    },
    tiles: {
        HOLES: "holes",
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
    plugins: {
        TOPVIEW: "topview",
    },
    events: {
        DOOR: "door",
        WARP: "warp",
        BOUNDARY: "boundary",
        CUTSCENE: "cutscene",
    },
    broadcast: {
        PAUSED: "paused",
        RESUMED: "resumed",
        MAPEVENT: "mapevent",
    },
    npc: {
        TILE: "tile",
        WALK: "walk",
        ROAM: "roam",
        FLOAT: "float",
        WANDER: "wander",
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
        red: getStyleVar( "--red" ),
        grey: getStyleVar( "--grey" ),
        blue: getStyleVar( "--blue" ),
        teal: getStyleVar( "--teal" ),
        pink: getStyleVar( "--pink" ),
        black: getStyleVar( "--black" ),
        green: getStyleVar( "--green" ),
        white: getStyleVar( "--white" ),
        purple: getStyleVar( "--purple" ),
        yellow: getStyleVar( "--yellow" ),
        greyDark: getStyleVar( "--grey-dark" ),
        blueDark: getStyleVar( "--blue-dark" ),
        charcoal: getStyleVar( "--charcoal" ),
        charcoal2: getStyleVar( "--charcoal2" ),
    },
};



export default Config;
