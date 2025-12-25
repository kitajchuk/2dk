module.exports = {
    id: "",
    name: "",
    width: 768,
    height: 576,
    tilesize: 64,
    worldmapsize: {
        tilewidth: 40,
        tileheight: 32,
    },
    indoormapsize: {
        tilewidth: 20,
        tileheight: 16,
    },
    bButton: "attack",
    resolution: 1,
    maxresolution: 2,
    diagonaldpad: true,
    icon: "icon.png",
    save: 1,
    release: 1.0,
    plugin: "topview",
    sounds: {},
    // Hero reference
    hero: {
        sprite: 0,
        spawn: 0,
        map: "",
        companion: null || {
            id: "",
            type: ""
        }
    },
    // Hero library
    heroes: [],
    // NPC library
    npcs: [],
    // Object library
    objects: [],
    // FX library
    fx: [],
    // Asset bundle
    bundle: []
};
