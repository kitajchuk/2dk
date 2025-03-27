const renderNewActiveTilesMenu = ({ facing, actions }) => {
    return `
        <div class="editor__menu js-menu is-active" id="editor-activetiles-menu">
            <button class="button button--grey button--box editor__close-button js-post-cancel" data-type="activetiles">
                ${window.feather.icons.x.toSvg()}
            </button>
            <div class="editor__setting">
                <div class="editor__label">
                    <span class="icon icon--nudge">
                        ${window.feather.icons.grid.toSvg()}
                    </span>
                    <span>Create Active Tiles</span>
                </div>
                <div class="txt">
                    How Active Tiles work:<br />
                    Active Tiles can be frame animated background or foreground tiles with their own timing function. 
                    They can also be interaction tiles that can be lifted, tossed, pushed and even attacked. 
                    The Discover option is for dynamic Active Tiles in the game engine. 
                    With this setting you can select just a single tile in the Editor, 
                    apply your settings and all matching tiles on the map will become Active Tiles in the live game engine.
                </div>
            </div>
            <!-- Discover allows dynamic Active Tiles based on tileset position -->
            <div class="editor__setting">
                <div class="editor__label">Group</div>
                <div class="editor__setting--multi">
                    <div>
                        <input class="input editor__field js-activetile-field" type="text" placeholder="Group" name="group" />
                    </div>
                    <div class="editor__checkbox">
                        <label class="checkbox">
                            <input class="check js-activetile-field" type="checkbox" name="discover" />
                            <span class="label">Discover</span>
                        </label>
                    </div>
                </div>
            </div>
            <!-- Attack is an internalized VERB object -->
            <div class="editor__setting">
                <div class="editor__label">Action</div>
                <div class="editor__setting--multi">
                    <div>
                        <div class="select">
                            <select class="select__field js-activetile-field js-select js-select-action" name="action">
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
                    <div class="editor__checkbox">
                        <label class="checkbox">
                            <input class="check js-activetile-field" type="checkbox" name="attack" />
                            <span class="label">Attack</span>
                        </label>
                    </div>
                </div>
            </div>
            <!-- Layer is determined by active layer in Sidebar -->
            <!-- Coords is the current canvas selectionCoords -->
            <!-- Offset X & Y will be picked from tileset UI -->
            <div class="editor__setting editor__setting--multi">
                <div>
                    <div class="editor__label">Steps (keyframes)</div>
                    <input class="input editor__field js-activetile-field" type="number" placeholder="Steps" name="stepsX" />
                </div>
                <div>
                    <div class="editor__label">Duration (milliseconds)</div>
                    <input class="input editor__field js-activetile-field" type="number" placeholder="Duration" name="dur" />
                </div>
            </div>
            <!-- If the Action is jump we need an elevation -->
            <div class="editor__setting editor__setting--multi">
                <div>
                    <div class="editor__label">Elevation (verb: jump)</div>
                    <input class="input editor__field js-activetile-field" type="number" placeholder="Elevation" name="elevation" />
                </div>
                <div>
                    <div class="editor__label">Direction (elevation)</div>
                    <div class="select">
                        <select class="select__field js-activetile-field js-select js-select-facing" name="direction">
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
            </div>
            <div class="editor__setting">
                <button class="button editor__button editor__upload-button js-post-update" data-type="activetiles">Create</button>
            </div>
        </div>
    `;
};


module.exports = {
    renderNewActiveTilesMenu,
};