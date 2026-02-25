const { html } = require( "./Render" );



const renderActiveMapMenu = ( { map, types, assets } ) => {
    const tileFile = map.image.split( "/" ).pop();
    const soundFile = map.sound.split( "/" ).pop();

    return html`
        <div class="editor__menu js-menu is-active" id="editor-active-map-menu">
            <button class="button button--grey button--box editor__close-button js-close-settings">
                ${window.feather.icons.x.toSvg()}
            </button>
            <div class="editor__setting">
                <div class="editor__label">
                    <span class="icon icon--nudge">
                        ${window.feather.icons.map.toSvg()}
                    </span>
                    <span>Map Settings</span>
                </div>
            </div>
            <div class="editor__setting">
                <div class="editor__label">Map name</div>
                <input value="${map.name}" class="input editor__field" type="text" name="name" readonly />
            </div>
            <div class="editor__setting">
                <div class="editor__label">Map type</div>
                <div class="select">
                    <select class="select__field js-select js-select-types" name="type" disabled>
                        <option value="">Map type</option>
                        ${types.map( ( type ) => `
                            <option value="${type}" ${map.type === type ? "selected" : ""}>${type}</option>
                        ` ).join( "" )}
                    </select>
                    <span class="select__icon">
                        ${window.feather.icons[ "chevron-down" ].toSvg()}
                    </span>
                </div>
            </div>
            <div class="editor__setting">
                <div class="editor__label">Tilesize</div>
                <input value="${map.tilesize}" class="input editor__field" type="number" name="tilesize" readonly />
            </div>
            <div class="editor__setting editor__setting--multi">
                <div>
                    <div class="editor__label">Tile width</div>
                    <input value="${map.tilewidth}" class="input editor__field" type="number" name="tilewidth" readonly />
                </div>
                <div>
                    <div class="editor__label">Tile height</div>
                    <input value="${map.tileheight}" class="input editor__field" type="number" name="tileheight" readonly />
                </div>
            </div>
            <div class="editor__setting">
                <div class="editor__label">Tileset</div>
                <div class="select">
                    <select class="select__field js-select js-select-tiles" name="image" disabled>
                        <option value="">Tileset</option>
                        ${assets.tiles.files.map( ( tile ) => {
                            return `<option value="${tile}" ${tileFile === tile ? "selected" : ""}>${tile}</option>`;
                        }).join( "" )}
                    </select>
                    <span class="select__icon">
                        ${window.feather.icons[ "chevron-down" ].toSvg()}
                    </span>
                </div>
            </div>
            <div class="editor__setting">
                <div class="editor__label">BGM</div>
                <div class="select">
                    <select class="select__field js-select js-select-sounds" name="sound" disabled>
                        <option value="">Sound</option>
                        ${assets.sounds.files.map( ( sound ) => {
                            return `<option value="${sound}" ${soundFile === sound ? "selected" : ""}>${sound}</option>`;
                        }).join( "" )}
                    </select>
                    <span class="select__icon">
                        ${window.feather.icons[ "chevron-down" ].toSvg()}
                    </span>
                </div>
            </div>
            <div class="editor__setting">
                <div class="editor__checkbox">
                    <label class="checkbox">
                        <input class="check js-addmap-field" type="checkbox" name="dialogue" ${map.dialogue ? "checked" : ""} disabled />
                        <span class="label">Dialogue (${map.dialogue ? "enabled" : "disabled"})</span>
                    </label>
                </div>
            </div>
            <div class="editor__setting">
                <button class="button button--red editor__button editor__delete-button js-delete-map">Delete map</button>
            </div>
        </div>
    `;
};


module.exports = {
    renderActiveMapMenu,
};
