const Utils = require( "./Utils" );
const Config = require( "./Config" );



class Dialogue {
    constructor () {
        this.pressed = false;
        this.ready = false;
        this.async = 10;
        this.timeout = null;
        this.debounce = 1000;
        this.build();
    }


    build () {
        this.element = document.createElement( "div" );
        this.element.className = "_2dk__dialogue";
    }


    setReady () {
        this.ready = false;

        this.timeout = setTimeout(() => {
            this.ready = true;

        }, this.debounce );
    }


    play ( data ) {
        if ( this.active ) {
            return;
        }

        // console.log( "play", data );

        this.data = Utils.copy( data );
        this.active = true;

        return new Promise(( resolve, reject ) => {
            this.resolve = resolve;
            this.reject = reject;
            this.element.innerHTML = this.data.text.shift();

            setTimeout(() => {
                this.element.classList.add( `_2dk__dialogue--${this.data.type}` );
                this.element.classList.add( "is-texting" );

            }, this.async );

            this.setReady();
        });
    }


    check ( a, b ) {
        if ( !this.active ) {
            return;
        }

        if ( !this.ready && this.timeout ) {
            // console.log( "debounce ready timer" );
            clearTimeout( this.timeout );
            this.setReady();
            return;
        }

        if ( this.data.type === "text" ) {
            if ( this.data.text.length ) {
                this.element.innerHTML = this.data.text.shift();
                this.setReady();

            } else {
                this.resolve();
                this.teardown();
            }

        } else if ( this.data.type === "prompt" ) {
            if ( a ) {
                if ( this.data.text.length ) {
                    this.element.innerHTML = this.data.text.shift();
                    this.setReady();

                } else {
                    this.resolve();
                    this.teardown();
                }

            } else if ( b ) {
                this.reject();
                this.teardown();
            }
        }
    }


    teardown () {
        this.element.classList.remove( `_2dk__dialogue--${this.data.type}` );
        this.element.classList.remove( "is-texting" );

        setTimeout(() => {
            this.element.innerHTML = "";
            this.data = null;
            this.ready = false;
            this.active = false;

        }, this.timeout );
    }
}



module.exports = Dialogue;
