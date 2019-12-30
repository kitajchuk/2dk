// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.
window.onload = () => {
    const select = document.getElementById( "root-game-select" );
    const button = document.getElementById( "root-game-button" );
    const fields = {
        name: document.querySelector( `input[name="name"]` ),
        width: document.querySelector( `input[name="width"]` ),
        height: document.querySelector( `input[name="height"]` ),
    };

    window._2dk.games.forEach(( game ) => {
        const option = document.createElement( "option" );

        option.value = game.id;
        option.innerText = game.name;

        select.appendChild( option );
    });

    button.addEventListener( "click", () => {
        if ( fields.name.value ) {
            const data = {
                name: fields.name.value,
                width: fields.width.value,
                height: fields.height.value,
            };

            window._2dk.DB.addGame( data ).then(( game ) => {
                window.location.href = `editor.html?game=${game.game.id}`;
            });
        }

    }, false );

    select.addEventListener( "change", () => {
        window.location.href = `editor.html?game=${select.value}`;

    }, false );
};
