const path = require('path');

const rJS = /\.js$/;
const rCSS = /\.css$/;
const rNode = /node_modules/;
const rStyle = /\.(scss|sass|css)$/;
const rImage = /\.(png|jp(e*)g|svg|gif)$/;
const rFonts = /\.(ttf|eot|svg|woff|woff2)(\?v=[0-9]\.[0-9]\.[0-9])?$/;

const devServerConfig = {
    hot: true,
    open: true,
    port: 3000,
    host: 'localhost',
    historyApiFallback: true,
};
const optimizationConfig = {
    splitChunks: {
        chunks: 'all',
    },
};
const resolveConfig = {
    modules: ['node_modules'],
};
const htmlPluginConfig = {
    title: '2dk',
    template: path.join(process.cwd(), 'public/index.html'),
    publicPath: '/',
};
const copyPluginConfig = {
    patterns: [
        {
            from: path.resolve(process.cwd(), 'public'),
            globOptions: {
                dot: true,
                ignore: ['**/index.html'],
            },
        },
    ],
};
const babelRules = {
    test: rJS,
    exclude: [rNode],
    use: ['babel-loader'],
};
const styleRulesOurs = {
    test: rStyle,
    exclude: rNode,
    use: [
        'style-loader',
        {
            loader: 'css-loader',
            options: {
                url: false,
            },
        },
        'resolve-url-loader',
        {
            loader: 'sass-loader',
            options: {
                sourceMap: true,
            },
        },
    ],
};
const styleRulesTheirs = {
    test: rCSS,
    include: rNode,
    use: ['style-loader', 'css-loader'],
}
const imageRules = {
    test: rImage,
    type: 'asset/inline',
};
const fontRules = {
    test: rFonts,
    type: 'asset/inline',
};

module.exports = {
    fontRules,
    imageRules,
    babelRules,
    resolveConfig,
    styleRulesOurs,
    devServerConfig,
    styleRulesTheirs,
    htmlPluginConfig,
    copyPluginConfig,
    optimizationConfig,
};
