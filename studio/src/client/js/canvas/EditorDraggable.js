const Config = require( "../Config" );


class EditorDraggable {
    constructor ( editorCanvas ) {
        this.editor = editorCanvas.editor;
        this.editorCanvas = editorCanvas;

        this.isSpacebar = false;
        this.isDraggableAlive = false;

        this.canvasPane = document.getElementById( "editor-canvas-pane" );
        this.canvasBounds = this.canvasPane.parentNode;

        this._bind();
        this._bindEvents();
    }


    update ( map ) {
        this.map = map;
        this.canvasPane.style.width = `${this.map.width}px`;
        this.canvasPane.style.height = `${this.map.height}px`;
        this.canvasPane.classList.add( "is-loaded" );
        this.draggable.update({
            applyBounds: true,
        });
    }


    reset () {
        this.isDraggableAlive = false;
        this.canvasPane.classList.remove( "is-loaded" );
    }


    setLayer ( layer ) {
        this.canvasPane.classList.add( `is-${layer}` );
    }


    resetLayer () {
        const classes = [ 
            "is-npc", 
            "is-obj",
            "is-spawn",
            "is-event",
            "is-tiles",
            "is-collision",
            "is-background",
            "is-foreground",
        ];
        this.canvasPane.classList.remove( ...classes );
    }


    setTool ( tool ) {
        this.canvasPane.classList.add( `is-${tool}-tool` );
    }


    resetTool () {
        const classes = [
            "is-brush-tool",
            "is-erase-tool",
            "is-spawn-tool",
            "is-event-tool",
            "is-tiles-tool",
            "is-select-tool",
        ];
        this.canvasPane.classList.remove( ...classes );
    }


    _bind () {
        this.draggable = window.Draggable.create( this.canvasPane,
            {
                type: "x,y",
                bounds: this.canvasBounds,
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
        document.addEventListener( "keydown", ( e ) => {
            this.isSpacebar = ( e.code === "Space" );

            if ( this.editor.mode !== Config.Editor.modes.SAVING && this.isSpacebar && this.editorCanvas.mode !== Config.EditorCanvas.modes.DRAG ) {
                e.preventDefault();
                this.draggable.enable();
                this.editorCanvas.mode = Config.EditorCanvas.modes.DRAG;
            }
        });

        document.addEventListener( "keyup", ( e ) => {
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