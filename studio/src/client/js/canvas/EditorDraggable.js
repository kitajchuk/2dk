const Config = require( "../Config" );


class EditorDraggable {
    constructor ( editorCanvas ) {
        this.editor = editorCanvas.editor;
        this.editorCanvas = editorCanvas;
        this.canvasPane = editorCanvas.dom.canvasPane;
        this.bounds = this.canvasPane.parentNode;
        this.isSpacebar = false;
        this.isDraggableAlive = false;

        this._bind();
        this._bindEvents();
    }


    reset () {
        this.isDraggableAlive = false;
    }


    update ( map ) {
        this.draggable.update({
            applyBounds: true,
        });
    }


    _bind () {
        this.draggable = window.Draggable.create( this.canvasPane,
            {
                type: "x,y",
                bounds: this.bounds,
                force3D: true,
                throwProps: true,
                dragResistance: 0.3,
                edgeResistance: 0.5,
                cursor: "grab",
                activeCursor: "grabbing",
                onDragStart: () => {
                    this.isDraggableAlive = true;
                },
                onRelease: () => {
                    this.canvasPane.classList.remove( "is-dragging" );
                },
                onPress: () => {
                    this.canvasPane.classList.add( "is-dragging" );
                },
                onThrowComplete: () => {
                    this.isDraggableAlive = false;
                    this.editorCanvas.isMouseDownCanvas = false;

                    if ( !this.isSpacebar ) {
                        this.draggable.disable();
                    }
                },
            }

        )[ 0 ];
        this.draggable.disable();
    }


    _bindEvents () {
        const $document = window.hobo( document );

        $document.on( "keydown", ( e ) => {
            this.isSpacebar = ( e.keyCode === Config.keys.SPACEBAR );

            if ( this.editor.mode !== Config.Editor.modes.SAVING && this.isSpacebar && this.editorCanvas.mode !== Config.EditorCanvas.modes.DRAG ) {
                e.preventDefault();
                this.draggable.enable();
                this.editorCanvas.mode = Config.EditorCanvas.modes.DRAG;
            }
        });

        $document.on( "keyup", ( e ) => {
            this.isSpacebar = false;

            if ( !this.isDraggableAlive ) {
                this.draggable.disable();
            }

            if ( this.editor.mode !== Config.Editor.modes.SAVING && this.editorCanvas.mode === Config.EditorCanvas.modes.DRAG ) {
                e.preventDefault();
                this.editorCanvas.mode = null;
            }
        });
    }
}

module.exports = EditorDraggable;