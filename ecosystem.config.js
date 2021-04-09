module.exports = {
    apps: [
        {
            name: "2dk",
            script: "./server/app.js",
            env: {
                NODE_ENV: "sandbox"
            },
            watch: ["server"],
            watch_delay: 1000,
            ignore_watch : ["node_modules"],
            watch_options: {
                "followSymlinks": false
            }
        }
    ]
};
