const dialogue = require("./dialogue");

module.exports = {
    // This will run above all else so long as the hero has the status...
    checkStatus: undefined || {
        status: "",
        dialogue: undefined || dialogue,
    },
    // Any amount of quests can be stacked in any order here...
    quest: undefined || [
        {
            type: "noCheck",
            dialogue: undefined || dialogue,
        },
        {
            type: "setItem",
            id: "",
            dialogue: undefined || dialogue,
        },
        {
            type: "checkItem",
            id: "",
            dialogue: undefined || dialogue,
        },
        {
            type: "takeItem",
            id: "",
            dialogue: undefined || dialogue,
        },
        {
            type: "setFlag",
            key: "",
            dialogue: undefined || dialogue,
        },
        {
            type: "checkFlag",
            key: "",
            dialogue: undefined || dialogue,
        },
        {
            type: "checkCompanion",
            id: "",
            dialogue: undefined || dialogue,
        },
    ],
};