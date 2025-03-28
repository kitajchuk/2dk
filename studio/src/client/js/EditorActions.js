const Config = require( "./Config" );



class EditorActions {
    constructor ( editor ) {
        this.editor = editor;
        this.mode = null;
        this.keysDisabled = false;
        this.specialTools = [
            Config.EditorActions.modes.SPAWN,
            Config.EditorActions.modes.EVENT,
            Config.EditorActions.modes.TILES,
        ];

        this.$actions = window.hobo( ".js-edit-action" );
        this.$document = window.hobo( document );
        
        this._bind();
    }


    _bind () {
        this.$document.on( "keydown", ( e ) => {
            if ( this.keysDisabled ) {
                return;
            }

            if ( this.editor.canMapFunction() ) {
                const $test = window.hobo( `.js-edit-action[data-key="${e.keyCode}"]` );

                if ( $test.length ) {
                    this._handleAction( $test );
                }

            }
        });

        this.$actions.on( "click", ( e ) => {
            if ( this.editor.canMapFunction() ) {
                const $target = window.hobo( e.target );
                this._handleAction( $target );
            }
        });
    }


    resetActions () {
        this.mode = null;
        this.$actions.removeClass( "is-active" );
        this.editor.canvas.setActiveTool( null );
    }


    disableKeys () {
        this.keysDisabled = true;
    }


    enableKeys () {
        this.keysDisabled = false;
    }


    _handleAction ( $target ) {
        const $elem = $target.is( ".js-edit-action" ) ? $target : $target.closest( ".js-edit-action" );
        const action = $elem.data().action.toUpperCase();

        if ( $elem.is( ".is-active" ) ) {
            this.resetActions();

        } else {
            this.$actions.removeClass( "is-active" );
            $elem.addClass( "is-active" );
            this.mode = Config.EditorActions.modes[ action ];
            this.editor.canvas.setActiveTool( this.mode );
            
            if ( this.mode !== Config.EditorActions.modes.BRUSH ) {
                this.editor.canvas.clearTileset();
            }
        }
    }
}



// Expose
module.exports = EditorActions;
