const quest = require("./quest");
const dialogue = require("./dialogue");

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
        dialogue: undefined || dialogue,
    },
    // For tile actions...
    drops: undefined || [
        {
            id: "",
            chance: 0,
        },
    ],
};