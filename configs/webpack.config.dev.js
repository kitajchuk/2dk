const path = require('path');
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
    entry: {
        app: path.resolve(process.cwd(), 'src/index.js'),
    },
    devServer: devServerConfig,
    // optimization: optimizationConfig,
    resolve: resolveConfig,
    plugins: [
        new HtmlWebpackPlugin(htmlPluginConfig),
    ],
    output: {
        path: path.resolve(process.cwd(), 'dist'),
        filename: 'index.js',
    },
    module: {
        rules: [
            babelRules,
        ],
    },
};
