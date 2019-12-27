module.exports = {
    keys: {
        A: 88,
        B: 90,
        UP: 38,
        DOWN: 40,
        LEFT: 37,
        RIGHT: 39,
        START: 13,
        SELECT: 32,
    },
    moves: {
        UP: "up",
        NONE: "none",
        LEFT: "left",
        DOWN: "down",
        RIGHT: "right",
    },
    values: {
        // px
        step: 1,
        // ms
        speed: 6,
        // ms
        repeat: 50,
    },
    colors: {
        grey: "#959595",
        red: "#F30541",
        pink: "#F49AC1",
        blue: "#1795D4",
        teal: "#2AFFEA",
        black: "#000000",
        white: "#FFFFFF",
        green: "#10FF59",
        yellow: "#EEFD02",
        purple: "#6441A4",
        greyDark: "#333",
        blueDark: "#004080",
    },
    animation: {
        fps: 24,
        fpspx: 1.333333333333,
        cycle: 240,
    }
};
