const path = require ( "path" );
const HtmlWebpackPlugin = require( "html-webpack-plugin" );
const CopyWebpackPlugin = require( "copy-webpack-plugin" );
const {
    babelRules,
    resolveConfig,
    devServerConfig,
    htmlPluginConfig,
    copyPluginConfig,
    // optimizationConfig,
} = require( "./webpack.config.base" );

module.exports = {
    mode: "production",
    entry: {
        app: path.resolve( process.cwd(), "src/index.js" ),
    },
    devServer: devServerConfig,
    // optimization: optimizationConfig,
    resolve: resolveConfig,
    plugins: [
        new HtmlWebpackPlugin({
            ...htmlPluginConfig,
            hash: true,
            minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeRedundantAttributes: true,
                useShortDoctype: true,
                removeEmptyAttributes: true,
                removeStyleLinkTypeAttributes: true,
                keepClosingSlash: true,
                minifyJS: true,
                minifyCSS: true,
                minifyURLs: true,
            },
        }),
        new CopyWebpackPlugin( copyPluginConfig )
    ],
    // output: {
    //     ...outputConfig,
    //     filename: "[name].[chunkhash].js",
    //     chunkFilename: "[name].[chunkhash].js",
    // },
    output: {
        path: path.resolve( process.cwd(), "dist" ),
        filename: "index.js",
    },
    module: {
        rules: [
            babelRules,
        ],
    },
};
