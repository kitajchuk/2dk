/*******************************************************************************
* MapLayer
* Normalize a rendering layer for Canvas and Context.
*******************************************************************************/
class MapLayer {
    constructor ( data ) {
        this.data = data;
        this.build();
    }


    build () {
        this.canvas = document.createElement( "canvas" );
        this.canvas.className = "_2dk__layer";
        this.canvas.dataset.layer = this.data.id;
        this.context = this.canvas.getContext( "2d" );
        this.update( this.data.width, this.data.height );
    }


    update ( width, height ) {
        this.data.width = width;
        this.data.height = height;
        this.canvas.style.width = `${width}px`;
        this.canvas.style.height = `${height}px`;
        this.canvas.width = width;
        this.canvas.height = height;
    }


    clear () {
        this.context.clearRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );
    }


    destroy () {
        this.clear();
        this.canvas.width = 0;
        this.canvas.height = 0;
        this.context = null;
        this.canvas = null;
    }
}


export default MapLayer;
