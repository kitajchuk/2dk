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
        this.actions = document.querySelectorAll( ".js-edit-action" );

        this._bind();
    }


    _bind () {
        document.addEventListener( "keydown", ( e ) => {
            const testTarget = document.querySelector( `.js-edit-action[data-key="${e.code}"]` );

            if ( this.keysDisabled || !this.editor.canMapFunction() || !testTarget ) {
                return;
            }

            this._handleAction( testTarget );
        });

        document.addEventListener( "click", ( e ) => {
            const target = e.target.closest( ".js-edit-action" );

            if ( !target || !this.editor.canMapFunction() ) {
                return;
            }

            this._handleAction( target );
        });
    }


    resetActions () {
        this.mode = null;
        this.removeClasses();
        this.editor.canvas.setActiveTool( null );
    }


    removeClasses () {
        this.actions.forEach( ( action ) => {
            action.classList.remove( "is-active" );
        });
    }


    disableKeys () {
        this.keysDisabled = true;
    }


    enableKeys () {
        this.keysDisabled = false;
    }


    _handleAction ( target ) {
        const elem = target.closest( ".js-edit-action" );
        const action = elem.dataset.action.toUpperCase();

        if ( elem.classList.contains( "is-active" ) ) {
            this.resetActions();

        } else {
            this.removeClasses();
            elem.classList.add( "is-active" );
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
