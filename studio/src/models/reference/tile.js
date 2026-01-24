const action = require("./action");

module.exports = {
    group: "",
    layer: "",
    offsetX: 0,
    offsetY: 0,
    stepsX: undefined || 0,
    friction: undefined || 1,
    elevation: undefined || 1,
    // FX reference (game.json)
    mask: undefined || "",
    // Action reference (action.js)
    actions: undefined || action,
};