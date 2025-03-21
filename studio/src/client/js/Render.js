const renderGame = ( game ) => {
    return `
        <div class="js-game-tile" data-game="${game.id}">
            <div>
                <img src="./games/${game.id}/${game.icon}" />
            </div>
            <div>${game.name}</div>
        </div>
    `;
};

const renderMap = ( map, game ) => {
    return `
        <div class="js-map-tile" data-map="${map.id}">
            <div>
                <img src="./games/${game.id}/${map.thumbnail || map.image}" />
            </div>
            <div>${map.name}</div>
        </div>
    `;
};

const renderNPC = ( npc, game ) => {
    const id = `npc-${npc.id}`;
    const src = `./games/${game.id}/${npc.image}`;
    const state = npc.states[ 0 ];
    const offsetX = Math.abs( npc.verbs[ state.verb ][ state.dir ].offsetX );
    const offsetY = Math.abs( npc.verbs[ state.verb ][ state.dir ].offsetY );

    return `
        <div class="js-npc-tile" data-npc="${npc.id}">
            <style>
                #${id} {
                    width: ${npc.width}px;
                    height: ${npc.height}px;
                    background-image: url(${src});
                    background-position: -${offsetX}px -${offsetY}px;
                }
            </style>
            <div id="${id}"></div>
            <div>${npc.name}</div>
        </div>
    `;
};

const renderObject = ( obj, game ) => {
    const id = `obj-${obj.id}`;
    const src = `./games/${game.id}/${obj.image}`;

    return `
        <div class="js-obj-tile" data-obj="${obj.id}">
            <style>
                #${id} {
                    width: ${obj.width}px;
                    height: ${obj.height}px;
                    background-image: url(${src});
                    background-position: -${obj.offsetX}px -${obj.offsetY}px;
                }
            </style>
            <div id="${id}"></div>
            <div>${obj.name}</div>
        </div>
    `;
};


module.exports = {
    renderMap,
    renderNPC,
    renderGame,
    renderObject,
};
