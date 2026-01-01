const cellauto = {
    algo: "maze",
    walls: {
        // Texture reference (texture.js)
    },
    textures: [
        // Texture reference (texture.js)
    ],
};

module.exports = {
    id: "",
    name: "",
    type: "",
    tilesize: 64,
    width: 2560,
    height: 2048,
    tilewidth: 40,
    tileheight: 32,
    collider: 16,
    image: "",
    snapshot: "",
    thumbnail: "",
    sound: "",
    spawn: [
        {
            x: 0,
            y: 0,
            dir: "down"
        }
    ],
    cellauto: undefined,
    // FX reference (game.json)
    fx: [],
    tiles: [],
    events: [],
    // NPC reference (game.json)
    npcs: [],
    // Object reference (game.json)
    objects: [],
    collision: [],
    textures: {
        background: [],
        foreground: []
    },
};
