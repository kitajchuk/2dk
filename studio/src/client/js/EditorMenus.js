const Utils = require( "./Utils" );


class EditorMenus {
    constructor ( editor ) {
        this.editor = editor;
        this.menus = {
            all: window.hobo( ".js-menu" ),
            container: window.hobo( "#editor-menus" ),
            activeMap: window.hobo( "#editor-active-map-menu" ),
            activeGame: window.hobo( "#editor-active-game-menu" ),
            activeTiles: window.hobo( "#editor-activetiles-menu" ),
            mapEvent: window.hobo( "#editor-mapevent-menu" ),
        };
        this.selects = {
            all: window.hobo( ".js-select" ),
            maps: window.hobo( ".js-select-map" ),
            tiles: window.hobo( ".js-select-tiles" ),
            sounds: window.hobo( ".js-select-sound" ),
            sprites: window.hobo( ".js-select-sprites" ),
            actions: window.hobo( ".js-select-action" ),
            facing: window.hobo( ".js-select-facing" ),
            events: window.hobo( ".js-select-event-type" ),
            maps: window.hobo( ".js-select-map" ),
        };

        this._bind();
    }


    buildMapSelectMenus ( maps ) {
        Utils.buildSelectMenu( this.selects.maps, maps );
    }


    buildAssetSelectMenu ( assets ) {
        if ( this.selects[ assets.type ] ) {
            Utils.buildSelectMenu( this.selects[ assets.type ], assets.files );
        }
    }


    buildConfigSelectMenus () {
        Utils.buildSelectMenu( this.selects.actions, window.lib2dk.Config.verbs );
        Utils.buildSelectMenu( this.selects.facing, window.lib2dk.Config.facing );
        Utils.buildSelectMenu( this.selects.events, window.lib2dk.Config.events );
    }


    blurSelectMenus () {
        this.selects.all.forEach( ( select ) => {
            select.blur();
        });
    }


    toggleMenu ( id ) {
        const $menu = window.hobo( `#${id}` );

        if ( $menu.is( ".is-active" ) ) {
            this.closeMenus();
            this.clearMenu( $menu );

        } else {
            this.closeMenus();
            this.menus.container.addClass( "is-active" );
            $menu.addClass( "is-active" );
            this.editor.actions.disableKeys();
        }
    }


    closeMenus () {
        this.menus.all.removeClass( "is-active" );
        this.menus.container.removeClass( "is-active" );
        this.editor.actions.enableKeys();
    }


    clearMenu ( $menu ) {
        const $inputs = $menu.find( ".editor__field, .select__field" );
        const $checks = $menu.find( ".check" );

        $inputs.forEach( ( input ) => {
            input.value = "";
        });

        $checks.forEach( ( check ) => {
            check.checked = false;
        });
    }


    prefillGameFields ( game ) {
        this.menus.activeGame.find( "[name='name']" )[ 0 ].value = game.name;
        this.menus.activeGame.find( "[name='width']" )[ 0 ].value = game.width;
        this.menus.activeGame.find( "[name='height']" )[ 0 ].value = game.height;
        this.menus.activeGame.find( "[name='save']" )[ 0 ].value = game.save;
        this.menus.activeGame.find( "[name='release']" )[ 0 ].value = game.release;
        this.menus.activeGame.find( "[name='icon_copy']" )[ 0 ].value = game.icon;
        this.menus.activeGame.find( "[name='icon_image']" )[ 0 ].src = `./games/${game.id}/${game.icon}`;
    }


    prefillMapFields ( map ) {
        this.menus.activeMap.find( "[name='name']" )[ 0 ].value = map.name;
        this.menus.activeMap.find( "[name='tilesize']" )[ 0 ].value = map.tilesize;
        this.menus.activeMap.find( "[name='tilewidth']" )[ 0 ].value = map.tilewidth;
        this.menus.activeMap.find( "[name='tileheight']" )[ 0 ].value = map.tileheight;
        this.menus.activeMap.find( "[name='image']" )[ 0 ].value = map.image.split( "/" ).pop();

        if ( map.sound ) {
            this.menus.activeMap.find( "[name='sound']" )[ 0 ].value = map.sound.split( "/" ).pop();
        }
    }


    _bind () {
        this.selects.all.on( "change", () => {
            this.blurSelectMenus();
        });

        this.selects.sounds.on( "change", ( e ) => {
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