const { html } = require( "./Render" );



const renderSpritesheetMenu = ({ sprites }) => {
    return html`
        <div class="editor__menu js-menu js-upload-menu is-active" id="editor-addsprites-menu">
            <button class="button button--grey button--box editor__close-button js-upload-cancel" data-type="sprites">
                ${window.feather.icons.x.toSvg()}
            </button>
            <div class="editor__setting">
                <div class="editor__label">
                    <span class="icon icon--nudge">
                        ${window.feather.icons.grid.toSvg()}
                    </span>
                    <span>Upload a new sprite sheet</span>
                </div>
                <div class="txt">
                    How sprites work:<br />
                    Sprites are your character sheets. 
                    You should design your sprites to work with the tilesize of your maps. 
                    You can upload tile images here and select which sprite sheet you want to use when making a new Hero or NPC. 
                    You must use PNG format (.png).
                </div>
                <div class="editor__upload">
                    <button class="button editor__upload__button editor__button">
                        <span class="icon icon--nudge">
                            ${window.feather.icons[ "upload-cloud" ].toSvg()}
                        </span>
                        <span>PNG</span>
                    </button>
                    <input class="input editor__upload__field editor__field js-upload-field" id="editor-addsprites-file-copy" type="text" placeholder="Choose a file" name="new_sprites_copy" />
                    <input class="editor__upload__mask js-upload-file" id="editor-addsprites-file" type="file" name="new_sprites" data-target="editor-addsprites-file-copy" />
                </div>
            </div>
            <div class="editor__setting">
                <button class="button editor__button editor__upload-button js-upload-save" data-type="sprites">Upload</button>
            </div>
            <div class="txt">
                Remove sprite sheet:<br />
                You can delete a sprite sheet you've uploaded by selecting it here and using the delete button. 
                You get one confirmation for your delete action.
            </div>
            <div class="editor__setting">
                <div class="select">
                    <select class="select__field js-select js-select-delete js-select-sprites">
                        <option value="">Delete sprite sheet...</option>
                        ${sprites.files.map( ( sprite ) => `
                            <option value="${sprite}">${sprite}</option>
                        ` ).join( "" )}
                    </select>
                    <span class="select__icon">
                        ${window.feather.icons[ "chevron-down" ].toSvg()}
                    </span>
                </div>
            </div>
            <div class="editor__setting">
                <button class="button button--red editor__button editor__delete-button js-upload-delete" data-type="sprites">Delete sprite sheet...</button>
            </div>
        </div>
    `;
};


module.exports = {
    renderSpritesheetMenu,
};
