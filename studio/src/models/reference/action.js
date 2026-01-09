const quest = require("./quest");

module.exports = {
    verb: "",
    dir: undefined || "",
    fx: undefined || "",
    sound: undefined || "",
    // For NPC state...
    shift: undefined || true,
    // For NPC actions...
    quest: undefined || quest,
    // For tile actions...
    stat: undefined || {
        key: "",
        value: 1,
        dialogue: undefined || {
            type: "",
            text: [],
        },
    },
    // For tile actions...
    drops: undefined || [
        {
            id: "",
            chance: 0,
        },
    ],
};