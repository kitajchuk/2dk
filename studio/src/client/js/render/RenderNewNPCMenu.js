const { html } = require( "./Render" );



const renderNewNPCMenu = ({ game, coords, mouseCoords, ais, types, dialogue, actions, npcToEdit }) => {
    const mouseCoordsToUse = npcToEdit ? [ npcToEdit.spawn.x, npcToEdit.spawn.y ] : mouseCoords;
    const existingPayload = npcToEdit && npcToEdit.payload ? npcToEdit.payload : "";
    const existingAI = npcToEdit ? npcToEdit.ai : "";
    const existingType = npcToEdit ? npcToEdit.type : "";
    const existingAction = npcToEdit && npcToEdit.action ? npcToEdit.action : {};
    const existingQuest = existingAction.quest ? existingAction.quest : "";
    const existingStates = npcToEdit ? npcToEdit.states : "";
    const existingAggro = npcToEdit ? npcToEdit.aggro : false;

    // Exclude verbs that are not valid for NPCs
    const npcActions = actions.filter( ( action ) => {
        return (
            action !== window.lib2dk.Config.verbs.RUN &&
            action !== window.lib2dk.Config.verbs.WALK &&
            action !== window.lib2dk.Config.verbs.FACE &&
            action !== window.lib2dk.Config.verbs.THROW &&
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
            <div class="editor__setting editor__setting--multi">
                <div>
                    <div class="editor__label">AI (optional)</div>
                    <div class="select">
                        <select class="select__field js-select js-npc-field" name="ai">
                            <option value="">AI</option>
                            ${ais.map( ( ai ) => `
                                <option value="${ai}" ${existingAI === ai ? "selected" : ""}>${ai}</option>
                            ` ).join( "" )}
                        </select>
                        <span class="select__icon">
                            ${window.feather.icons[ "chevron-down" ].toSvg()}
                        </span>
                    </div>
                </div>
                <div>
                    <div class="editor__label">Type (optional)</div>
                    <div class="select">
                        <select class="select__field js-select js-npc-field" name="type">
                            <option value="">Type</option>
                            ${types.map( ( type ) => `
                                <option value="${type}" ${existingType === type ? "selected" : ""}>${type}</option>
                            ` ).join( "" )}
                        </select>
                        <span class="select__icon">
                            ${window.feather.icons[ "chevron-down" ].toSvg()}
                        </span>
                    </div>
                </div>
            </div>
            <div class="editor__setting editor__setting--multi">
                <div>
                    <div class="editor__label">FX (optional for action)</div>
                    <div class="select">
                        <select class="select__field js-npc-field js-select" name="fx">
                            <option value="">FX</option>
                            ${game.fx.map( ( fx ) => `
                                <option value="${fx.id}" ${existingAction.fx === fx.id ? "selected" : ""}>${fx.id}</option>
                            ` ).join( "" )}
                        </select>
                        <span class="select__icon">
                            ${window.feather.icons[ "chevron-down" ].toSvg()}
                        </span>
                    </div>
                </div>
                <div>
                    <div class="editor__label">Sound (optional for action)</div>
                    <div class="select">
                        <select class="select__field js-select js-npc-field" name="sound">
                            <option value="">Sound</option>
                            ${Object.keys( game.sounds ).map( ( sound ) => `
                                <option value="${sound}" ${existingAction.sound === sound ? "selected" : ""}>${sound}</option>
                            ` ).join( "" )}
                        </select>
                        <span class="select__icon">
                            ${window.feather.icons[ "chevron-down" ].toSvg()}
                        </span>
                    </div>
                </div>
            </div>
            <div class="editor__setting">
                <div class="editor__label">State overrides (raw data)</div>
                <textarea class="editor__field input textarea js-npc-field" name="states">${existingStates ? JSON.stringify( existingStates, null, 2 ) : ""}</textarea>
            </div>
            <div class="editor__setting">
                <div class="editor__checkbox">
                    <label class="checkbox">
                        <input class="check js-npc-field" type="checkbox" name="aggro" ${existingAggro ? "checked" : ""} />
                        <span class="label">Aggro (optional to engage with the hero)</span>
                    </label>
                </div>
            </div>
            <div class="editor__setting">
                <div class="editor__label">Action (optional)</div>
                <div class="select">
                    <select class="select__field js-npc-field js-select" name="action">
                        <option value="">Action</option>
                        ${npcActions.map( ( action ) => `
                            <option value="${action}" ${existingAction.verb === action ? "selected" : ""}>${action}</option>
                        ` ).join( "" )}
                    </select>
                    <span class="select__icon">
                        ${window.feather.icons[ "chevron-down" ].toSvg()}
                    </span>
                </div>
            </div>
            <div class="editor__setting">
                <div class="editor__label">Action Quest (raw data)</div>
                <textarea class="editor__field input textarea js-npc-field" name="actionQuest">${existingQuest ? JSON.stringify( existingQuest, null, 2 ) : ""}</textarea>
            </div>
            <div class="editor__setting">
                <div class="editor__label">Payload Quest (raw data)</div>
                <textarea class="editor__field input textarea js-npc-field" name="payloadQuest">${existingPayload ? JSON.stringify( existingPayload, null, 2 ) : ""}</textarea>
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