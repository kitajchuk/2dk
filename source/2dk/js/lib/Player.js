const Utils = require( "./Utils" );
const Config = require( "./Config" );
const Loader = require( "./Loader" );
const GamePad = require( "./GamePad" );
const GameCycle = require( "./GameCycle" );
const GameSound = require( "./GameSound" );
const { TopView } = require( "./GameBox" );
const paramalama = require( "paramalama" );



class Player {
    constructor () {
        this.ready = false;
        this.paused = true;
        this.stopped = false;
        this.Loader = Loader;
        this.controls = {
            a: false,
            b: false,
            bHold: false,
        };
        this.query = paramalama( window.location.search );
        this.detect();
    }


    detect () {
        const rDevice = /Android|iPhone/;

        this.device = (() => {
            const match = rDevice.exec( window.navigator.userAgent );

            return (match && match[ 0 ] ? true : false);
        })();

        this.sac = (window.navigator.standalone || window.matchMedia( "(display-mode: standalone)" ).matches);
    }


    load () {
        this.loader = new Loader();
        this.loader.loadJson( "game.json" ).then(( data ) => {
            this.data = data;
            this.data.hero = Utils.merge( data.heroes[ data.hero.sprite ], data.hero );
            this.width = (this.device && data.game.fullscreen) ? screen.height : data.game.width;
            this.height = (this.device && data.game.fullscreen) ? screen.width : data.game.height;
            this.debug();
            this.build();

            let counter = 0;

            Promise.all(data.bundle.map(( url ) => {
                return this.loader.load( url ).then(() => {
                    counter++;

                    this.splashLoad.innerHTML = `<div>Loaded ${counter} of ${data.bundle.length} game resources...</div>`;
                });

            })).then(( values ) => {
                this.splashLoad.innerHTML = `<div>Press Start</div>`;
                this.gamecycle = new GameCycle( this );
                this.gamesound = new GameSound( this );
                this.gamepad = new GamePad( this );
                this.gamebox = new TopView( this );
                this.bind();
            });
        });
    }


    debug () {
        if ( this.query.map ) {
            this.data.hero.spawn.map = `/games/${this.data.game.id}/maps/${this.query.map}`;
        }

        if ( this.query.spawn ) {
            const coords = this.query.spawn.split( "," );

            this.data.hero.spawn.x = Number( coords[ 0 ] );
            this.data.hero.spawn.y = Number( coords[ 1 ] );
        }
    }


    build () {
        this.element = document.createElement( "div" );
        this.element.className = "_2dk";
        this.screen = document.createElement( "div" );
        this.screen.className = `_2dk__screen`;
        this.screen.style.width = `${this.width}px`;
        this.screen.style.height = `${this.height}px`;
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
        this.element.appendChild( this.screen );
        document.body.appendChild( this.element );
    }


    bind () {
        this._startPress = this.startPress.bind( this );
        this._aPress = this.aPress.bind( this );
        this._aRelease = this.aRelease.bind( this );
        this._bPress = this.bPress.bind( this );
        this._bHoldPress = this.bHoldPress.bind( this );
        this._bRelease = this.bRelease.bind( this );
        this._bHoldRelease = this.bHoldRelease.bind( this );

        // Start button (pause)
        this.gamepad.on( "start-press", this._startPress );

        // A button (action)
        this.gamepad.on( "a-press", this._aPress );
        this.gamepad.on( "a-release", this._aRelease );

        // B button (cancel)
        this.gamepad.on( "b-press", this._bPress );
        this.gamepad.on( "b-holdpress", this._bHoldPress );
        this.gamepad.on( "b-release", this._bRelease );
        this.gamepad.on( "b-holdrelease", this._bHoldRelease );

        // Screen size / Orientation change
        // window.onresize = () => {};
    }


    stop () {
        this.stopped = true;
        // this.gamepad.clear();
        this.gamebox.pause( this.stopped );
    }


    resume () {
        // Async resume
        setTimeout(() => {
            this.stopped = false;
            this.gamebox.pause( this.stopped );

        }, 256 );
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
        this.controls.a = true;
    }


    aRelease () {
        this.controls.a = false;
    }


    bPress () {
        this.controls.b = true;
    }


    bHoldPress () {
        this.controls.bHold = true;
    }


    bRelease () {
        this.controls.b = false;
        this.controls.bHold = false;
    }


    bHoldRelease () {
        this.controls.b = false;
        this.controls.bHold = false;
    }
}



module.exports = Player;
