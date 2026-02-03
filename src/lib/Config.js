const styleRoot = window.getComputedStyle( document.documentElement );


const getStyleVar = ( prop ) => {
    return styleRoot.getPropertyValue( prop );
};



const Config = {
    player: {
        fps: 60,
        fadeDur: parseInt( getStyleVar( "--fade-duration" ), 10 ),
        deviceResolution: 2,
    },
    physics: {
        maxv: 4,
        speed: 1,
    },
    // VERBS and TILES...
    // These alone sort of "break" the idea of the "anybody's game".
    // These imply that you would be given a preset of "verbs" and "tiles"
    // to choose from when adding ActiveTiles groups to a map.
    // I think the verbs have to stay here since they are so specific...
    // But I think the tiles and their associative FX and Triggers could
    // be moved to the game.json config. This way the game creator defines
    // the TILES presets and associates them to VERBS on maps.
    verbs: {
        RUN: "run",
        PUSH: "push",
        PULL: "pull",
        GRAB: "grab",
        LIFT: "lift",
        WALK: "walk",
        FACE: "face",
        JUMP: "jump",
        FALL: "fall",
        THROW: "throw",
        ATTACK: "attack",
        OPEN: "open",
        CLOSE: "close",
        TALK: "talk",
        READ: "read",
        SWIM: "swim",
        DIVE: "dive",
    },
    map: {
        types: {
            WORLD: "world",
            INDOOR: "indoor",
        },
    },
    tiles: {
        HOLES: "holes",
        GRASS: "grass",
        WATER: "water",
        LEDGE: "ledge",
        STAIRS: "stairs",
    },
    keys: {
        A: "KeyX",
        B: "KeyZ",
        UP: "ArrowUp",
        DOWN: "ArrowDown",
        LEFT: "ArrowLeft",
        RIGHT: "ArrowRight",
        START: "Enter",
        SELECT: "Space",
        // Diagonal D-pad (non-standard, not used with keyboard events directly)
        UPLEFT: "ArrowUpLeft",
        UPRIGHT: "ArrowUpRight",
        DOWNLEFT: "ArrowDownLeft",
        DOWNRIGHT: "ArrowDownRight",
    },
    plugins: {
        TOPVIEW: "topview",
    },
    events: {
        DOOR: "door",
        DIALOGUE: "dialogue",
        BOUNDARY: "boundary",
    },
    broadcast: {
        PAUSED: "paused",
        RESUMED: "resumed",
    },
    hero: {
        modes: {
            WEAPON: "weapon",
            PROJECTILE: "projectile",
        },
        interact: {
            READ: "read",
            GRAB: "grab",
        }
    },
    npc: {
        ai: {
            WALK: "walk",
            ROAM: "roam",
            STEP: "step",
            FLOAT: "float",
            WANDER: "wander",
        },
        types: {
            DOOR: "door",
            ENEMY: "enemy",
        },
    },
    facing: {
        UP: "up",
        DOWN: "down",
        LEFT: "left",
        RIGHT: "right",
    },
    opposites: {
        y: "x",
        x: "y",
        up: "down",
        down: "up",
        left: "right",
        right: "left",
    },
    dialogue: {
        types: {
            TEXT: "text",
            PROMPT: "prompt",
        },
        verbs: {
            TALK: "talk",
            READ: "read",
        },
    },
    quest: {
        dialogue: {
            NO_CHECK: "noCheck",
            SET_ITEM: "setItem",
            TAKE_ITEM: "takeItem",
            CHECK_ITEM: "checkItem",
            CHECK_FLAG: "checkFlag",
            CHECK_STATUS: "checkStatus",
        },
        action: {
            SET_FLAG: "setFlag",
            DROP_ITEM: "dropItem",
            CHECK_FLAG: "checkFlag",
            CHECK_ITEM: "checkItem",
        },
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



export const DIRS = [
    Config.facing.UP,
    Config.facing.DOWN,
    Config.facing.LEFT,
    Config.facing.RIGHT,
];



export default Config;
