// This file is required by the editor.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.
window.onload = () => {
    const query = window._2dk.lib.paramalama( window.location.search );
    const editorGameName = document.getElementById( "editor-gamename" );

    window._2dk.db.open( query.game ).then(() => {
        window._2dk.db.getGame().then(( game ) => {
            console.log( "Game", game );

            editorGameName.innerHTML = game.game.name;
        });
    });
};
