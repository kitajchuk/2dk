const Config = require( "./Config" );
const $ = require( "../node_modules/properjs-hobo/dist/hobo.build" );



class EditorLayers {
    constructor ( editor ) {
        this.editor = editor;
        this.elements = $( ".js-edit-layer" );
        this.mode = null;
        this.bind();
    }

    setMode ( mode ) {
        this.mode = mode;
    }

    getMode () {
        return this.mode;
    }

    bind () {
        const $document = $( document );

        $document.on( "click", ".js-edit-layer", ( e ) => {
            const targ = $( e.target );

            if ( this.editor.canFunction() && !targ.is( ".js-hide-layer" ) ) {
                const elem = targ.is( ".js-edit-layer" ) ? targ : targ.closest( ".js-edit-layer" );
                const layer = elem.data().layer.toUpperCase();
                const mode = Config.EditorLayers.modes[ layer ];

                if ( elem.is( ".is-active" ) ) {
                    this.reset();

                } else {
                    this.elements.removeClass( "is-active" );
                    elem.addClass( "is-active" );
                    this.setMode( mode );
                }

                if ( mode === Config.EditorLayers.modes.COLLISION ) {
                    this.editor.canvas.clearTileset();
                }
            }
        });

        $document.on( "click", ".js-hide-layer", ( e ) => {
            if ( editor.canFunction() ) {
                const targ = $( e.target );
                const elem = targ.is( ".js-hide-layer" ) ? targ : targ.closest( ".js-hide-layer" );
                const layer = elem.data().layer;

                if ( elem.is( ".is-active" ) ) {
                    elem.removeClass( "is-active" );
                    this.editor.canvas.show( layer );

                } else {
                    elem.addClass( "is-active" );
                    this.editor.canvas.hide( layer );
                }
            }
        });
    }

    reset () {
        this.mode = null;
        this.elements.removeClass( "is-active" );
    }
}



// Expose
module.exports = EditorLayers;
