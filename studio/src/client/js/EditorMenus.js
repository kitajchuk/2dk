const Utils = require( "./Utils" );
const { renderSoundMenu } = require( "./render/RenderSoundMenu" );
const { renderNewMapMenu } = require( "./render/RenderNewMapMenu" );
const { renderNewGameMenu } = require( "./render/RenderNewGameMenu" );
const { renderTilesetMenu } = require( "./render/RenderTilesetMenu" );
const { renderActiveMapMenu } = require( "./render/RenderActiveMapMenu" );
const { renderActiveGameMenu } = require( "./render/RenderActiveGameMenu" );
const { renderNewMapEventMenu } = require( "./render/RenderNewMapEventMenu" );
const { renderSpritesheetMenu } = require( "./render/RenderSpritesheetMenu" );
const { renderNewActiveTilesMenu } = require( "./render/RenderNewActiveTilesMenu" );


class EditorMenus {
    constructor ( editor ) {
        this.editor = editor;
        this.dom = {
            container: document.getElementById( "editor-menus" ),
        };
        this.renders = {
            "editor-active-map-menu": renderActiveMapMenu,
            "editor-active-game-menu": renderActiveGameMenu,
            "editor-mapevent-menu": renderNewMapEventMenu,
            "editor-activetiles-menu": renderNewActiveTilesMenu,
            "editor-addsprites-menu": renderSpritesheetMenu,
            "editor-addtiles-menu": renderTilesetMenu,
            "editor-addsound-menu": renderSoundMenu,
            "editor-addgame-menu": renderNewGameMenu,
            "editor-addmap-menu": renderNewMapMenu,
        };

        this._bind();
    }


    // Needed for Sound Player in topbar UI
    buildAssetSelectMenu ( assets ) {
        Utils.buildSelectMenu( document.querySelectorAll( `.js-select-${assets.type}` ), assets.files );
    }


    blurSelectMenus () {
        document.querySelectorAll( ".js-select" ).forEach( ( select ) => {
            select.blur();
        });
    }


    renderMenu ( id, data ) {
        const menu = document.getElementById( id );
        const _render = this.renders[ id ];

        if ( menu && menu.classList.contains( "is-active" ) ) {
            this.removeMenus();

        } else {
            this.removeMenus();
            this.dom.container.classList.add( "is-active" );
            this.dom.container.innerHTML = _render( data );
            this.editor.actions.disableKeys();
        }
    }


    removeMenus () {
        this.dom.container.innerHTML = "";
        this.dom.container.classList.remove( "is-active" );
        this.editor.actions.enableKeys();
    }


    _bind () {
        document.addEventListener( "change", ( e ) => {
            if ( !e.target.closest( ".js-select" ) ) {
                return;
            }

            this.blurSelectMenus();
        });

        document.addEventListener( "change", ( e ) => {
            if ( !this.editor.canGameFunction() ) {
                return false;
            }

            const sampler = e.target.closest( ".js-sound-sampler" );

            if ( sampler && sampler.classList.contains( "is-playing" ) ) {
                Utils.processSound( sampler, this.editor.data.game.id );
            }
        });
    }
}


module.exports = EditorMenus;