// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
process.once( "loaded", () => {
    // Setup global 2dk package for renderers
    const Editor = require( "./source/js/Editor" );

    global._2dk = {
        Editor,
    };
});

// window.addEventListener( "DOMContentLoaded", () => {
//     console.log( "DOMContentLoaded" );
// });
