const renderNewGameMenu = () => {
    return `
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
                <button class="button editor__button editor__upload-button js-post-save" data-type="game">Create</button>
            </div>
        </div>
    `;
}


module.exports = {
    renderNewGameMenu,
};
