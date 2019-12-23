// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
process.once( "loaded", () => {
    // console.log( process );
    // console.log( global );

    // Pipe 2dk JS libraries into global scope for access in renderer.js
    global._2dk = require( "../source/2dk/js/lib/index" );
});

window.addEventListener( "DOMContentLoaded", () => {
    console.log( "DOMContentLoaded" );
});
