const path = require( "path" );
const {
    babelRules,
    resolveConfig,
} = require( "./webpack.config.base" );

module.exports = {
    mode: "production",
    devtool: false,
    entry: {
        app: path.resolve( process.cwd(), "src/app.js" ),
    },
    resolve: resolveConfig,
    output: {
        path: path.resolve( process.cwd(), "studio/src/templates" ),
        filename: "app.js",
    },
    module: {
        rules: [
            babelRules,
        ],
    },
};