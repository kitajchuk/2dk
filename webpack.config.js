const path = require( "path" );
const root = path.resolve( __dirname );
const source = path.join( root, "source" );
const studio = path.join( root, "studio", "source" );
const config = require( "./clutch.config" );
const lager = require( "properjs-lager" );
const nodeModules = "node_modules";
const webpack = require( "webpack" );
const nodeExternals = require( "webpack-node-externals" );
const rimraf = require( "rimraf" );
const BrowserSyncPlugin = require( "browser-sync-webpack-plugin" );
const ESLintPlugin = require( "eslint-webpack-plugin" );



// https://webpack.js.org/contribute/writing-a-plugin/
// https://webpack.js.org/api/compiler-hooks/
class StudioHooksPlugin {
    constructor ( options ) {
        this.options = options;
    }

    apply ( compiler ) {
        compiler.hooks.afterCompile.tap( "StudioHooksPlugin", ( compilation ) => {
            if ( typeof this.options.afterCompile === "function" ) {
                this.options.afterCompile();
            }
        });
    }
}



const webpackConfig = {
    mode: "none",


    devtool: "source-map",


    resolve: {
        modules: [root, source, studio, nodeModules],
        mainFields: ["webpack", "browserify", "web", "clutch", "hobo", "main"]
    }
};



const sitePlugins = [
    new ESLintPlugin({
        emitError: true,
        emitWarning: false,
        failOnError: true,
        quiet: true,
        context: path.resolve( __dirname, "source" ),
        exclude: [
            "node_modules",
        ],
    }),
];



if ( process.env.CLUTCH_ENV === "server" ) {
    sitePlugins.push(
        new BrowserSyncPlugin({
            open: false,
            host: "localhost",
            port: config.browser.port,
            proxy: `http://localhost:${config.express.port}`,
            files: [
                "template/**/*.html",
                "template/**/*.json"
            ],
        })
    );
}



const siteConfig = Object.assign( {}, webpackConfig, {
    plugins: sitePlugins,


    entry: {
        "app": path.resolve( __dirname, `source/${config.theme}/js/app.js` ),
        "2dk": path.resolve( __dirname, "source/2dk/js/2dk.js" ),
    },


    output: {
        path: path.resolve( __dirname, "static/js" ),
        filename: "[name].js"
    },


    module: {
        rules: [
            {
                // test: /source\/.*\.js$/i,
                // exclude: /node_modules/,
                test: /source\/.*\.js$|node_modules\/[properjs-|konami-|paramalama].*/i,
                use: [
                    {
                        loader: "babel-loader",
                        options: {
                            presets: ["@babel/preset-env"],
                        },
                    },
                ],
            },
            {
                test: /(hobo|hobo.build)\.js$/i,
                use: ["expose-loader?hobo"],
            },
            {
                test: /\.s[ac]ss$/i,
                exclude: /node_modules/,
                use: [
                    "file-loader?name=../css/[name].css",
                    {
                        loader: "sass-loader",
                        options: {
                            sassOptions: {
                                outputStyle: (config.env.sandbox ? "uncompressed" : "compressed"),
                            },
                        },
                    },
                ],
            },
            {
                test: /\.svg$/i,
                exclude: /node_modules/,
                use: [
                    "svg-inline-loader",
                ],
            },
        ]
    }
});



const studioConfig = Object.assign( {}, webpackConfig, {
    plugins: [
        new ESLintPlugin({
            emitError: true,
            emitWarning: false,
            failOnError: true,
            quiet: true,
            context: path.resolve( __dirname, "studio", "source" ),
            exclude: [
                "electron",
                "node_modules",
            ],
        }),
        new StudioHooksPlugin({
            afterCompile: () => {
                setTimeout(() => {
                    rimraf.sync( `${__dirname}/studio/static/js/editor*` );
                    rimraf.sync( `${__dirname}/studio/static/js/menu*` );
                    rimraf.sync( `${__dirname}/studio/static/js/styles*` );
                    rimraf.sync( `${__dirname}/studio/static/js/scripts*` );

                }, 100 );
            },
        }),
    ],


    target: "node", // in order to ignore built-in modules like path, fs, etc.


    externals: [nodeExternals()], // in order to ignore all modules in node_modules folder


    entry: {
        "styles": path.resolve( __dirname, "studio/source/sass/screen.js" ),
        "editor": path.resolve( __dirname, "studio/source/js/Editor.js" ),
        "menu": path.resolve( __dirname, "studio/menu.js" ),
    },


    output: {
        path: path.resolve( __dirname, "studio/static/js" ),
        filename: "[name].js",
    },


    module: {
        rules: [
            {
                test: /\.s[ac]ss$/i,
                exclude: /node_modules/,
                use: [
                    "file-loader?name=../css/[name].css",
                    {
                        loader: "sass-loader",
                        options: {
                            sassOptions: {
                                outputStyle: (config.env.sandbox ? "uncompressed" : "compressed"),
                            },
                        },
                    },
                ],
            },
        ]
    }
});



module.exports = [
    siteConfig,
    studioConfig,
];
