class Dialogue {
    constructor ( gamebox ) {
        this.gamebox = gamebox;
        this.ready = false;
        this.async = 10;
        this.timeout = 1000;
        this.build();
    }


    build () {
        this.element = document.createElement( "div" );
        this.element.className = "_2dk__dialogue";
    }


    setReady () {
        this.ready = false;

        setTimeout(() => {
            this.ready = true;

        }, this.timeout );
    }


    play ( data ) {
        this.data = data;

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
        if ( !this.data || !this.ready ) {
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
        this.element.innerHTML = "";
        this.data = null;
        this.ready = false;
    }
}



module.exports = Dialogue;
