const dialogue = require("./dialogue");
const spawn = require("./spawn");

// Maps reference source Item in game.json
const itemReference = {
    id: "",
    spawn,
    dropin: undefined || false,
    // Only text type is supported for dialogue on items
    dialogue: undefined || dialogue,
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