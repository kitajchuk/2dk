const path = require( "path" );

const devServerConfig = {
    hot: true,
    open: true,
    port: 5050,
    host: "localhost",
    static: ["dist"],
    historyApiFallback: true,
};
const optimizationConfig = {
    splitChunks: {
        chunks: "all",
    },
};
const resolveConfig = {
    modules: ["node_modules"],
};
const htmlPluginConfig = {
    title: "2dk",
    template: path.join( process.cwd(), "public/index.html" ),
    publicPath: "/",
};
const copyPluginConfig = {
    patterns: [
        {
            from: path.resolve( process.cwd(), "public" ),
            globOptions: {
                dot: false,
                ignore: ["**/index.html"],
            },
        },
    ],
};
const babelRules = {
    test: /\.js$/,
    exclude: [/node_modules/],
    use: ["babel-loader"],
};

module.exports = {
    babelRules,
    resolveConfig,
    devServerConfig,
    htmlPluginConfig,
    copyPluginConfig,
    optimizationConfig,
};
