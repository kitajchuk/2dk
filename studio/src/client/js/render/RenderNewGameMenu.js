const { html } = require( "./Render" );



const renderNewGameMenu = () => {
    return html`
        <div class="editor__menu js-menu is-active" id="editor-addgame-menu">
            <button class="button button--grey button--box editor__close-button js-post-cancel" data-type="game">
                ${window.feather.icons.x.toSvg()}
            </button>
            <div class="editor__label">
                <span class="icon icon--nudge">
                    ${window.feather.icons.tv.toSvg()}
                </span>
                <span>Make a new game</span>
            </div>
            <div class="txt">
                How games work:<br />
                Screen width and height define the visible play area for your game. 
                We call this the Camera and your maps scroll within these bounds.
            </div>
            <div class="editor__setting">
                <div class="editor__label">Game name</div>
                <input class="input editor__field js-addgame-field" type="text" placeholder="Game name" name="name" />
            </div>
            <div class="editor__setting">
                <div class="editor__label">Currency</div>
                <input class="input editor__field js-addgame-field" type="text" placeholder="Currency" name="currency" />
            </div>
            <div class="editor__setting editor__setting--multi">
                <div>
                    <div class="editor__label">Screen width</div>
                    <input class="input editor__field js-addgame-field" type="number" placeholder="Screen width" name="width" />
                </div>
                <div>
                    <div class="editor__label">Screen height</div>
                    <input class="input editor__field js-addgame-field" type="number" placeholder="Screen height" name="height" />
                </div>
            </div>
            <div class="editor__setting">
                <div class="editor__label">Tilesize</div>
                <input class="input editor__field js-addgame-field" type="number" placeholder="Tilesize" name="tilesize" />
            </div>
            <div class="editor__setting editor__setting--multi">
                <div>
                    <div class="editor__label">World Map Tile width</div>
                    <input class="input editor__field js-addgame-field" type="number" placeholder="World Map Tile width" name="worldtilewidth" />
                </div>
                <div>
                    <div class="editor__label">World Map Tile height</div>
                    <input class="input editor__field js-addgame-field" type="number" placeholder="World Map Tile height" name="worldtileheight" />
                </div>
            </div>
            <div class="editor__setting editor__setting--multi">
                <div>
                    <div class="editor__label">Indoor Map Tile width</div>
                    <input class="input editor__field js-addgame-field" type="number" placeholder="Indoor Map Tile width" name="indoortilewidth" />
                </div>
                <div>
                    <div class="editor__label">Indoor Map Tile height</div>
                    <input class="input editor__field js-addgame-field" type="number" placeholder="Indoor Map Tile height" name="indoortileheight" />
                </div>
            </div>
            <div class="editor__setting">
                <div class="editor__checkbox">
                    <label class="checkbox">
                        <input class="check js-addgame-field" type="checkbox" name="diagonaldpad" checked />
                        <span class="label">Diagonal D-Pad (for diagonal movement)</span>
                    </label>
                </div>
            </div>
            <div class="editor__setting">
                <div class="editor__label">B Button</div>
                <div class="editor__checkbox">
                    <label class="checkbox">
                        <input class="check js-addgame-field" value="${window.lib2dk.Config.verbs.ATTACK}" type="radio" name="bButton" checked />
                        <span class="label">Attack</span>
                    </label>
                    <label class="checkbox">
                        <input class="check js-addgame-field" value="${window.lib2dk.Config.verbs.RUN}" type="radio" name="bButton" />
                        <span class="label">Run</span>
                    </label>
                </div>
            </div>
            <div class="editor__setting">
                <div class="editor__label">Resolution</div>
                <div class="editor__checkbox">
                    <label class="checkbox">
                        <input class="check js-addgame-field" value="2" type="radio" name="maxresolution" checked />
                        <span class="label">2x</span>
                    </label>
                    <label class="checkbox">
                        <input class="check js-addgame-field" value="1" type="radio" name="maxresolution" />
                        <span class="label">1x</span>
                    </label>
                </div>
            </div>
            <div class="editor__setting">
                <button class="button editor__button editor__upload-button js-post-save" data-type="game">Create</button>
            </div>
        </div>
    `;
}


module.exports = {
    renderNewGameMenu,
};
