const Config = require( "./Config" );
const $ = require( "../../node_modules/properjs-hobo/dist/hobo.build" );



class EditorActions {
    constructor ( editor ) {
        this.editor = editor;
        this.elements = $( ".js-edit-action" );
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
        $( document ).on( "click", ".js-edit-action", ( e ) => {
            if ( this.editor.canMapFunction() ) {
                const targ = $( e.target );
                const elem = targ.is( ".js-edit-action" ) ? targ : targ.closest( ".js-edit-action" );
                const action = elem.data().action.toUpperCase();

                if ( elem.is( ".is-active" ) ) {
                    this.reset();
                    this.editor.canvas.setActiveTiles( false );

                } else {
                    this.elements.removeClass( "is-active" );
                    elem.addClass( "is-active" );

                    this.setMode( Config.EditorActions.modes[ action ] );
                    this.editor.canvas.setActiveTiles( true );

                    if ( this.mode === Config.EditorActions.modes.BUCKET || this.mode === Config.EditorActions.modes.TRASH ) {
                        this.editor.canvas.clearTileset();
                    }
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
module.exports = EditorActions;
