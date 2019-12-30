// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
process.once( "loaded", () => {
    // console.log( process );
    // console.log( global );
    // Setup global 2dk package for renderers
    const db = require( "./source/db" );

    global._2dk = {
        DB: db.DB,
        db: new db.DB(),
        js: require( "../source/2dk/js/lib/index" ),
        lib: {
            paramalama: require( "paramalama" )
        },
    };

    db.DB.getGames().then(( games ) => {
        global._2dk.games = games;
    });
});

window.addEventListener( "DOMContentLoaded", () => {
    console.log( "DOMContentLoaded" );
});
