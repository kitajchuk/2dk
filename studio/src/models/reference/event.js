const dialogue = require("./dialogue");

module.exports = {
    coords: [
        0,
        0
    ],
    type: "",
    map: "",
    dir: "",
    width: undefined || 64,
    height: undefined || 64,
    verb: undefined || "",
    spawn: undefined || 0,
    sound: undefined || "",
    // Only text type is supported for dialogue event boundaries
    dialogue: undefined || dialogue,
};