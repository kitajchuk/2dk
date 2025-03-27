const renderNewMapMenu = ({ tiles, sounds }) => {
    return `
        <div class="editor__menu js-menu is-active" id="editor-addmap-menu">
            <button class="button button--grey button--box editor__close-button js-post-cancel" data-type="map">
                ${window.feather.icons.x.toSvg()}
            </button>
            <div class="editor__label">
                <span class="icon icon--nudge">
                    ${window.feather.icons.map.toSvg()}
                </span>
                <span>Make a new map</span>
            </div>
            <div class="txt">
                How maps work:<br />
                Tilesize is your raw editing size. Resolution determines how JS canvas displays on devices. 
                The player engine manages resolution scaling for you. 
                For instance, a tilesize of 64px will render at a sharp 32px on mobile devices. 
                So if you want a map area of 2560x2048 pixels your tile width and height would be 40x32 (multiply by 64px tilesize).
            </div>
            <div class="editor__setting">
                <div class="editor__label">Map name</div>
                <input class="input editor__field js-addmap-field" type="text" placeholder="Map Name" name="name" />
            </div>
            <div class="editor__setting">
                <div class="editor__label">Tilesize</div>
                <input class="input editor__field js-addmap-field" type="number" placeholder="Tilesize" name="tilesize" />
            </div>
            <div class="editor__setting editor__setting--multi">
                <div>
                    <div class="editor__label">Tile width</div>
                    <input class="input editor__field js-addmap-field" type="number" placeholder="Tile width" name="tilewidth" />
                </div>
                <div>
                    <div class="editor__label">Tile height</div>
                    <input class="input editor__field js-addmap-field" type="number" placeholder="Tile height" name="tileheight" />
                </div>
            </div>
            <div class="editor__setting">
                <div class="editor__label">Tileset</div>
                <div class="select">
                    <select class="select__field js-addmap-field js-select js-select-tiles" name="image">
                        <option value="">Tileset</option>
                        ${tiles.files.map( ( tile ) => `
                            <option value="${tile}">${tile}</option>
                        ` ).join( "" )}
                    </select>
                    <span class="select__icon">
                        ${window.feather.icons[ "chevron-down" ].toSvg()}
                    </span>
                </div>
            </div>
            <div class="editor__setting">
                <div class="editor__label">BGM</div>
                <div class="select">
                    <select class="select__field js-addmap-field js-select js-select-sounds" name="sound">
                        <option value="">Sound</option>
                        ${sounds.files.map( ( sound ) => `
                            <option value="${sound}">${sound}</option>
                        ` ).join( "" )}
                    </select>
                    <span class="select__icon">
                        ${window.feather.icons[ "chevron-down" ].toSvg()}
                    </span>
                </div>
            </div>
            <div class="editor__setting">
                <button class="button editor__button editor__upload-button js-post-save" data-type="map">Create</button>
            </div>
        </div>
    `;
}


module.exports = {
    renderNewMapMenu,
};
