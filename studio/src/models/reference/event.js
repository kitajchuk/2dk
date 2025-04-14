module.exports = {
    coords: [
        0,
        0
    ],
    type: "",
    map: "",
    dir: "",
    verb: undefined || "",
    spawn: undefined || 0,
    payload: undefined || {
        dialogue: {
            // Only text type is supported for dialogue event boundaries
            type: "text",
            text: [],
        }
    }
};