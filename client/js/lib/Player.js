const Utils = require( "./Utils" );
const Config = require( "./Config" );
const Loader = require( "./Loader" );
const Socket = require( "./Socket" );
const GamePad = require( "./GamePad" );
const TopView = require( "./plugins/TopView" );
const GameAudio = require( "./GameAudio" );
const paramalama = require( "paramalama" ).default;
const Controller = require( "properjs-controller" ).default;



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
            left: false,
            right: false,
            up: false,
            down: false,
        };
        this.query = paramalama( window.location.search );
        this.gamecycle = new Controller();
        this.previousElapsed = 0;
        this.detect();
    }


    detect () {
        this.device = (() => {
            const match = /Android|iPhone/.exec( window.navigator.userAgent );

            return (match && match[ 0 ] ? true : false);
        })();

        this.installed = (window.navigator.standalone || window.matchMedia( "(display-mode: standalone)" ).matches);
    }


    // Debugging and feature flagging...
    debug () {
        if ( this.query.map ) {
            this.data.hero.map = `/games/${this.data.game.id}/maps/${this.query.map}`;
        }

        if ( this.query.resolution ) {
            this.data.game.resolution = Number( this.query.resolution );
        }

        if ( this.query.spawn ) {
            this.data.hero.spawn = Number( this.query.spawn );
        }

        if ( this.query.sockets ) {
            this.socket = new Socket( this );
        }
    }


    load () {
        this.loader = new Loader();
        this.loader.loadJson( "game.json" ).then(( data ) => {
            this.data = data;
            this.data.hero = Utils.merge( this.data.heroes[ this.data.hero.sprite ], this.data.hero );
            this.debug();
            this.data.game.resolution = (this.device ? 2 : this.data.game.resolution);
            this.width = (this.device && this.data.game.fullscreen) ? Math.max( window.screen.height, screen.width ) : this.data.game.width / this.data.game.resolution;
            this.height = (this.device && this.data.game.fullscreen) ? Math.min( window.screen.height, screen.width ) : this.data.game.height / this.data.game.resolution;
            this.build();
            this.onRotate();

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

            Promise.all( resources ).then(() => {
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
                <div>${this.data.game.name}: Save #${this.data.game.save}, Release v${this.data.game.release}</div>
                <div>${display}</div>
            </div>
        `;
    }


    getMergedData ( data, type ) {
        return Utils.merge(this.data[ type ].find(( obj ) => {
            return (obj.id === data.id);

        }), data );
    }


    getOrientation () {
        return (("orientation" in window) ? window.orientation : window.screen.orientation.angle);
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
        this.splashHome = document.createElement( "div" );
        this.splashHome.className = "_2dk__splash__home";
        this.splashHome.innerHTML = `<a href="/">Tap for 2dk home</a>`;
        this.splash.appendChild( this.splashInfo );
        this.splash.appendChild( this.splashLoad );
        this.splash.appendChild( this.splashHome );
        this.element.appendChild( this.splash );
        this.element.appendChild( this.screen );
        document.body.appendChild( this.element );
    }


    bind () {
        // Standard 4 point d-pad (action)
        this.gamepad.on( "left-press", this.onDpadPress.bind( this ) );
        this.gamepad.on( "right-press", this.onDpadPress.bind( this ) );
        this.gamepad.on( "up-press", this.onDpadPress.bind( this ) );
        this.gamepad.on( "down-press", this.onDpadPress.bind( this ) );

        // Standard 4 point d-pad (cancel)
        this.gamepad.on( "left-release", this.onDpadRelease.bind( this ) );
        this.gamepad.on( "right-release", this.onDpadRelease.bind( this ) );
        this.gamepad.on( "up-release", this.onDpadRelease.bind( this ) );
        this.gamepad.on( "down-release", this.onDpadRelease.bind( this ) );

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
        window.onresize = this.onRotate.bind( this );
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


    onRotate () {
        if ( Math.abs( this.getOrientation() ) === 90 ) {
            this.element.classList.remove( "is-portrait" );
            this.element.classList.add( "is-landscape" );

            if ( this.ready ) {
                this.resume();
            }

        } else {
            this.element.classList.remove( "is-landscape" );
            this.element.classList.add( "is-portrait" );

            if ( this.ready ) {
                this.pause();
                this.stop();
            }
        }
    }


    onReady () {
        if ( !this.ready ) {
            this.ready = true;
            this.element.classList.add( "is-started" );

            // Game cycle (requestAnimationFrame)
            this.gamecycle.go( this.onGameBlit.bind( this ) );
        }
    }


    onGameBlit ( elapsed ) {
        this.previousElapsed = elapsed;

        // Rendering happens if NOT stopped
        if ( !this.stopped ) {
            this.gamebox.blit( elapsed );
        }

        // Soft pause only affects Hero updates and NPCs
        // Hard stop will affect the entire blit/render engine...
        if ( !this.paused ) {
            // D-Pad movement
            // Easier to check the gamepad than have player use event handlers...
            const dpad = this.gamepad.checkDpad();

            if ( !dpad.length ) {
                this.gamebox.releaseD();
                this.gamebox.handleHero(
                    this.gamebox.hero.getNextPoi(),
                    this.gamebox.hero.dir
                );

            } else {
                dpad.forEach(( ctrl ) => {
                    ctrl.dpad.forEach(( dir ) => {
                        this.gamebox.pressD( dir );
                    });
                });
            }

            // Action buttons
            // Easier to have the player use event handlers and check controls...
            if ( this.controls.aHold ) {
                this.gamebox.holdA();

            } else if ( this.controls.a ) {
                this.gamebox.pressA();
            }

            if ( this.controls.bHold ) {
                this.gamebox.holdB();

            } else if ( this.controls.b ) {
                this.gamebox.pressB();
            }
        }

        // Blit the socket (broadcasts)
        if ( !this.stopped && this.socket ) {
            this.socket.blit( elapsed );
        }
    }


    onPressStart () {
        if ( !this.ready ) {
            this.onReady();
        }

        if ( this.paused ) {
            this.resume();

        } else {
            this.pause();
            this.stop();
        }
    }


    onDpadPress ( dir ) {
        this.controls[ dir ] = true;
    }


    onDpadRelease ( dir ) {
        this.controls[ dir ] = false;
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
