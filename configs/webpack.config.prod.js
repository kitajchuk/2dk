const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ESLintWebpackPlugin = require('eslint-webpack-plugin');
const {
    fontRules,
    imageRules,
    babelRules,
    entryConfig,
    // outputConfig,
    resolveConfig,
    styleRulesOurs,
    devServerConfig,
    styleRulesTheirs,
    htmlPluginConfig,
    copyPluginConfig,
    // optimizationConfig,
} = require('./webpack.config.base');

module.exports = {
    mode: 'production',
    entry: entryConfig,
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
        new CopyWebpackPlugin(copyPluginConfig),
        new ESLintWebpackPlugin(),
    ],
    // output: {
    //     ...outputConfig,
    //     filename: '[name].[chunkhash].js',
    //     chunkFilename: '[name].[chunkhash].js',
    // },
    module: {
        rules: [
            babelRules,
            styleRulesOurs,
            styleRulesTheirs,
            imageRules,
            fontRules,
        ],
    },
};
