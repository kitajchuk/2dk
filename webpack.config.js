const path = require( "path" );
const root = path.resolve( __dirname );
const source = path.join( root, "source" );
const config = require( "./clutch.config" );
const lager = require( "properjs-lager" );
const nodeModules = "node_modules";
const webpack = require( "webpack" );
const autoprefixer = require( "autoprefixer" );
const BrowserSyncPlugin = require( "browser-sync-webpack-plugin" );



const webpackConfig = {
    mode: "none",


    devtool: "source-map",


    plugins: [
        new webpack.LoaderOptionsPlugin({
            options: {
                postcss: [autoprefixer( { browsers: ["last 2 versions"] } )]
            }
        }),
        new BrowserSyncPlugin({
            open: true,
            host: "localhost",
            port: config.browser.port,
            proxy: `http://localhost:${config.express.port}`,
            files: [
                "template/**/*.html",
                "template/**/*.json"
            ]
        })
    ],


    resolve: {
        modules: [root, source, nodeModules],
        mainFields: ["webpack", "browserify", "web", "clutch", "hobo", "main"]
    },


    entry: {
        "app": path.resolve( __dirname, `source/${config.theme}/js/app.js` ),
        "2dk": path.resolve( __dirname, `source/2dk/js/2dk.js` )
    },


    output: {
        path: path.resolve( __dirname, "static/js" ),
        filename: `[name].js`
    },


    module: {
        rules: [
            {
                test: /source\/js\/.*\.js$/,
                exclude: /node_modules|vendor/,
                loader: "eslint-loader",
                enforce: "pre",
                options: {
                    emitError: true,
                    emitWarning: false,
                    failOnError: true,
                    quiet: true
                }
            },
            {
                test: /source\/js\/.*\.js$/,
                exclude: /node_modules|vendor/,
                use: [
                    {
                        loader: "babel-loader",
                        options: {
                            presets: ["env"]
                        }
                    }
                ]
            },
            {
                test: /(hobo|hobo.build)\.js$/,
                use: ["expose-loader?hobo"]
            },
            {
                test: /\.(sass|scss)$/,
                exclude: /node_modules|vendor/,
                use: [
                    `file-loader?name=../css/[name].css`,
                    "postcss-loader",
                    {
                        loader: "sass-loader",
                        options: {
                            outputStyle: "compressed"
                        }
                    }
                ]
            },
            {
                test: /\.svg$/,
                exclude: /node_modules/,
                use: [
                    "svg-inline-loader"
                ]
            }
        ]
    }
};



module.exports = () => {
    return webpackConfig;
};
