// Maps reference source Item in game.json
const itemReference = {
    id: "",
    spawn: {
        x: 0,
        y: 0
    },
    // Only text type is supported for dialogue on items
    payload: undefined || dialogue,
};

module.exports = {
    id: "",
    name: "",
    width: 0,
    height: 0,
    image: "",
    offsetX: 0,
    offsetY: 0,
    sound: undefined || "",
    stat: undefined || {
        key: "",
        value: 1,
    },
    currency: undefined || 0,
    verb: undefined || "",
    equip: undefined || "",
    status: undefined || "",
};