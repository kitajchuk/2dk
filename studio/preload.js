// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
process.once( "loaded", () => {
    // console.log( process );
    // console.log( global );
    // Setup global 2dk package for renderers
    const db = require( "./source/db" );
    const Editor = require( "./source/Editor" );

    global._2dk = {
        src: {
            db,
            Editor,
        },
        lib: {
            paramalama: require( "paramalama" ),
        },
    };

    db.DB.getGames().then(( games ) => {
        global._2dk.games = games;
    });
});

window.addEventListener( "DOMContentLoaded", () => {
    console.log( "DOMContentLoaded" );
});
