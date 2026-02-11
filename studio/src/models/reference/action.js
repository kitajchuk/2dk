const dialogue = require("./dialogue");

module.exports = {
    verb: "",
    dir: undefined || "",
    fx: undefined || "",
    sound: undefined || "",
    // For NPC state...
    shift: undefined || true,
    // For NPC actions...
    quest: undefined || {
        setFlag: undefined || {
            key: "",
            value: 1,
        },
        checkFlag: undefined || {
            key: "",
            value: 1,
        },
        dropItem: undefined || {
            id: "",
            dialogue: undefined || dialogue,
        },
        checkItem: undefined || {
            id: "",
            dialogue: undefined || dialogue,
        },
        setCompanion: undefined || {
            id: "",
            type: "",
        },
    },
    // For tile actions...
    stat: undefined || {
        key: "",
        value: 1,
        dialogue: undefined || dialogue,
    },
    // For tile actions...
    drops: undefined || "",
};