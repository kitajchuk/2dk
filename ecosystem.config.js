module.exports = {
    apps: [
        {
            name: "clutch-2dk",
            script: "./server/app.js",
            env: {
                NODE_ENV: "sandbox"
            },
            watch: ["server", "template", "static/api"],
            watch_delay: 1000,
            ignore_watch : ["node_modules"],
            watch_options: {
                "followSymlinks": false
            }
        }
    ]
};
