const Utils = require( "./Utils" );
const Config = require( "./Config" );
const Loader = require( "./Loader" );
const GamePad = require( "./GamePad" );
const GameAudio = require( "./GameAudio" );
const { TopView } = require( "./GameBox" );
const paramalama = require( "paramalama" );
const Controller = require( "properjs-controller" );



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
        this.gamecycle = new Controller();
        this.previousElapsed = 0;
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
                this.gameaudio = new GameAudio();
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
        // Game cycle (requestAnimationFrame)
        this.gamecycle.go( this.onGameBlit.bind( this ) );

        // Start button (pause)
        this.gamepad.on( "start-press", this.onPressStart.bind( this ) );

        // A button (action)
        this.gamepad.on( "a-press", this.onPressA.bind( this ) );
        this.gamepad.on( "a-release", this.onReleaseA.bind( this ) );

        // B button (cancel)
        this.gamepad.on( "b-press", this.onPressB.bind( this ) );
        this.gamepad.on( "b-holdpress", this.onPressHoldB.bind( this ) );
        this.gamepad.on( "b-release", this.onReleaseB.bind( this ) );
        this.gamepad.on( "b-holdrelease", this.onReleaseHoldB.bind( this ) );

        // Screen size / Orientation change
        // window.onresize = () => {};
    }


    stop () {
        this.stopped = true;
        this.gamebox.pause( this.stopped );
    }


    resume () {
        // Async resume
        setTimeout(() => {
            this.stopped = false;
            this.gamebox.pause( this.stopped );

        }, Config.values.debounceDur );
    }


    onGameBlit ( elapsed ) {
        if ( this.stopped || this.paused ) {
            this.previousElapsed = elapsed;
            this.gamebox.render( elapsed );
            return;
        }

        let delta = (elapsed - this.previousElapsed) / 1000.0;

        delta = Math.min( delta, 0.25 ); // maximum delta of 250ms
        this.previousElapsed = elapsed;

        // Rendering at 60FPS to sync layers and active tiles...
        this.gamebox.render( elapsed );

        // D-Pad movement
        // Easier to check the gamepad than have player use event handlers...
        const dpad = this.gamepad.checkDpad();

        if ( !dpad.length ) {
            this.gamebox.releaseD();

        } else {
            dpad.forEach(( ctrl ) => {
                ctrl.dpad.forEach(( dir ) => {
                    const step = this.gamebox.getStep( dir );

                    this.gamebox.pressD( dir, delta, step.x, step.y );
                });
            });
        }

        // Action buttons
        // Easier to have the player use event handlers and check controls...
        if ( this.controls.a ) {
            const step = this.gamebox.getStep( this.gamebox.hero.dir );

            this.gamebox.pressA( this.gamebox.hero.dir, delta, step.x, step.y );
        }

        if ( this.controls.bHold ) {
            this.gamebox.holdB();

        } else if ( this.controls.b ) {
            this.gamebox.pressB();
        }
    }


    onPressStart () {
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


    onPressA () {
        this.controls.a = true;
    }


    onReleaseA () {
        this.controls.a = false;
    }


    onPressB () {
        this.controls.b = true;
    }


    onPressHoldB () {
        this.controls.bHold = true;
    }


    onReleaseB () {
        this.controls.b = false;
        this.controls.bHold = false;
    }


    onReleaseHoldB () {
        this.controls.b = false;
        this.controls.bHold = false;
    }
}



module.exports = Player;
