const HtmlWebpackPlugin = require('html-webpack-plugin');
const {
    fontRules,
    imageRules,
    babelRules,
    entryConfig,
    outputConfig,
    resolveConfig,
    styleRulesOurs,
    devServerConfig,
    styleRulesTheirs,
    htmlPluginConfig,
    // optimizationConfig,
} = require('./webpack.config.base');

module.exports = {
    mode: 'development',
    devtool: 'eval-source-map',
    entry: entryConfig,
    devServer: devServerConfig,
    // optimization: optimizationConfig,
    resolve: resolveConfig,
    plugins: [
        new HtmlWebpackPlugin(htmlPluginConfig),
    ],
    output: outputConfig,
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
