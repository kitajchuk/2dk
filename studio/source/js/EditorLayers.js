const Config = require( "./Config" );
const $ = require( "../../node_modules/properjs-hobo/dist/hobo.build" );



class EditorLayers {
    constructor ( editor ) {
        this.editor = editor;
        this.elements = $( ".js-edit-layer" );
        this.mode = null;
        this.bind();
    }


    bind () {
        const $document = $( document );

        $document.on( "click", ".js-edit-layer", ( e ) => {
            const targ = $( e.target );

            if ( this.editor.canMapFunction() && !targ.is( ".js-hide-layer" ) ) {
                const elem = targ.is( ".js-edit-layer" ) ? targ : targ.closest( ".js-edit-layer" );
                const layer = elem.data().layer.toUpperCase();
                const mode = Config.EditorLayers.modes[ layer ];

                if ( elem.is( ".is-active" ) ) {
                    this.mode = null;
                    this.elements.removeClass( "is-active" );
                    this.editor.canvas.setActiveLayer( null );

                } else {
                    this.elements.removeClass( "is-active" );
                    elem.addClass( "is-active" );
                    this.mode = mode;
                    this.editor.canvas.setActiveLayer( mode );
                }

                if ( mode === Config.EditorLayers.modes.COLLISION ) {
                    this.editor.canvas.clearTileset();
                }
            }
        });

        $document.on( "click", ".js-hide-layer", ( e ) => {
            if ( editor.canMapFunction() ) {
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
}



// Expose
module.exports = EditorLayers;
