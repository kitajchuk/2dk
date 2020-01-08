const Config = require( "./Config" );
const Loader = require( "./Loader" );
const GamePad = require( "./GamePad" );
const GameBox = require( "./GameBox" );
const paramalama = require( "paramalama" );



class Player {
    constructor () {
        this.ready = false;
        this.paused = true;
        this.stopped = false;
        this.query = paramalama( window.location.search );
        this.debug = this.query.debug ? true : false;
        this.detect();
        this.build();
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
        this.splashInfo = document.createElement( "div" );
        this.splashInfo.className = "_2dk__splash__info";
        this.splashInfo.innerHTML = `<div>Rotate to Landscape.</div><div>${this.sac ? "Installed" : "+Webapp"}</div>`;
        this.splashLoad = document.createElement( "div" );
        this.splashLoad.className = "_2dk__splash__load";
        this.splashLoad.innerHTML = `<div>Loading game bundle...</div>`;
        this.splash.appendChild( this.splashInfo );
        this.splash.appendChild( this.splashLoad );
        this.element.appendChild( this.splash );
        document.body.appendChild( this.element );
    }


    load () {
        this.loader = new Loader();
        this.loader.loadJson( "game.json" ).then(( data ) => {
            this.data = data;
            this.width = data.game.fullscreen ? Math.max( window.innerWidth, window.innerHeight ) : data.game.width;
            this.height = data.game.fullscreen ? Math.min( window.innerWidth, window.innerHeight ) : data.game.height;

            let counter = 0;

            Promise.all(data.bundle.map(( url ) => {
                return this.loader.load( url ).then(() => {
                    counter++;

                    this.splashLoad.innerHTML = `<div>Loaded ${counter} of ${data.bundle.length} game resources...</div>`;
                });

            })).then(( values ) => {
                this.splashLoad.innerHTML = `<div>Press Start</div>`;
                this.gamepad = new GamePad( this );
                this.gamebox = new GameBox( this );
                this.bind();
            });
        });
    }


    bind () {
        this._dPadPress = this.dPadPress.bind( this );
        this._dPadRelease = this.dPadRelease.bind( this );
        this._startPress = this.startPress.bind( this );
        this._aPress = this.aPress.bind( this );
        this._aRelease = this.aRelease.bind( this );
        this._aLongRelease = this.aLongRelease.bind( this );
        this._bPress = this.bPress.bind( this );

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
        this.gamepad.on( "a-release", this._aRelease );
        this.gamepad.on( "a-longrelease", this._aLongRelease );

        // B button (cancel)
        this.gamepad.on( "b-press", this._bPress );

        // Screen size / Orientation change
        window.onresize = () => {
            this.width = this.data.game.fullscreen ? (this.sac ? screen.height : Math.max( window.innerWidth, window.innerHeight )) : this.data.game.width;
            this.height = this.data.game.fullscreen ? (this.sac ? screen.width : Math.min( window.innerWidth, window.innerHeight )) : this.data.game.height;
        };
    }


    stop () {
        this.stopped = true;
        this.gamepad.clear();
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


    aRelease () {
        if ( this.stopped ) {
            return;
        }

        if ( this.paused ) {
            return;
        }

        this.gamebox.releaseA();
    }


    aLongRelease () {
        if ( this.stopped ) {
            return;
        }

        if ( this.paused ) {
            return;
        }

        this.gamebox.longReleaseA();
    }


    bPress () {
        if ( this.stopped ) {
            return;
        }

        if ( this.paused ) {
            return;
        }

        this.gamebox.pressB();
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
