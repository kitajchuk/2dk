// A cleanup of the original ProperJS Controller
// https://github.com/kitajchuk/Controller
import Utils from "./Utils";

class Controller {
    constructor ( fps = 60, ctrlFPS = false ) {
        this.handlers = {};
        this.animate = null;
        this.started = false;
        this.cycle = null;
        this.interval = 1000 / fps;
        this.frame = 0;
        this.then = null;
        this.now = null;
        this.fps = fps;
        this.ctrlFPS = ctrlFPS;
        this.fpsThen = null;
        this.actualFPS = 0;
    }


    go ( callback ) {
        if ( this.started ) {
            return this;
        }

        this.frame = 0;
        this.started = true;
        this.then = performance.now();
        this.fpsThen = performance.now();
        this.actualFPS = this.fps;

        this.animate = ( timestamp ) => {
            this.cycle = window.requestAnimationFrame( this.animate );
            this.now = timestamp;
            this.frame++;

            if ( this.ctrlFPS ) {
                const delta = this.now - this.then;

                if ( delta >= this.interval ) {
                    this.then = this.now - ( delta % this.interval );
                    this.updateFPS( timestamp );
                    callback( timestamp );
                }

            // Uncontrolled FPS
            } else {
                this.updateFPS( timestamp );
                callback( timestamp );
            }

        };

        this.cycle = window.requestAnimationFrame( this.animate );
    }


    updateFPS ( timestamp ) {
        const elapsed = ( timestamp - this.fpsThen ) / 1000;

        if ( elapsed >= 1 ) {
            this.actualFPS = Math.round( this.frame / elapsed );
            this.frame = 0;
            this.fpsThen = timestamp;
        }
    }


    stop () {
        window.cancelAnimationFrame( this.cycle );

        this.animate = null;
        this.started = false;
        this.cycle = null;
        this.then = null;
        this.now = null;
        this.frame = 0;
        this.fpsThen = null;
        this.actualFPS = this.fps;
    }


    on ( event, handler ) {
        const events = event.split( " " );

        events.forEach( ( event ) => {
            if ( Utils.func( handler ) ) {
                if ( !this.handlers[ event ] ) {
                    this.handlers[event ] = [];
                }

                this.handlers[ event ].push( handler );
            }
        });
    }


    off ( event, handler ) {
        if ( !this.handlers[ event ] ) {
            return this;
        }

        if ( handler ) {
            for ( let i = this.handlers[ event ].length; i--; ) {
                if ( this.handlers[ event ][ i ] === handler ) {
                    this.handlers[ event ].splice( i, 1 );

                    break;
                }
            }

        } else {
            delete this.handlers[ event ];
        }
    }


    emit ( event, ...args ) {
        if ( !this.handlers[ event ] ) {
            return this;
        }

        this.handlers[ event ].forEach( ( handler ) => {
            handler.apply( this, args );
        });
    }
}



export default Controller;
