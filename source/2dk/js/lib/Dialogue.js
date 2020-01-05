const { TweenLite } = require( "gsap" );



class Dialogue {
    constructor ( data, gamebox ) {
        this.data = data;
        this.gamebox = gamebox;
        this.ready = false;
        this.async = 10;
        this.timeout = 1200;
        this.element = document.createElement( "div" );
        this.element.className = `_2dk__dialogue _2dk__dialogue--${data.type}`;
    }


    setReady () {
        this.ready = false;

        setTimeout(() => {
            this.ready = true;

        }, this.timeout );
    }


    play () {
        return new Promise(( resolve, reject ) => {
            this.resolve = resolve;
            this.reject = reject;
            this.element.innerHTML = this.data.text.shift();
            this.gamebox.screen.appendChild( this.element );

            setTimeout(() => {
                this.element.classList.add( "is-texting" );

            }, this.async );

            this.setReady();
        });
    }


    press ( a, b ) {
        if ( this.data.type === "text" ) {
            if ( this.data.text.length ) {
                this.element.innerHTML = this.data.text.shift();
                this.setReady();

            } else {
                this.resolve();
                this.destroy();
            }

        } else if ( this.data.type === "prompt" ) {
            if ( a ) {
                if ( this.data.text.length ) {
                    this.element.innerHTML = this.data.text.shift();
                    this.setReady();

                } else {
                    this.resolve();
                    this.destroy();
                }

            } else if ( b ) {
                this.reject();
                this.destroy();
            }
        }
    }


    destroy () {
        this.element.parentNode.removeChild( this.element );
        this.element = null;
        this.data = null;
    }
}



module.exports = Dialogue;
