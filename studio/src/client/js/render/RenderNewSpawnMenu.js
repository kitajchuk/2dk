const { html } = require( "./Render" );



const renderNewSpawnMenu = ({ game, facing, coords, mouseCoords, spawnToEdit }) => {
    const mouseCoordsToUse = spawnToEdit ? [ spawnToEdit.x, spawnToEdit.y ] : mouseCoords;
    const existingDropin = spawnToEdit?.dropin ?? false;
    const existingDir = spawnToEdit?.dir ?? "";

    return html`
        <div class="editor__menu js-menu is-active" id="editor-spawn-menu">
            <button class="button button--grey button--box editor__close-button js-post-cancel">
                ${window.feather.icons.x.toSvg()}
            </button>
            <div class="editor__label">
                <span class="icon icon--nudge">
                    ${window.feather.icons.user.toSvg()}
                </span>
                <span>${spawnToEdit ? "Edit" : "Add"} Item</span>
            </div>
            <div class="txt">
                How Spawns work:<br />
                Spawns are the locations on a map in which the Hero can start.
            </div>
            <!-- coords and spawn are handled in the app code -->
            <input class="js-spawn-field" type="hidden" name="coords" value="${JSON.stringify( coords )}" />
            <input class="js-spawn-field" type="hidden" name="mouseCoords" value="${JSON.stringify( mouseCoordsToUse )}" />
            <div class="editor__setting">
                <div class="editor__label">Direction</div>
                <div class="select">
                    <select class="select__field js-select js-spawn-field" name="dir">
                        <option value="">Direction</option>
                        ${facing.map( ( facing ) => `
                            <option value="${facing}" ${existingDir === facing ? "selected" : ""}>${facing}</option>
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
                        <input class="check js-spawn-field" type="checkbox" name="dropin" ${existingDropin ? "checked" : ""} />
                        <span class="label">Dropin</span>
                    </label>
                </div>
            </div>
            <div class="editor__setting">
                <button class="button editor__button editor__upload-button js-spawn-post" data-type="spawn">${spawnToEdit ? "Update" : "Create"}</button>
            </div>
        </div>
    `;
};


module.exports = {
    renderNewSpawnMenu,
};