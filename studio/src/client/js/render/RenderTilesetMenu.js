const renderTilesetMenu = ({ tiles }) => {
    return `
        <div class="editor__menu js-menu js-upload-menu is-active" id="editor-addtiles-menu">
            <button class="button button--grey button--box editor__close-button js-upload-cancel" data-type="tiles">
                ${window.feather.icons.x.toSvg()}
            </button>
            <div class="editor__setting">
                <div class="editor__label">
                    <span class="icon icon--nudge">
                        ${window.feather.icons.grid.toSvg()}
                    </span>
                    <span>Upload a new tileset</span>
                </div>
                <div class="txt">
                    How tilesets work:<br />
                    Tiles are your swatches for painting maps. 
                    You should design your tiles with the same tilesize as your maps. 
                    You can upload tile images here and select which tileset you want to use when making a new map. 
                    You must use PNG format (.png).
                </div>
                <div class="editor__upload">
                    <button class="button editor__upload__button editor__button">
                        <span class="icon icon--nudge">
                            ${window.feather.icons[ "upload-cloud" ].toSvg()}
                        </span>
                        <span>PNG</span>
                    </button>
                    <input class="input editor__upload__field editor__field js-upload-field" id="editor-addtiles-file-copy" type="text" placeholder="Choose a file" name="new_tiles_copy" />
                    <input class="editor__upload__mask js-upload-file" id="editor-addtiles-file" type="file" name="new_tiles" data-target="editor-addtiles-file-copy" />
                </div>
            </div>
            <div class="editor__setting">
                <button class="button editor__button editor__upload-button js-upload-save" data-type="tiles">Upload</button>
            </div>
            <div class="txt">
                Remove tileset:<br />
                You can delete a tileset you've uploaded by selecting it here and using the delete button. 
                You get one confirmation for your delete action.
            </div>
            <div class="editor__setting">
                <div class="select">
                    <select class="select__field js-select js-select-delete js-select-tiles">
                        <option value="">Delete tileset...</option>
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
                <button class="button button--red editor__button editor__delete-button js-upload-delete" data-type="tiles">Delete tileset...</button>
            </div>
        </div>
    `;
};


module.exports = {
    renderTilesetMenu,
};
