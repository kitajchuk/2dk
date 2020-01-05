const Config = require( "./Config" );
const GamePad = require( "./GamePad" );
const GameBox = require( "./GameBox" );
const paramalama = require( "paramalama" );



class Player {
    // game, hero
    constructor ( data ) {
        this.data = data;
        this.ready = false;
        this.paused = true;
        this.stopped = false;
        this.debug = paramalama( window.location.search ).debug ? true : false;
        this.width = data.fullscreen ? Math.max( window.innerWidth, window.innerHeight ) : data.game.width;
        this.height = data.fullscreen ? Math.min( window.innerWidth, window.innerHeight ) : data.game.height;
        this.gamepad = new GamePad( this );
        this.gamebox = new GameBox( this );
        this.detect();
        this.build();
        this.bind();
    }


    detect () {
        const rDevice = /Android|iPhone/;

        this.device = (() => {
            const match = rDevice.exec( window.navigator.userAgent );

            return (match && match[ 0 ] ? true : false);
        })();

        this.sac = (window.navigator.standalone || window.matchMedia( "(display-mode: standalone)" ).matches);
    }


    build () {
        this.element = document.createElement( "div" );
        this.element.className = "_2dk";
        this.splash = document.createElement( "div" );
        this.splash.className = "_2dk__splash";
        this.splash.innerHTML = `<div>Rotate to Landscape.</div><div>${this.sac ? "Installed" : "+Webapp"}</div>`;
        this.element.appendChild( this.splash );
        this.element.appendChild( this.gamepad.element );
        document.body.appendChild( this.element );
    }


    bind () {
        this._dPadPress = this.dPadPress.bind( this );
        this._dPadRelease = this.dPadRelease.bind( this );
        this._startPress = this.startPress.bind( this );
        this._aPress = this.aPress.bind( this );

        // Standard 4 point d-pad
        this.gamepad.on( "left-press", this._dPadPress );
        this.gamepad.on( "right-press", this._dPadPress );
        this.gamepad.on( "up-press", this._dPadPress );
        this.gamepad.on( "down-press", this._dPadPress );

        // Standard 4 point d-pad on release
        this.gamepad.on( "left-release", this._dPadRelease );
        this.gamepad.on( "right-release", this._dPadRelease );
        this.gamepad.on( "up-release", this._dPadRelease );
        this.gamepad.on( "down-release", this._dPadRelease );

        // Start button (pause)
        this.gamepad.on( "start-press", this._startPress );

        // A button (action)
        this.gamepad.on( "a-press", this._aPress );

        // Screen size / Orientation change
        window.onresize = () => {
            this.width = this.data.game.fullscreen ? (this.sac ? screen.height : Math.max( window.innerWidth, window.innerHeight )) : this.data.game.width;
            this.height = this.data.game.fullscreen ? (this.sac ? screen.width : Math.min( window.innerWidth, window.innerHeight )) : this.data.game.height;
        };
    }


    stop () {
        this.stopped = true;
        this.gamebox.pause( this.stopped );
    }


    resume () {
        this.stopped = false;
        this.gamebox.pause( this.stopped );
    }


    startPress () {
        if ( this.stopped ) {
            return;
        }

        if ( !this.ready ) {
            this.element.classList.add( "is-started" );
            this.ready = true;
        }

        this.paused = !this.paused;
        this.gamebox.pause( this.paused );
    }


    aPress () {
        if ( this.stopped ) {
            return;
        }

        if ( this.paused ) {
            return;
        }

        this.gamebox.pressA();
    }


    dPadPress ( dir ) {
        if ( this.stopped ) {
            return;
        }

        if ( this.paused ) {
            return;
        }

        this.gamebox.pressD( dir );
    }


    dPadRelease ( dir ) {
        if ( this.stopped ) {
            return;
        }

        if ( this.paused ) {
            return;
        }

        this.gamebox.releaseD( dir );
    }
}



module.exports = Player;
