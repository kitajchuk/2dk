import Config from "./Config";



class Dialogue {
    constructor ( gamebox ) {
        this.gamebox = gamebox;
        this.data = null;
        this.ready = false;
        this.pressed = false;
        this.active = false;
        this.isResolve = false;
        this.resolve = null;
        this.reject = null;
        this.timeout = null;
        this.debounce = 750;
        this.duration = 250;
        this.build();
    }


    build () {
        this.element = document.createElement( "div" );
        this.element.className = "_2dk__dialogue";
    }


    write ( text ) {
        this.element.innerHTML = `<div class="_2dk__dialogue__text">${text}</div>`;
    }


    writePrompt ( text ) {
        text.push( `<span class="a">A: ${this.data.yes.label}</span>`);
        text.push( `<span>,&nbsp;</span>`);
        text.push( `<span class="b">B: ${this.data.no.label}</span>`);
    }


    clear () {
        this.element.innerHTML = "";
    }


    auto ( data ) {
        if ( this.active ) {
            return;
        }

        if ( this.timeout ) {
            clearTimeout( this.timeout );
        }

        this.data = structuredClone( data );
        this.element.classList.add( "is-texting" );
        this.write( this.data.text.shift() );
        this.timeout = setTimeout( () => {
            this.teardown();

        }, ( this.debounce * 3 ) );
    }


    play ( data ) {
        if ( this.active ) {
            return;
        }

        this.active = true;

        return new Promise( ( resolve, reject ) => {
            this.data = structuredClone( data );
            this.isResolve = true;
            this.resolve = resolve;
            this.reject = reject;
            this.element.classList.add( "is-texting" );

            const text = [ `<div>${this.data.text.shift()}</div>` ];
            
            if ( !this.data.text.length && this.data.type === Config.dialogue.types.PROMPT ) {
                this.writePrompt( text );
            }

            this.write( text.join( "" ) );

            this.timeout = setTimeout( () => {
                this.ready = true;

            }, this.debounce );
        });
    }


    check ( a, b ) {
        // Inactive dialogue: No ones talking...
        // Active dialogue: Button was press to advance...
        if ( !this.active || !this.ready || ( this.active && this.pressed ) ) {
            return;
        }

        this.pressed = true;

        switch ( this.data.type ) {
            // Plain text...
            case Config.dialogue.types.TEXT:
                this.handleText();
                break;
            // Prompt-based (a:confirm, b: decline)
            case Config.dialogue.types.PROMPT:
                this.handlePrompt( a, b );
                break;
        }
    }


    handleText () {
        if ( this.data.text.length ) {
            this.write( this.data.text.shift() );
            this.timeout = setTimeout( () => {
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
    }


    handlePrompt ( a, b ) {
        // A-button OR B-button will advance as long as there is text...
        if ( this.data.text.length ) {
            const text = [
                `<div>${this.data.text.shift()}</div>`
            ];

            // No more text so show prompts...
            if ( !this.data.text.length ) {
                this.writePrompt( text );
            }

            this.write( text.join( "" ) );
            this.timeout = setTimeout( () => {
                this.pressed = false;

            }, this.debounce );

        // A-button will confirm if there is no more text...
        } else if ( a ) {
            this.isResolve = true;
            this.data.type = Config.dialogue.types.TEXT;
            this.data.text = this.data.yes.text;
            this.timeout = setTimeout( () => {
                this.pressed = false;
                this.check( true, false );

            }, this.duration );

        // B-button will cancel if there is no more text...
        } else if ( b ) {
            this.isResolve = false;
            this.data.type = Config.dialogue.types.TEXT;
            this.data.text = this.data.no.text;
            this.timeout = setTimeout( () => {
                this.pressed = false;
                this.check( false, true );

            }, this.duration );
        }
    }


    teardown () {
        this.element.classList.remove( "is-texting" );
        this.data = null;
        this.ready = false;
        this.pressed = false;
        this.isResolve = false;
        this.resolve = null;
        this.reject = null;
        this.timeout = setTimeout( () => {
            this.clear();
            this.active = false;
            this.timeout = null;

        }, this.duration );
    }
}



export default Dialogue;
