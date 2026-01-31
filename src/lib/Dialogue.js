import Config from "./Config";
import { renderDialogueText, renderDialoguePrompt } from "./DOM";



export default class Dialogue {
    constructor ( gamebox ) {
        this.gamebox = gamebox;
        this.player = this.gamebox.player;
        this.data = null;
        this.ready = false;
        this.pressed = false;
        this.active = false;
        this.isAuto = false;
        this.isResolve = false;
        this.resolve = null;
        this.reject = null;
        this.timeout = null;
        this.debounce = 750;
        this.duration = 250;
        this.build();
    }


    destroy () {
        this.teardown();
        this.element.remove();
    }


    build () {
        this.element = document.createElement( "div" );
        this.element.className = "_2dk__dialogue";
        this.player.screen.appendChild( this.element );
    }


    writeText ( text ) {
        this.element.innerHTML = renderDialogueText( text );
    }


    writePrompt ( text ) {
        this.writeText( renderDialoguePrompt( text, this.data ) );
    }


    clearText () {
        this.element.innerHTML = "";
    }

    
    clearTimeout () {
        clearTimeout( this.timeout );
        this.timeout = null;
    }


    auto ( data ) {
        if ( this.active ) {
            return;
        }

        this.clearTimeout();
        
        this.isAuto = true;
        this.data = structuredClone( data );
        this.element.classList.add( "is-texting" );
        this.writeText( this.data.text.shift() );
        this.timeout = setTimeout( () => {
            this.teardown();

        }, ( this.debounce * 3 ) );
    }


    play ( data ) {
        if ( this.active || this.isAuto ) {
            this.reset();
        }

        this.active = true;

        return new Promise( ( resolve, reject ) => {
            this.data = structuredClone( data );
            this.isResolve = true;
            this.resolve = resolve;
            this.reject = reject;
            this.element.classList.add( "is-texting" );

            const text = this.data.text.shift();
            
            if ( !this.data.text.length && this.data.type === Config.dialogue.types.PROMPT ) {
                this.writePrompt( text );

            } else {
                this.writeText( text );
            }

            this.timeout = setTimeout( () => {
                this.ready = true;

            }, this.duration );
        });
    }


    check ( btn ) {
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
            // Prompt-based (A:Confirm, B:Decline)
            case Config.dialogue.types.PROMPT:
                this.handlePrompt( btn );
                break;
        }
    }


    handleText () {
        if ( this.data.text.length ) {
            this.writeText( this.data.text.shift() );
            this.timeout = setTimeout( () => {
                this.pressed = false;

            }, this.duration );

        } else {
            if ( this.isResolve ) {
                this.resolve();

            } else {
                this.reject();
            }

            this.teardown();
        }
    }


    handlePrompt ( btn ) {
        // A-button OR B-button will advance as long as there is text...
        if ( this.data.text.length ) {
            const text = this.data.text.shift();

            // No more text so show prompts...
            if ( !this.data.text.length ) {
                this.writePrompt( text );

            } else {
                this.writeText( text );
            }

            this.timeout = setTimeout( () => {
                this.pressed = false;

            }, this.duration );

            return;
        }
        
        switch ( btn ) {
            // A-button will confirm if there is no more text...
            case "A":
                this.isResolve = true;
                this.data.type = Config.dialogue.types.TEXT;
                this.data.text = this.data.yes.text;
                this.timeout = setTimeout( () => {
                    this.pressed = false;
                    // Send it back through the check() -> handleText() -> teardown()
                    this.check( "A" );

                }, this.duration );
                break;
            // B-button will cancel if there is no more text...
            case "B":
                this.isResolve = false;
                this.data.type = Config.dialogue.types.TEXT;
                this.data.text = this.data.no.text;
                this.timeout = setTimeout( () => {
                    this.pressed = false;
                    // Send it back through the check() -> handleText() -> teardown()
                    this.check( "B" );

                }, this.duration );
                break;
        }
    }


    reset () {
        this.clearTimeout();
        this.data = null;
        this.ready = false;
        this.pressed = false;
        this.isAuto = false;
        this.isResolve = false;
        this.resolve = null;
        this.reject = null;
    }


    teardown () {
        this.reset();
        this.element.classList.remove( "is-texting" );
        this.timeout = setTimeout( () => {
            this.clearText();
            this.active = false;
            this.timeout = null;

        }, this.duration );
    }
}
