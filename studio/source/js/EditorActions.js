const Config = require( "./Config" );



class EditorActions {
    constructor ( editor ) {
        this.editor = editor;
        this.elements = window.hobo( ".js-edit-action" );
        this.keysDisabled = false;
        this.mode = null;
        this.bind();
    }


    bind () {
        const $document = window.hobo( document );

        $document.on( "keydown", ( e ) => {
            // console.log( "keydown", e );

            if ( this.keysDisabled ) {
                return;
            }

            if ( this.editor.canMapFunction() ) {
                const test = window.hobo( `.js-edit-action[data-key="${e.which}"]` );

                if ( test.length ) {
                    this._handleAction( test );
                }

            }
        });

        $document.on( "click", ".js-edit-action", ( e ) => {
            if ( this.editor.canMapFunction() ) {
                this._handleAction( window.hobo( e.target ) );
            }
        });
    }


    disableKeys () {
        this.keysDisabled = true;
    }


    enableKeys () {
        this.keysDisabled = false;
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

            if ( this.mode !== Config.EditorActions.modes.BRUSH ) {
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
