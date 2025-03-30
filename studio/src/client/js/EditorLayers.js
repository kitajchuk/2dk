const Config = require( "./Config" );



class EditorLayers {
    constructor ( editor ) {
        this.editor = editor;
        this.mode = null;
        this.meta = {
            [ Config.EditorLayers.modes.SPAWN ]: false,
            [ Config.EditorLayers.modes.EVENT ]: false,
            [ Config.EditorLayers.modes.TILES ]: false,
        };
        this.layers = document.querySelectorAll( ".js-edit-layer" );

        this._bind();
    }


    _bind () {
        document.addEventListener( "click", ( e ) => {
            const hide = e.target.closest( ".js-hide-layer" );

            if ( hide && this.editor.canMapFunction() ) {
                this._handleHideLayer( hide );
                return;
            }

            const layer = e.target.closest( ".js-edit-layer" );

            if ( layer && this.editor.canMapFunction() ) {
                this._handleEditLayer( layer );
                return;
            }
        });

        document.addEventListener( "change", ( e ) => {
            const target = e.target.closest( ".js-map-metalayer" );

            if ( !target ) {
                return;
            }

            const layer = target.name;
            const checked = target.checked;

            if ( checked ) {
                this.meta[ layer ] = true;
                this.editor.canvas.show( layer );

            } else {
                this.meta[ layer ] = false;
                this.editor.canvas.hide( layer );
            }

            target.blur();
        });
    }


    resetLayers () {
        this.mode = null;
        this.removeClasses();
        this.editor.canvas.setActiveLayer( null );
    }


    removeClasses () {
        this.layers.forEach( ( layer ) => {
            layer.classList.remove( "is-active" );
        });
    }


    _handleEditLayer ( target ) {
        const elem = target.closest( ".js-edit-layer" );
        const layer = elem.dataset.layer.toUpperCase();

        if ( elem.classList.contains( "is-active" ) ) {
            this.resetLayers();

        } else {
            this.mode = Config.EditorLayers.modes[ layer ];
            this.removeClasses();
            elem.classList.add( "is-active" );
            this.editor.canvas.setActiveLayer( this.mode );

            if ( this.mode === Config.EditorLayers.modes.COLLISION ) {
                this.editor.canvas.clearTileset();
            }
        }
    }


    _handleHideLayer ( target ) {
        const elem = target.closest( ".js-hide-layer" );
        const layer = elem.dataset.layer;

        if ( elem.classList.contains( "is-active" ) ) {
            elem.classList.remove( "is-active" );
            this.editor.canvas.show( layer );

        } else {
            elem.classList.add( "is-active" );
            this.editor.canvas.hide( layer );
        }
    }
}



// Expose
module.exports = EditorLayers;
