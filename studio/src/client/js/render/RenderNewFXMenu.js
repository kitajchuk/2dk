const { html } = require( "./Render" );



const renderNewFXMenu = ({ game, coords, mouseCoords }) => {
    return html`
        <div class="editor__menu js-menu is-active" id="editor-fx-menu">
            <button class="button button--grey button--box editor__close-button js-post-cancel">
                ${window.feather.icons.x.toSvg()}
            </button>
            <div class="editor__label">
                <span class="icon icon--nudge">
                    ${window.feather.icons.user.toSvg()}
                </span>
                <span>Add FX</span>
            </div>
            <div class="txt">
                How FX work:<br />
                FX are visual effects that can be used to add more depth to a map.
                All FX are animated and have a default duration. You can change the duration to suit your needs.
                Float FX will float upwards for the duration of the animation and loop (e.g. chimney smoke).
            </div>
            <!-- coords and spawn are handled in the app code -->
            <input class="js-fx-field" type="hidden" name="coords" value="${JSON.stringify( coords )}" />
            <input class="js-fx-field" type="hidden" name="mouseCoords" value="${JSON.stringify( mouseCoords )}" />
            <div class="editor__setting">
                <div class="editor__checkbox">
                    <label class="checkbox">
                        <input class="check js-fx-field" type="checkbox" name="float" />
                        <span class="label">Float</span>
                    </label>
                </div>
            </div>
            <div class="editor__setting">
                <div class="editor__label">Animation Duration</div>
                <input class="range editor__field js-fx-field js-range" value="0" type="range" min="0" max="2000" step="500" list="dur-list" name="dur" />
                <datalist id="dur-list">
                    <option value="0" label="0">0</option>
                    <option value="500" label="0.5s">500</option>
                    <option value="1000" label="1s">1000</option>
                    <option value="1500" label="1.5s">1500</option>
                    <option value="2000" label="2s">2000</option>
                </datalist>
            </div>
            <div class="editor__setting">
                <button class="button editor__button editor__upload-button js-fx-post" data-type="fx">Create</button>
            </div>
        </div>
    `;
};


module.exports = {
    renderNewFXMenu,
};