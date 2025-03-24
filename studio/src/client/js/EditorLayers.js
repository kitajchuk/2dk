const Config = require( "./Config" );



class EditorLayers {
    constructor ( editor ) {
        this.editor = editor;
        this.$layers = window.hobo( ".js-edit-layer" );
        this.$hideLayers = window.hobo( ".js-hide-layer" );
        this.$metaLayers = window.hobo( ".js-map-metalayer" );
        this.$document = window.hobo( document );
        this.mode = null;
        this.meta = {
            [ Config.EditorLayers.modes.SPAWN ]: true,
            [ Config.EditorLayers.modes.EVENT ]: true,
        };

        this._bind();
    }


    _bind () {
        this.$layers.on( "click", ( e ) => {
            const $target = window.hobo( e.target );

            if ( this.editor.canMapFunction() && !$target.is( ".js-hide-layer" ) ) {
                this._handleEditLayer( $target );
            }
        });

        this.$hideLayers.on( "click", ( e ) => {
            if ( this.editor.canMapFunction() ) {
                const $target = window.hobo( e.target );
                this._handleHideLayer( $target );
            }
        });

        this.$metaLayers.on( "change", ( e ) => {
            const $target = window.hobo( e.target );
            const layer = $target.attr( "name" );
            const checked = $target.is( ":checked" );

            if ( checked ) {
                this.meta[ layer ] = true;
                this.editor.canvas.show( layer );
            } else {
                this.meta[ layer ] = false;
                this.editor.canvas.hide( layer );
            }

            e.target.blur();
        });
    }


    resetLayers () {
        this.mode = null;
        this.$layers.removeClass( "is-active" );
        this.editor.canvas.setActiveLayer( null );
    }


    _handleEditLayer ( $target ) {
        const $elem = $target.is( ".js-edit-layer" ) ? $target : $target.closest( ".js-edit-layer" );
        const layer = $elem.data().layer.toUpperCase();

        if ( $elem.is( ".is-active" ) ) {
            this.resetLayers();

        } else {
            this.mode = Config.EditorLayers.modes[ layer ];
            this.$layers.removeClass( "is-active" );
            $elem.addClass( "is-active" );
            this.editor.canvas.setActiveLayer( this.mode );

            if ( this.mode === Config.EditorLayers.modes.COLLISION ) {
                this.editor.canvas.clearTileset();
            }
        }
    }


    _handleHideLayer ( $target ) {
        const $elem = $target.is( ".js-hide-layer" ) ? $target : $target.closest( ".js-hide-layer" );
        const layer = $elem.data().layer;

        if ( $elem.is( ".is-active" ) ) {
            $elem.removeClass( "is-active" );
            this.editor.canvas.show( layer );

        } else {
            $elem.addClass( "is-active" );
            this.editor.canvas.hide( layer );
        }
    }
}



// Expose
module.exports = EditorLayers;
