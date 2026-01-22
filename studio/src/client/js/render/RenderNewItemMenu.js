const { html } = require( "./Render" );



const renderNewItemMenu = ({ game, coords, mouseCoords, itemToEdit }) => {
    const mouseCoordsToUse = itemToEdit ? [ itemToEdit.spawn.x, itemToEdit.spawn.y ] : mouseCoords;
    const hasExistingPayload = itemToEdit && itemToEdit.payload;
    const hasExistingDialogue = hasExistingPayload && itemToEdit.payload.dialogue;
    const existingText = hasExistingDialogue ? itemToEdit.payload.dialogue.text : "";

    return html`
        <div class="editor__menu js-menu is-active" id="editor-item-menu">
            <button class="button button--grey button--box editor__close-button js-post-cancel">
                ${window.feather.icons.x.toSvg()}
            </button>
            <div class="editor__label">
                <span class="icon icon--nudge">
                    ${window.feather.icons.user.toSvg()}
                </span>
                <span>${itemToEdit ? "Edit" : "Add"} Item</span>
            </div>
            <div class="txt">
                How Items work:<br />
                Items are objects that can be picked up and used by the player.
                Typically they are used in NPC quests but sometimes we want them to be standalone on a map.
            </div>
            <!-- coords and spawn are handled in the app code -->
            <input class="js-item-field" type="hidden" name="coords" value="${JSON.stringify( coords )}" />
            <input class="js-item-field" type="hidden" name="mouseCoords" value="${JSON.stringify( mouseCoordsToUse )}" />
            <div class="editor__setting">
                <div class="editor__label">Text (required for itemGet dialogue)</div>
                <textarea class="editor__field input textarea js-item-field" name="text">${existingText ? existingText.join( "\n\n" ) : ""}</textarea>
            </div>
            <div class="editor__setting">
                <button class="button editor__button editor__upload-button js-item-post" data-type="item">${itemToEdit ? "Update" : "Create"}</button>
            </div>
        </div>
    `;
};


module.exports = {
    renderNewItemMenu,
};