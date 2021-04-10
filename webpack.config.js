const path = require( "path" );
const root = path.resolve( __dirname );
const source = path.join( root, "client" );
const studio = path.join( root, "studio", "client" );
const nodeModules = "node_modules";
const nodeExternals = require( "webpack-node-externals" );
const rimraf = require( "rimraf" );
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
        mainFields: ["webpack", "browserify", "web", "hobo", "main"]
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



const siteConfig = Object.assign( {}, webpackConfig, {
    plugins: sitePlugins,


    entry: {
        "2dk": path.resolve( __dirname, "client/js/2dk.js" ),
    },


    output: {
        path: path.resolve( __dirname, "public/js" ),
        filename: "[name].js"
    },


    module: {
        rules: [
            {
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
                test: /\.s[ac]ss$/i,
                exclude: /node_modules/,
                use: [
                    "file-loader?name=../css/[name].css",
                    {
                        loader: "sass-loader",
                        options: {
                            sassOptions: {
                                outputStyle: "compressed",
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
            context: path.resolve( __dirname, "studio", "client" ),
            exclude: [
                "electron",
                "node_modules",
            ],
        }),
        new StudioHooksPlugin({
            afterCompile: () => {
                setTimeout(() => {
                    rimraf.sync( `${__dirname}/studio/public/js/editor*` );
                    rimraf.sync( `${__dirname}/studio/public/js/menu*` );
                    rimraf.sync( `${__dirname}/studio/public/js/styles*` );
                    rimraf.sync( `${__dirname}/studio/public/js/scripts*` );

                }, 100 );
            },
        }),
    ],


    target: "node", // in order to ignore built-in modules like path, fs, etc.


    externals: [nodeExternals()], // in order to ignore all modules in node_modules folder


    entry: {
        "styles": path.resolve( __dirname, "studio/client/sass/screen.js" ),
        "editor": path.resolve( __dirname, "studio/client/js/Editor.js" ),
        "menu": path.resolve( __dirname, "studio/server/menu.js" ),
    },


    output: {
        path: path.resolve( __dirname, "studio/public/js" ),
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
                                outputStyle: "compressed",
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
