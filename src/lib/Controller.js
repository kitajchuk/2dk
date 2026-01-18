// A cleanup of the original ProperJS Controller
// https://github.com/kitajchuk/Controller
export default class Controller {
    constructor () {
        this.handlers = {};
        this.animate = null;
        this.started = false;
        this.cycle = null;
    }


    go ( callback ) {
        if ( this.started ) {
            return this;
        }

        this.started = true;
        this.animate = ( currentTime ) => {
            callback( currentTime );
            this.cycle = window.requestAnimationFrame( this.animate );
        };
        this.cycle = window.requestAnimationFrame( this.animate );
    }


    stop () {
        window.cancelAnimationFrame( this.cycle );
        this.animate = null;
        this.started = false;
        this.cycle = null;
    }


    on ( event, handler ) {
        const events = event.split( " " );

        events.forEach( ( event ) => {
            if ( !this.handlers[ event ] ) {
                this.handlers[event ] = [];
            }

            this.handlers[ event ].push( handler );
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
