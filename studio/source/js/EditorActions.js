const Config = require( "./Config" );
const $ = require( "../../node_modules/properjs-hobo/dist/hobo.build" );



class EditorActions {
    constructor ( editor ) {
        this.editor = editor;
        this.elements = $( ".js-edit-action" );
        this.mode = null;
        this.bind();
    }


    bind () {
        const $document = $( document );

        $document.on( "keydown", ( e ) => {
            // console.log( "keydown", e );

            if ( this.editor.canMapFunction() ) {
                const test = $( `.js-edit-action[data-key="${e.which}"]` );

                if ( test.length ) {
                    this._handleAction( test );
                }

            }
        });

        $document.on( "click", ".js-edit-action", ( e ) => {
            if ( this.editor.canMapFunction() ) {
                this._handleAction( $( e.target ) );
            }
        });
    }


    _handleAction ( targ ) {
        const elem = targ.is( ".js-edit-action" ) ? targ : targ.closest( ".js-edit-action" );
        const action = elem.data().action.toUpperCase();

        if ( elem.is( ".is-active" ) ) {
            this.mode = null;
            this.elements.removeClass( "is-active" );
            this.editor.canvas.clearSelection();

        } else {
            this.elements.removeClass( "is-active" );
            elem.addClass( "is-active" );
            this.mode = Config.EditorActions.modes[ action ];

            // This may be too much
            // Consider: You want to select a tile and then go through your map erasing tiles and painting the new tile
            if ( this.mode === Config.EditorActions.modes.BUCKET || this.mode === Config.EditorActions.modes.ERASE ) {
                this.editor.canvas.clearTileset();
            }

            if ( this.mode !== Config.EditorActions.modes.SELECT ) {
                this.editor.canvas.clearSelection();
            }
        }
    }
}



// Expose
module.exports = EditorActions;
