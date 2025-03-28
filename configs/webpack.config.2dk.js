const path = require( "path" );
const {
    babelRules,
    resolveConfig,
} = require( "./webpack.config.base" );

module.exports = {
    mode: "production",
    devtool: false,
    entry: {
        "2dk": path.resolve( process.cwd(), "src/lib/index.js" ),
    },
    resolve: resolveConfig,
    output: {
        path: path.resolve( process.cwd(), "studio/public/js" ),
        filename: "2dk.js",
    },
    module: {
        rules: [
            babelRules,
        ],
    },
};
