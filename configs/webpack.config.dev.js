const HtmlWebpackPlugin = require('html-webpack-plugin');
const {
    babelRules,
    resolveConfig,
    devServerConfig,
    htmlPluginConfig,
    // optimizationConfig,
} = require('./webpack.config.base');

module.exports = {
    mode: 'development',
    devtool: 'eval-source-map',
    entry: {},
    devServer: devServerConfig,
    // optimization: optimizationConfig,
    resolve: resolveConfig,
    plugins: [
        new HtmlWebpackPlugin(htmlPluginConfig),
    ],
    output: {},
    module: {
        rules: [
            babelRules,
        ],
    },
};
