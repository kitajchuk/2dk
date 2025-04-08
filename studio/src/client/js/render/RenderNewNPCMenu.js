const { html } = require( "./Render" );



const renderNewNPCMenu = ({ coords, ais, dialogue }) => {
    return html`
        <div class="editor__menu js-menu is-active" id="editor-npc-menu">
            <button class="button button--grey button--box editor__close-button js-post-cancel">
                ${window.feather.icons.x.toSvg()}
            </button>
            <div class="editor__label">
                <span class="icon icon--nudge">
                    ${window.feather.icons.user.toSvg()}
                </span>
                <span>Add an NPC</span>
            </div>
            <div class="txt">
                How NPCs work:<br />
                NPCs are non-playable characters that can be used to add more depth to a map. 
                They can be interactable, have dialog, or even be hostile.
            </div>
            <!-- coords and spawn are handled in the app code -->
            <input class="js-npc-field" type="hidden" name="coords" value="${JSON.stringify( coords )}" />
            <div class="editor__setting">
                <div class="select">
                    <select class="select__field js-select js-npc-field" name="ai">
                        <option value="">AI</option>
                        ${ais.map( ( ai ) => `
                            <option value="${ai}">${ai}</option>
                        ` ).join( "" )}
                    </select>
                    <span class="select__icon">
                        ${window.feather.icons[ "chevron-down" ].toSvg()}
                    </span>
                </div>
            </div>
            <div class="editor__setting">
                <div class="select">
                    <select class="select__field js-select js-npc-field" name="dialogue">
                        <option value="">Dialogue</option>
                        ${dialogue.map( ( dialogue ) => `
                            <option value="${dialogue}">${dialogue}</option>
                        ` ).join( "" )}
                    </select>
                    <span class="select__icon">
                        ${window.feather.icons[ "chevron-down" ].toSvg()}
                    </span>
                </div>
            </div>
            <div class="editor__setting">
                <div class="editor__label">Text (required for either dialogue type)</div>
                <textarea class="editor__field input textarea js-npc-field" name="text"></textarea>
            </div>
            <div class="editor__setting">
                <div class="editor__label">Yes label (required for prompt dialogue)</div>
                <input class="editor__field input js-npc-field" name="yeslabel" />
            </div>
            <div class="editor__setting">
                <div class="editor__label">Yes text (required for prompt dialogue)</div>
                <textarea class="editor__field input textarea js-npc-field" name="yes"></textarea>
            </div>
            <div class="editor__setting">
                <div class="editor__label">No label (required for prompt dialogue)</div>
                <input class="editor__field input js-npc-field" name="nolabel" />
            </div>
            <div class="editor__setting">
                <div class="editor__label">No text (required for prompt dialogue)</div>
                <textarea class="editor__field input textarea js-npc-field" name="no"></textarea>
            </div>
            <div class="editor__setting">
                <button class="button editor__button editor__upload-button js-npc-post" data-type="npc">Create</button>
            </div>
        </div>
    `;
};


module.exports = {
    renderNewNPCMenu,
};