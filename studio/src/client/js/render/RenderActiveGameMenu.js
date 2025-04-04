const { html } = require( "./Render" );



const renderActiveGameMenu = ( game ) => {
    return html`
        <div class="editor__menu js-menu is-active" id="editor-active-game-menu">
            <button class="button button--grey button--box editor__close-button js-close-settings">
                ${window.feather.icons.x.toSvg()}
            </button>
            <div class="editor__setting">
                <div class="editor__label">
                    <span class="icon icon--nudge">
                        ${window.feather.icons.tv.toSvg()}
                    </span>
                    <span>Game Settings</span>
                </div>
            </div>
            <div class="editor__setting">
                <div class="editor__label">Game name</div>
                <input class="input editor__field" type="text" name="name" value="${game.name}" readonly disabled />
            </div>
            <div class="editor__setting editor__setting--multi">
                <div>
                    <div class="editor__label">Save version</div>
                    <input class="input editor__field" type="text" name="save" value="${game.save}" readonly disabled />
                </div>
                <div>
                    <div class="editor__label">Release version</div>
                    <input class="input editor__field" type="text" name="release" value="${game.release}" readonly disabled />
                </div>
            </div>
            <div class="editor__setting editor__setting--multi">
                <div>
                    <div class="editor__label">Screen width</div>
                    <input class="input editor__field" type="number" name="width" value="${game.width}" readonly disabled />
                </div>
                <div>
                    <div class="editor__label">Screen height</div>
                    <input class="input editor__field" type="number" name="height" value="${game.height}" readonly disabled />
                </div>
            </div>
            <div class="editor__setting">
                <div class="editor__checkbox">
                    <label class="checkbox">
                        <input class="check js-addgame-field" type="checkbox" name="diagonaldpad"${game.diagonaldpad ? " checked" : ""} readonly disabled />
                        <span class="label">Diagonal D-Pad (${game.diagonaldpad ? "enabled" : "disabled"})</span>
                    </label>
                </div>
            </div>
            <div class="editor__setting">
                <div class="editor__label">B Button</div>
                <div class="editor__checkbox">
                    <label class="checkbox">
                        <input class="check js-addgame-field" value="${window.lib2dk.Config.verbs.ATTACK}" type="radio" name="bButton" ${game.bButton === window.lib2dk.Config.verbs.ATTACK ? "checked" : ""} readonly disabled />
                        <span class="label">Attack</span>
                    </label>
                    <label class="checkbox">
                        <input class="check js-addgame-field" value="${window.lib2dk.Config.verbs.RUN}" type="radio" name="bButton" ${game.bButton === window.lib2dk.Config.verbs.RUN ? "checked" : ""} readonly disabled />
                        <span class="label">Run</span>
                    </label>
                </div>
            </div>
            <div class="editor__setting">
                <div class="editor__label">Resolution (${game.maxresolution}x)</div>
                <div class="editor__checkbox">
                    <label class="checkbox">
                        <input class="check js-addgame-field" value="2" type="radio" name="maxresolution" ${game.maxresolution === 2 ? "checked" : ""} readonly disabled />
                        <span class="label">2x</span>
                    </label>
                    <label class="checkbox">
                        <input class="check js-addgame-field" value="1" type="radio" name="maxresolution" ${game.maxresolution === 1 ? "checked" : ""} readonly disabled />
                        <span class="label">1x</span>
                    </label>
                </div>
            </div>
            <div class="editor__setting">
                <div class="editor__label">Webapp icon (square PNG format, at lease 1024x1024 pixels)</div>
                <div class="editor__upload">
                    <button class="button editor__upload__button editor__button">
                        <span class="icon icon--nudge">
                            ${window.feather.icons[ "upload-cloud" ].toSvg()}
                        </span>
                        <span>PNG</span>
                    </button>
                    <input value="${game.icon}" class="input editor__upload__field editor__field js-upload-field" type="text" placeholder="Choose a file" name="icon_copy" id="editor-game-icon" />
                    <input class="editor__upload__mask js-upload-file" type="file" name="icon" data-target="editor-game-icon" />
                </div>
            </div>
            <div class="editor__setting">
                <img src="./games/${game.id}/${game.icon}?buster=${Date.now()}" id="editor-game-icon-image" name="icon_image" />
            </div>
            <div class="editor__setting">
                <button class="button button--red editor__button editor__delete-button js-delete-game">Delete game</button>
            </div>
        </div>
    `;
};


module.exports = {
    renderActiveGameMenu,
};