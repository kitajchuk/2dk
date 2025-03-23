const renderTile = ( ctx, x, y, w, h, color, alpha ) => {
    ctx.globalAlpha = alpha || 0.75;
    ctx.fillStyle = color || window.lib2dk.Config.colors.blue;
    ctx.fillRect( x, y, w, h );
};


const renderGame = ( game ) => {
    return `
        <div class="js-game-tile" data-game="${game.id}">
            <img src="./games/${game.id}/${game.icon}" />
            <div>${game.name}</div>
        </div>
    `;
};

const renderMap = ( map, game ) => {
    return `
        <div class="js-map-tile" data-map="${map.id}">
            <img src="./games/${game.id}/${map.thumbnail || map.image}" />
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

const renderSpawn = ( spawn, hero ) => {
    const id = `spawn-x${spawn.x}-y${spawn.y}`;

    return `
        <div id="${id}" class="js-spawn-tile" data-spawn-x="${spawn.x}" data-spawn-y="${spawn.y}">
            <style>
                #${id} {
                    top: ${spawn.y}px;
                    left: ${spawn.x}px;
                    width: ${hero.width}px;
                    height: ${hero.height}px;
                    position: absolute;
                }
            </style>
            ${window.feather.icons[ "map-pin" ].toSvg()}
        </div>
    `;
};

const renderEvent = ( event, map ) => {
    const x = event.coords[ 0 ] * map.tilesize;
    const y = event.coords[ 1 ] * map.tilesize;
    const id = `event-x${x}-y${y}`;

    return `
        <div id="${id}" class="js-event-tile" data-event-x="${x}" data-event-y="${y}">
            <style>
                #${id} {
                    top: ${y}px;
                    left: ${x}px;
                    width: ${map.tilesize}px;
                    height: ${map.tilesize}px;
                    position: absolute;
                }
            </style>
            ${window.feather.icons.clock.toSvg()}
        </div>
    `;
};


const renderGrid = ( id, size ) => {
    return `
        <style>
            #${id} {
                background-image: 
                    linear-gradient( to right, var( --teal ) 1px, transparent 1px ),
                    linear-gradient( to bottom, var( --teal ) 1px, transparent 1px );
                background-size: ${size}px ${size}px;
            }
        </style>
    `;
};


module.exports = {
    renderMap,
    renderNPC,
    renderTile,
    renderGame,
    renderGrid,
    renderSpawn,
    renderEvent,
    renderObject,
};
