const { html } = require( "./Render" );



const renderSoundMenu = ({ sounds }) => {
    return html`
        <div class="editor__menu js-menu js-upload-menu is-active" id="editor-addsound-menu">
            <button class="button button--grey button--box editor__close-button js-upload-cancel" data-type="sounds">
                ${window.feather.icons.x.toSvg()}
            </button>
            <div class="editor__setting">
                <div class="editor__label">
                    <span class="icon icon--nudge">
                        ${window.feather.icons.music.toSvg()}
                    </span>
                    <span>Upload a new sound</span>
                </div>
                <div class="txt">
                    How sounds work:<br />
                    Sounds are the background music that will play for a map. 
                    You must use MP3 format (.mp3).
                </div>
                <div class="editor__upload">
                    <button class="button editor__upload__button editor__button">
                        <span class="icon icon--nudge">
                            ${window.feather.icons[ "upload-cloud" ].toSvg()}
                        </span>
                        <span>MP3</span>
                    </button>
                    <input class="input editor__upload__field editor__field js-upload-field" id="editor-addsound-file-copy" type="text" placeholder="Choose a file" name="new_sound_copy" />
                    <input class="editor__upload__mask js-upload-file" id="editor-addsound-file" type="file" name="new_sound" data-target="editor-addsound-file-copy" />
                </div>
            </div>
            <div class="editor__setting">
                <button class="button editor__button editor__upload-button js-upload-save" data-type="sounds">Upload</button>
            </div>
            <div class="txt">
                Remove sounds:<br />
                You can delete sounds you've uploaded by selecting it here and using the delete button. 
                You get one confirmation for your delete action.
            </div>
            <div class="editor__setting">
                <div class="select">
                    <select class="select__field js-select js-select-delete js-select-sounds">
                        <option value="">Delete sound...</option>
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
                <button class="button button--red editor__button editor__delete-button js-upload-delete" data-type="sounds">Delete sound...</button>
            </div>
        </div>
    `;
};


module.exports = {
    renderSoundMenu,
};
