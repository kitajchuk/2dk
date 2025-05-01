const { html } = require( "./Render" );



const renderNewNPCMenu = ({ coords, mouseCoords, ais, dialogue, actions, npcToEdit }) => {
    const mouseCoordsToUse = npcToEdit ? [ npcToEdit.spawn.x, npcToEdit.spawn.y ] : mouseCoords;
    const hasExistingDialogue = npcToEdit && npcToEdit.payload && npcToEdit.payload.dialogue;
    const existingAI = npcToEdit ? npcToEdit.ai : "";
    const existingActions = npcToEdit && npcToEdit.actions ? npcToEdit.actions : [];
    const existingAction1 = npcToEdit ? existingActions[ 0 ] : "";
    const existingAction2 = npcToEdit ? existingActions[ 1 ] : "";
    const existingDialogueType = hasExistingDialogue ? npcToEdit.payload.dialogue.type : "";
    const existingText = hasExistingDialogue ? npcToEdit.payload.dialogue.text : "";
    const existingYes = hasExistingDialogue && npcToEdit.payload.dialogue.yes ? npcToEdit.payload.dialogue.yes : {};
    const existingNo = hasExistingDialogue && npcToEdit.payload.dialogue.no ? npcToEdit.payload.dialogue.no : {};

    // Exclude verbs that are not valid for NPCs
    const npcActions = actions.filter( ( action ) => {
        return (
            action !== window.lib2dk.Config.verbs.RUN &&
            action !== window.lib2dk.Config.verbs.WALK &&
            action !== window.lib2dk.Config.verbs.FACE &&
            action !== window.lib2dk.Config.verbs.THROW &&
            action !== window.lib2dk.Config.verbs.SMASH &&
            action !== window.lib2dk.Config.verbs.JUMP &&
            action !== window.lib2dk.Config.verbs.FALL &&
            action !== window.lib2dk.Config.verbs.GRAB
        );
    });

    return html`
        <div class="editor__menu js-menu is-active" id="editor-npc-menu">
            <button class="button button--grey button--box editor__close-button js-post-cancel">
                ${window.feather.icons.x.toSvg()}
            </button>
            <div class="editor__label">
                <span class="icon icon--nudge">
                    ${window.feather.icons.user.toSvg()}
                </span>
                <span>${npcToEdit ? "Edit" : "Add"} NPC</span>
            </div>
            <div class="txt">
                How NPCs work:<br />
                NPCs are non-playable characters that can be used to add more depth to a map. 
                They can be interactable, have dialog, or even be hostile.
            </div>
            <!-- coords and spawn are handled in the app code -->
            <input class="js-npc-field" type="hidden" name="coords" value="${JSON.stringify( coords )}" />
            <input class="js-npc-field" type="hidden" name="mouseCoords" value="${JSON.stringify( mouseCoordsToUse )}" />
            <div class="editor__setting">
                <div class="select">
                    <select class="select__field js-select js-npc-field" name="ai">
                        <option value="">AI (optional)</option>
                        ${ais.map( ( ai ) => `
                            <option value="${ai}" ${existingAI === ai ? "selected" : ""}>${ai}</option>
                        ` ).join( "" )}
                    </select>
                    <span class="select__icon">
                        ${window.feather.icons[ "chevron-down" ].toSvg()}
                    </span>
                </div>
            </div>
            <div class="editor__setting editor__setting--multi">
                <div>
                    <div class="select">
                        <select class="select__field js-npc-field js-select" name="action1">
                            <option value="">Action 1 (optional)</option>
                            ${npcActions.map( ( action ) => `
                                <option value="${action}" ${existingAction1 === action ? "selected" : ""}>${action}</option>
                            ` ).join( "" )}
                        </select>
                        <span class="select__icon">
                            ${window.feather.icons[ "chevron-down" ].toSvg()}
                        </span>
                    </div>
                </div>
                <div>
                    <div class="select">
                        <select class="select__field js-npc-field js-select" name="action2">
                            <option value="">Action 2 (optional)</option>
                            ${npcActions.map( ( action ) => `
                                <option value="${action}" ${existingAction2 === action ? "selected" : ""}>${action}</option>
                            ` ).join( "" )}
                        </select>
                        <span class="select__icon">
                            ${window.feather.icons[ "chevron-down" ].toSvg()}
                        </span>
                    </div>
                </div>
            </div>
            <div class="editor__setting">
                <div class="select">
                    <select class="select__field js-select js-npc-field" name="dialogue">
                        <option value="">Dialogue (optional)</option>
                        ${dialogue.map( ( dialogue ) => `
                            <option value="${dialogue}" ${existingDialogueType === dialogue ? "selected" : ""}>${dialogue}</option>
                        ` ).join( "" )}
                    </select>
                    <span class="select__icon">
                        ${window.feather.icons[ "chevron-down" ].toSvg()}
                    </span>
                </div>
            </div>
            <div class="editor__setting">
                <div class="editor__label">Text (required for either dialogue type)</div>
                <textarea class="editor__field input textarea js-npc-field" name="text">${existingText ? existingText.join( "\n\n" ) : ""}</textarea>
            </div>
            <div class="editor__setting">
                <div class="editor__label">Yes label (required for prompt dialogue)</div>
                <input class="editor__field input js-npc-field" name="yeslabel" value="${existingYes.label ? existingYes.label : ""}" />
            </div>
            <div class="editor__setting">
                <div class="editor__label">Yes text (required for prompt dialogue)</div>
                <textarea class="editor__field input textarea js-npc-field" name="yes">${existingYes.text ? existingYes.text.join( "\n\n" ) : ""}</textarea>
            </div>
            <div class="editor__setting">
                <div class="editor__label">No label (required for prompt dialogue)</div>
                <input class="editor__field input js-npc-field" name="nolabel" value="${existingNo.label ? existingNo.label : ""}" />
            </div>
            <div class="editor__setting">
                <div class="editor__label">No text (required for prompt dialogue)</div>
                <textarea class="editor__field input textarea js-npc-field" name="no">${existingNo.text ? existingNo.text.join( "\n\n" ) : ""}</textarea>
            </div>
            <div class="editor__setting">
                <button class="button editor__button editor__upload-button js-npc-post" data-type="npc">${npcToEdit ? "Update" : "Create"}</button>
            </div>
        </div>
    `;
};


module.exports = {
    renderNewNPCMenu,
};