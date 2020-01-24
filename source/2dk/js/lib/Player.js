const Utils = require( "./Utils" );
const Config = require( "./Config" );
const Loader = require( "./Loader" );
const GamePad = require( "./GamePad" );
const GameAudio = require( "./GameAudio" );
const TopView = require( "./plugins/TopView" );
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
            aHold: false,
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

        this.installed = (window.navigator.standalone || window.matchMedia( "(display-mode: standalone)" ).matches);
    }


    load () {
        this.loader = new Loader();
        this.loader.loadJson( "game.json" ).then(( data ) => {
            this.data = data;
            this.data.hero = Utils.merge( this.data.heroes[ this.data.hero.sprite ], this.data.hero );
            this.debug();
            this.width = (this.device && this.data.game.fullscreen) ? screen.height : this.data.game.width / this.data.game.resolution;
            this.height = (this.device && this.data.game.fullscreen) ? screen.width : this.data.game.height / this.data.game.resolution;
            this.build();

            let counter = 0;

            // Audio is still experimental for mobile so disabling for now...
            let resources = data.bundle.filter(( url ) => {
                const type = url.split( "/" ).pop().split( "." ).pop();

                return (this.device ? (type !== "mp3") : true);
            });

            // Map bundle resource URLs to a Loader promise types for initialization...
            resources = resources.map(( url ) => {
                return this.loader.load( url ).then(() => {
                    counter++;

                    this.splashLoad.innerHTML = this.getSplash( `Loaded ${counter} of ${resources.length} game resources...` );

                    // console.log( `Loaded ${counter} of ${resources.length} game resources...` );
                });

            })

            Promise.all( resources ).then(( values ) => {
                this.splashLoad.innerHTML = this.getSplash( "Press Start" );
                this.gameaudio = new GameAudio( this );
                this.gamepad = new GamePad( this );

                if ( this.data.game.plugin === Config.plugins.TOPVIEW ) {
                    this.gamebox = new TopView( this );
                }

                this.bind();
            });
        });
    }


    getSplash ( display ) {
        return `
            <div>
                <div>${this.data.game.name} @v${this.data.game.version}</div>
                <div>${display}</div>
            </div>
        `;
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

        if ( this.query.resolution ) {
            this.data.game.resolution = Number( this.query.resolution );
        }

        if ( this.device ) {
            this.data.game.resolution = 2;
        }
    }


    build () {
        this.element = document.createElement( "div" );
        this.element.className = "_2dk";
        this.element.dataset.resolution = this.data.game.resolution;
        this.screen = document.createElement( "div" );
        this.screen.className = "_2dk__screen";
        this.screen.style.width = `${this.width}px`;
        this.screen.style.height = `${this.height}px`;
        this.splash = document.createElement( "div" );
        this.splash.className = "_2dk__splash";
        this.splashInfo = document.createElement( "div" );
        this.splashInfo.className = "_2dk__splash__info";
        this.splashInfo.innerHTML = `<div>Rotate to Landscape.</div><div>${this.installed ? "Webapp Installed" : "Install Webapp"}</div>`;
        this.splashLoad = document.createElement( "div" );
        this.splashLoad.className = "_2dk__splash__load";
        this.splashLoad.innerHTML = this.getSplash( "Loading game bundle..." );
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
        this.gamepad.on( "a-holdpress", this.onPressHoldA.bind( this ) );
        this.gamepad.on( "a-holdrelease", this.onReleaseHoldA.bind( this ) );

        // B button (cancel)
        this.gamepad.on( "b-press", this.onPressB.bind( this ) );
        this.gamepad.on( "b-holdpress", this.onPressHoldB.bind( this ) );
        this.gamepad.on( "b-release", this.onReleaseB.bind( this ) );
        this.gamepad.on( "b-holdrelease", this.onReleaseHoldB.bind( this ) );

        // Screen size / Orientation change
        // window.onresize = () => {};
    }

    // Stops game button events from dispatching to the gamebox
    pause () {
        this.paused = true;
        this.gamepad.clear();
        this.gamebox.pause( true );
    }


    // Stops the gamebox from rendering
    stop () {
        this.stopped = true;
        this.gamepad.clear();
        this.gamebox.pause( true );
    }


    // Resumes playable state, not paused and not stopped
    resume () {
        this.paused = false;
        this.stopped = false;
        this.gamebox.pause( false );
    }


    onGameBlit ( elapsed ) {
        let delta = (elapsed - this.previousElapsed) / 1000.0;
        let step;

        delta = Math.min( delta, 0.25 ); // maximum delta of 250ms
        this.previousElapsed = elapsed;

        // Rendering happens if NOT stopped
        if ( !this.stopped ) {
            this.gamebox.render( elapsed );
        }

        // Game Buttons happen if NOT paused
        if ( !this.paused ) {
            // D-Pad movement
            // Easier to check the gamepad than have player use event handlers...
            const dpad = this.gamepad.checkDpad();

            if ( !dpad.length ) {
                this.gamebox.releaseD();

            } else {
                dpad.forEach(( ctrl ) => {
                    ctrl.dpad.forEach(( dir ) => {
                        step = this.gamebox.getStep( dir );

                        this.gamebox.pressD( dir, delta, step.x, step.y );
                    });
                });
            }

            step = this.gamebox.getStep( this.gamebox.map.hero.dir );

            // Action buttons
            // Easier to have the player use event handlers and check controls...
            if ( this.controls.aHold ) {
                this.gamebox.holdA( this.gamebox.map.hero.dir, delta, step.x, step.y );

            } else if ( this.controls.a ) {
                this.gamebox.pressA( this.gamebox.map.hero.dir, delta, step.x, step.y );
            }

            if ( this.controls.bHold ) {
                this.gamebox.holdB( this.gamebox.map.hero.dir, delta, step.x, step.y );

            } else if ( this.controls.b ) {
                this.gamebox.pressB( this.gamebox.map.hero.dir, delta, step.x, step.y );
            }
        }
    }


    onPressStart () {
        if ( !this.ready ) {
            this.element.classList.add( "is-started" );
            this.ready = true;
        }

        if ( this.paused ) {
            this.resume();

        } else {
            this.pause();
            this.stop();
        }
    }


    onPressA () {
        this.controls.a = true;
    }


    onPressHoldA () {
        this.controls.aHold = true;
    }


    onReleaseA () {
        this.controls.a = false;
        this.gamebox.releaseA && this.gamebox.releaseA();
    }


    onReleaseHoldA () {
        this.controls.a = false;
        this.controls.aHold = false;
        this.gamebox.releaseHoldA && this.gamebox.releaseHoldA();
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
        this.gamebox.releaseB && this.gamebox.releaseB();
    }


    onReleaseHoldB () {
        this.controls.b = false;
        this.controls.bHold = false;
        this.gamebox.releaseHoldB && this.gamebox.releaseHoldB();
    }
}



module.exports = Player;
