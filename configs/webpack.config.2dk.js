const path = require('path');
const {
    babelRules,
    resolveConfig,
} = require('./webpack.config.base');

module.exports = {
    mode: 'development',
    devtool: false,
    entry: {
        '2dk': path.resolve(process.cwd(), 'src/lib/index.js'),
    },
    resolve: resolveConfig,
    output: {
        path: path.resolve(process.cwd(), 'dist'),
        filename: '2dk.js',
    },
    module: {
        rules: [
            babelRules,
        ],
    },
};
