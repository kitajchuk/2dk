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
        this.menus = {
            all: window.hobo( ".js-menu" ),
            container: document.getElementById( "editor-menus" ),
            activeTiles: window.hobo( "#editor-activetiles-menu" ),
            mapEvent: window.hobo( "#editor-mapevent-menu" ),
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
        Utils.buildSelectMenu( window.hobo( `.js-select-${assets.type}` ), assets.files );
    }


    blurSelectMenus () {
        window.hobo( ".js-select" ).forEach( ( select ) => {
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
            this.menus.container.classList.add( "is-active" );
            this.menus.container.innerHTML = _render( data );
            this.editor.actions.disableKeys();
        }
    }


    removeMenus () {
        this.menus.container.innerHTML = "";
        this.menus.container.classList.remove( "is-active" );
        this.editor.actions.enableKeys();
    }


    _bind () {
        window.hobo( ".js-select" ).on( "change", () => {
            this.blurSelectMenus();
        });

        window.hobo( ".js-select-sounds" ).on( "change", ( e ) => {
            if ( !this.editor.canGameFunction() ) {
                return false;
            }

            const targ = window.hobo( e.target );
            const sampler = targ.is( ".js-sound-sampler" ) ? targ : targ.closest( ".js-sound-sampler" );

            if ( sampler.length && sampler.is( ".is-playing" ) ) {
                Utils.processSound( sampler, this.editor.data.game.id );
            }
        });
    }
}


module.exports = EditorMenus;