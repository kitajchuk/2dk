const Utils = require( "./Utils" );



class Dialogue {
    constructor () {
        this.ready = false;
        this.pressed = false;
        this.active = false;
        this.autoplay = false;
        this.timeout = null;
        this.debounce = 750;
        this.duration = 250;
        this.build();
    }


    build () {
        this.element = document.createElement( "div" );
        this.element.className = "_2dk__dialogue";
    }


    auto ( data ) {
        if ( this.active ) {
            return;
        }

        if ( this.timeout ) {
            clearTimeout( this.timeout );
        }

        if ( this.data ) {
            this.element.classList.remove( `_2dk__dialogue--${this.data.type}` );
        }

        this.data = Utils.copy( data );
        this.element.classList.add( `_2dk__dialogue--${this.data.type}` );
        this.element.classList.add( "is-texting" );
        this.element.innerHTML = this.data.text.shift();
        this.timeout = setTimeout(() => {
            this.teardown();

        }, (this.debounce * 3) );
    }


    play ( data ) {
        if ( this.active ) {
            return;
        }

        this.active = true;

        return new Promise(( resolve, reject ) => {
            this.data = Utils.copy( data );
            this.isResolve = true;
            this.resolve = resolve;
            this.reject = reject;
            this.element.classList.add( `_2dk__dialogue--${this.data.type}` );
            this.element.classList.add( "is-texting" );
            this.element.innerHTML = this.data.text.shift();
            this.timeout = setTimeout(() => {
                this.ready = true;

            }, this.debounce );
        });
    }


    check ( a, b ) {
        // Inactive dialogue: No ones talking...
        // Active dialogue: Button was press to advance...
        if ( !this.active || !this.ready || (this.active && this.pressed) ) {
            return;
        }

        this.pressed = true;

        // Plain text...
        if ( this.data.type === "text" ) {
            if ( this.data.text.length ) {
                this.element.innerHTML = this.data.text.shift();
                this.timeout = setTimeout(() => {
                    this.pressed = false;

                }, this.debounce );

            } else {
                if ( this.isResolve ) {
                    this.resolve();

                } else {
                    this.reject();
                }

                this.teardown();
            }

        // Prompt-based (a:confirm, b: decline)
        } else if ( this.data.type === "prompt" ) {
            // A-button OR B-button will advance as long as there is text...
            if ( this.data.text.length ) {
                const text = [this.data.text.shift()];

                // No more text so show prompts...
                if ( !this.data.text.length ) {
                    text.push( `<span class="teal">A: ${this.data.yes.label}</span>, <span class="blue">B: ${this.data.no.label}</span>` );
                }

                this.element.innerHTML = text.join( "<br />" );
                this.timeout = setTimeout(() => {
                    this.pressed = false;

                }, this.debounce );

            // A-button will confirm if there is no more text...
            } else if ( a && !this.data.text.length ) {
                this.isResolve = true;
                this.data.type = "text";
                this.data.text = this.data.yes.text;
                this.timeout = setTimeout(() => {
                    this.pressed = false;
                    this.check( true, false );

                }, this.duration );

            // B-button will cancel if there is no more text...
            } else if ( b && !this.data.text.length ) {
                this.isResolve = false;
                this.data.type = "text";
                this.data.text = this.data.no.text;
                this.timeout = setTimeout(() => {
                    this.pressed = false;
                    this.check( false, true );

                }, this.duration );
            }
        }
    }


    teardown () {
        this.element.classList.remove( `_2dk__dialogue--${this.data.type}` );
        this.element.classList.remove( "is-texting" );
        this.data = null;
        this.ready = false;
        this.pressed = false;
        this.timeout = null;

        setTimeout(() => {
            this.element.innerHTML = "";
            this.active = false;

        }, this.duration );
    }
}



module.exports = Dialogue;
