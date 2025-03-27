const renderNewMapEventMenu = ({ maps, facing, events }) => {
    return `
        <div class="editor__menu js-menu is-active" id="editor-mapevent-menu">
            <button class="button button--grey button--box editor__close-button js-post-cancel">
                ${window.feather.icons.x.toSvg()}
            </button>
            <div class="editor__label">
                <span class="icon icon--nudge">
                    ${window.feather.icons.clock.toSvg()}
                </span>
                <span>Make a new map event</span>
            </div>
            <div class="txt">
                How map events work:<br />
                Map events are triggered by the player entering a specific tile on a map. 
                They can be used to trigger dialog, spawn npcs, or even start a cutscene.
            </div>
            <!-- coords and spawn are handled in the app code -->
            <div class="editor__setting">
                <div class="select">
                    <select class="select__field js-select js-select-event-type">
                        <option value="">Event type</option>
                        ${events.map( ( event ) => `
                            <option value="${event}">${event}</option>
                        ` ).join( "" )}
                    </select>
                    <span class="select__icon">
                        ${window.feather.icons[ "chevron-down" ].toSvg()}
                    </span>
                </div>
            </div>
            <div class="editor__setting">
                <div class="select">
                    <select class="select__field js-select js-select-facing">
                        <option value="">Direction</option>
                        ${facing.map( ( facing ) => `
                            <option value="${facing}">${facing}</option>
                        ` ).join( "" )}
                    </select>
                    <span class="select__icon">
                        ${window.feather.icons[ "chevron-down" ].toSvg()}
                    </span>
                </div>
            </div>
            <div class="editor__setting">
                <div class="select">
                    <select class="select__field js-select js-select-map">
                        <option value="">Target Map</option>
                        ${maps.map( ( map ) => `
                            <option value="${map.id}">${map.name}</option>
                        ` ).join( "" )}
                    </select>
                    <span class="select__icon">
                        ${window.feather.icons[ "chevron-down" ].toSvg()}
                    </span>
                </div>
            </div>
            <div class="editor__setting">
                <button class="button editor__button editor__upload-button js-post-save" data-type="mapevent">Create</button>
            </div>
        </div>
    `;
};


module.exports = {
    renderNewMapEventMenu,
};