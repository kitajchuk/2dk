const Config = require( "../Config" );


const renderNewActiveTilesMenu = ({ map, game, coords, facing, actions, layers }) => {
    let tile = map.textures.background[ coords[ 1 ] ][ coords[ 0 ] ];
    let layer = Config.EditorLayers.modes.BACKGROUND;

    if ( Array.isArray( tile ) ) {
        tile = tile[ tile.length - 1 ];

    } else {
        // Cannot make an empty tile an active tile...
        alert( "Cannot make an empty tile an active tile..." );
        return;
    }

    const offsetX = tile[ 0 ];
    const offsetY = tile[ 1 ];

    return `
        <div class="editor__menu js-menu is-active" id="editor-activetiles-menu">
            <button class="button button--grey button--box editor__close-button js-post-cancel">
                ${window.feather.icons.x.toSvg()}
            </button>
            <div class="editor__setting">
                <div class="editor__label">
                    <span class="icon icon--nudge">
                        ${window.feather.icons.activity.toSvg()}
                    </span>
                    <span>Create Active Tiles</span>
                </div>
                <div class="txt">
                    How Active Tiles work:<br />
                    Active Tiles can be frame animated background or foreground tiles with their own timing function. 
                    They can also be interaction tiles that can be lifted, tossed, pushed and even attacked. 
                    You can select just a single tile in the Editor, 
                    apply your settings and all matching tiles on the map will become Active Tiles in the live game engine.
                </div>
            </div>
            <!-- Discover allows dynamic Active Tiles based on tileset position -->
            <input class="js-activetile-field" type="hidden" name="tile" value="${JSON.stringify( tile )}" />
            <div class="editor__setting">
                <style>
                    #editor-activetile-image {
                        width: ${map.tilesize}px;
                        height: ${map.tilesize}px;
                        margin: 0 auto;
                        background-image: url(./games/${game.id}/${map.image});
                        background-position: -${offsetX}px -${offsetY}px;
                    }
                </style>
                <div id="editor-activetile-image"></div>
            </div>
            <div class="editor__setting editor__setting--multi">
                <div>
                    <div class="editor__label">Group</div>
                    <div class="editor__setting">
                        <div>
                            <input class="input editor__field js-activetile-field" type="text" placeholder="Group" name="group" />
                        </div>
                    </div>
                </div>
                <div>
                    <div class="editor__label">Layer</div>
                    <div class="select">
                        <select class="select__field js-activetile-field js-select" name="layer">
                            <option value="">Layer</option>
                            ${layers.map( ( l ) => `
                                <option value="${l}" ${l === layer ? "selected" : "disabled"}>${l}</option>
                            ` ).join( "" )}
                        </select>
                        <span class="select__icon">
                            ${window.feather.icons[ "chevron-down" ].toSvg()}
                        </span>
                    </div>
                </div>
            </div>
            <div class="editor__setting">
                <div class="editor__checkbox">
                    <label class="checkbox">
                        <input class="check js-activetile-field" type="checkbox" name="mask" />
                        <span class="label">Mask (Can mask the hero sprite)</span>
                    </label>
                </div>
            </div>
            <!-- Attack is an internalized VERB object -->
            <div class="editor__setting">
                <div class="editor__label">Action (omit if tile is passive, e.g. grass)</div>
                <div class="select">
                    <select class="select__field js-activetile-field js-select" name="action">
                        <option value="">Action</option>
                        ${actions.map( ( action ) => `
                            <option value="${action}">${action}</option>
                        ` ).join( "" )}
                    </select>
                    <span class="select__icon">
                        ${window.feather.icons[ "chevron-down" ].toSvg()}
                    </span>
                </div>
            </div>
            <div class="editor__setting">
                <div class="editor__checkbox">
                    <label class="checkbox">
                        <input class="check js-activetile-field" type="checkbox" name="attack" />
                        <span class="label">Attack (for secondary "attack" action if another action is selected, e.g. something that can be lifted can also be attacked)</span>
                    </label>
                </div>
            </div>
            <div class="editor__setting">
                <div class="editor__label">Friction (for passive tiles, e.g. grass or stairs to slow down movement)</div>
                <input class="range editor__field js-activetile-field js-range" value="0" type="range" min="0" max="2" step="0.5" list="friction-list" name="friction" />
                <datalist id="friction-list">
                    <option value="0">0</option>
                    <option value="0.5">0.5</option>
                    <option value="1">1</option>
                    <option value="1.5">1.5</option>
                    <option value="2">2</option>
                </datalist>
            </div>
            <!-- Layer is determined by active layer in Sidebar -->
            <!-- Coords is the current canvas selectionCoords -->
            <!-- Offset X & Y will be picked from tileset UI -->
            <div class="editor__setting">
                <div class="editor__label">Animation Steps</div>
                <input class="range editor__field js-activetile-field js-range" value="0" type="range" min="0" max="5" step="1" list="steps-x-list" name="stepsX" />
                <datalist id="steps-x-list">
                    <option value="0" label="0">0</option>
                    <option value="1" label="1">1</option>
                    <option value="2" label="2">2</option>
                    <option value="3" label="3">3</option>
                    <option value="4" label="4">4</option>
                    <option value="5" label="5">5</option>
                </datalist>
            </div>
            <div class="editor__setting">
                <div class="editor__label">Animation Duration</div>
                <input class="range editor__field js-activetile-field js-range" value="0" type="range" min="0" max="2000" step="500" list="dur-list" name="dur" />
                <datalist id="dur-list">
                    <option value="0" label="0">0</option>
                    <option value="500" label="0.5s">500</option>
                    <option value="1000" label="1s">1000</option>
                    <option value="1500" label="1.5s">1500</option>
                    <option value="2000" label="2s">2000</option>
                </datalist>
            </div>
            <!-- If the Action is jump we need an elevation -->
            <div class="editor__setting">
                <div class="editor__label">Elevation (for "jump" action)</div>
                <input class="range editor__field js-activetile-field js-range" value="0" type="range" min="0" max="3" step="1" list="elevation-list" name="elevation" />
                <datalist id="elevation-list">
                    <option value="0" label="0">0</option>
                    <option value="1" label="1">1</option>
                    <option value="2" label="2">2</option>
                    <option value="3" label="3">3</option>
                </datalist>
            </div>
            <div class="editor__setting">
                <div class="editor__label">Direction (for "jump" action)</div>
                <div class="select">
                    <select class="select__field js-activetile-field js-select" name="direction">
                        <option value="">Direction</option>
                        ${facing.map( ( facing ) => `
                            <option value="${facing}">${facing}</option>
                        ` ).join( "" )}
                    </select>
                    <span class="select__icon">
                        ${window.feather.icons[ "chevron-down" ].toSvg()}
                    </span>
                </div>
            </div>
            <div class="editor__setting">
                <button class="button editor__button editor__upload-button js-activetiles-post">Create</button>
            </div>
        </div>
    `;
};


module.exports = {
    renderNewActiveTilesMenu,
};