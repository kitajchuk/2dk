const quest = require("./quest");

module.exports = {
    verb: "",
    dir: undefined || "",
    fx: undefined || "",
    sound: undefined || "",
    shift: undefined || true,
    quest: undefined || quest,
    stat: undefined || {
        key: "",
        value: 1,
        dialogue: undefined || {
            type: "",
            text: [],
        },
    },
    bonus: undefined || {
        items: undefined || [],
        chance: undefined || 50
    }
};