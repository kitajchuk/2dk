import Utils from "./Utils";
import Config from "./Config";
import GamePad from "./GamePad";
import GameAudio from "./GameAudio";
import GameStorage from "./GameStorage";
import Loader from "./Loader";
import Controller from "./Controller";
import TopView from "./plugins/TopView";
import MapLayer from "./maps/MapLayer";
import { renderMenu, renderSplash, renderGameInfo, renderSplashInfo } from "./DOM";



export default class Player extends Controller {
    constructor () {
        super();

        this.build();

        this.menu = new PlayerMenu( this );
        this.gamestorage = new GameStorage( this );

        this.fps = Config.player.fps;
        this.frame = 0;
        this.interval = 1000 / this.fps;

        this.renderLayer = null;;

        this.loader = new Loader();
        this.Loader = Loader;
        this.Config = Config;
        this.Utils = Utils;

        this.initialize();
        this.detect();
        this.buildSplash();
    }


    initialize () {
        this.ready = false;
        this.paused = false;
        this.stopped = false;
        this.controls = {
            // Menu
            start: false,
            select: false,
            // Actions
            a: false,
            aHold: false,
            aRelease: false,
            b: false,
            bHold: false,
            bRelease: false,
            // D-Pad
            left: false,
            right: false,
            up: false,
            down: false,
            // Internal flags
            _pressedA: false,
            _pressedB: false,
        };

        // Controller properties
        this.handlers = {};
        this.rafId = null;
        this.animate = null;
        this.started = false;
        this.idleStarted = false;
    }


/*******************************************************************************
* Game Loop
* Gamebox order is: blit, update, render
*******************************************************************************/
    idleGo () {
        if ( this.device ) {
            return;
        }

        if ( this.idleStarted ) {
            return;
        }

        this.idleStarted = true;
        this.animate = ( currentTime ) => {
            this.rafId = window.requestAnimationFrame( this.animate );
            if ( this.gamepad.gamepadConnected ) {
                this.gamepad.blitNativeGamepad( currentTime );
            }
        };
        this.rafId = window.requestAnimationFrame( this.animate );
    }

    // Overrides default go method to control frame rate
    go () {
        if ( this.started ) {
            return;
        }

        this.frame = 0;
        this.started = true;
        this.currentFPS = this.fps;
        this.previousTime = performance.now();
        this.previousFrameTime = this.previousTime;
        this.animate = ( currentTime ) => {
            // Request next animation frame right away (eager)...
            this.rafId = window.requestAnimationFrame( this.animate );

            const deltaTime = currentTime - this.previousTime;

            if ( deltaTime >= this.interval ) {
                // Update physics at controlled frame rate
                this.previousTime = currentTime - ( deltaTime % this.interval );
                this.blit( this.previousTime );

                const elapsedFrameTime = currentTime - this.previousFrameTime;
            
                if ( elapsedFrameTime >= 1000 ) {
                    this.currentFPS = this.frame;
                    this.frame = 0;
                    this.previousFrameTime = currentTime;
                }
                
                this.frame++;
            }

            // Render at refresh rate
            this.render();
        };

        // Start the animation loop
        this.rafId = window.requestAnimationFrame( this.animate );
    }


    blit ( currentTime ) {
        this.blitUpdate( currentTime );
        this.blitControls( currentTime );
    }


    blitUpdate ( currentTime ) {
        if ( this.stopped ) {
            return;
        }

        // Update the gamebox (playable cycles)
        this.gamebox.blit( currentTime );
        this.gamebox.update();
    }


    blitControls ( currentTime ) {
        if ( this.stopped ) {
            return;
        }

        if ( this.gamepad.gamepadConnected ) {
            this.gamepad.blitNativeGamepad();
        }

        this.gamepad.blit( currentTime );

        // D-Pad movement
        const dpad = this.gamepad.checkDpad();

        if ( !dpad.length ) {
            this.gamebox.releaseD();
            this.gamebox.handleHero(
                this.gamebox.hero.position,
                this.gamebox.hero.dir
            );

        } else {
            for ( let i = 0; i < dpad.length; i++ ) {
                for ( let j = 0; j < dpad[ i ].dpad.length; j++ ) {
                    this.gamebox.pressD( dpad[ i ].dpad[ j ] );
                }
            }
        }

        // Action buttons
        if ( this.controls.aHold ) {
            if ( this.controls.aRelease ) {
                this.controls.aHold = false;
                this.controls.aRelease = false;
                this.controls._pressedA = false;
                this.gamebox.releaseHoldA();

            } else {
                this.gamebox.holdA();
            }

        } else if ( this.controls.aRelease ) {
            this.controls.aRelease = false;
            this.controls._pressedA = false;
            this.gamebox.releaseA();

        } else if ( this.controls.a && !this.controls._pressedA ) {
            this.controls._pressedA = true;
            this.gamebox.pressA();
        }

        if ( this.controls.bHold ) {
            if ( this.controls.bRelease ) {
                this.controls.bHold = false;
                this.controls.bRelease = false;
                this.controls._pressedB = false;
                this.gamebox.releaseHoldB();

            } else {
                this.gamebox.holdB();
            }

        } else if ( this.controls.bRelease ) {
            this.controls.bRelease = false;
            this.controls._pressedB = false;
            this.gamebox.releaseB();

        } else if ( this.controls.b && !this.controls._pressedB ) {
            this.controls._pressedB = true;
            this.gamebox.pressB();
        }
    }


    // Handle early captures in render() so that hardStop() safely cancels the RAF loop
    render () {
        // Capture menu buttons at the end of the game loop cycle
        if ( this.controls.start ) {
            this.controls.start = false;
            this.onPressStart();
        }

        if ( this.controls.select ) {
            this.controls.select = false;
            this.onPressSelect();
        }

        // Capture map change event on the next blit cycle
        if ( this.gamebox.mapChangeEvent ) {
            this.gamebox.changeMap( this.gamebox.mapChangeEvent );
            return;
        }

        // Safely handle hero death so we exit the blit loop and reset the player cleanly
        if ( this.gamebox.hero.deathCounter > 0 ) {
            this.gamebox.hero.deathCounter--;

            if ( this.gamebox.hero.deathCounter === 0 ) {
                this.reset({ persist: true });
                return;
            }
        }

        this.gamebox.render();
    }


    clear () {
        this.renderLayer.clear();
    }


    reset ({ persist = false } = {}) {
        // Stop the RAF loop
        this.hardStop();

        if ( persist ) {
            this.gamestorage.persist( this.gamebox );
        }

        // Destroy the gamebox
        this.gamebox.destroy();

        // Stop the audio
        this.gameaudio.stop();

        // Player cleanup and reset state
        this.menu.hide();
        this.initialize();
        this.element.classList.remove( "is-started", "is-fader" );

        // Recreated in onReady() via onPressStart()
        delete this.gamebox;
    }


    hardStop () {
        super.stop();
        this.paused = true;
        this.stopped = true;
        this.gamepad.clear();
        this.gamebox.pause( true );
    }


    pause () {
        this.hardStop();
        this.menu.show();
        this.emit( Config.broadcast.PAUSED );

        // Start the idle game loop ONLY if a gamepad is connected
        if ( this.gamepad.gamepadConnected ) {
            this.idleGo();
        }
    }


    resume () {
        this.paused = false;
        this.stopped = false;
        this.gamebox.pause( false );
        this.menu.hide();
        this.emit( Config.broadcast.RESUMED );
        this.go();
    }



/*******************************************************************************
* Debug, loading etc...
*******************************************************************************/
    async load () {
        this.data = await this.loader.loadBundle( "game.json", this.device, ( counter, length ) => {
            this.splashLoad.innerHTML = renderSplash( `Loaded ${counter} of ${length} game resources...` );
        });
        this.debug();
        this.heroData = this.getHeroData();
        this.resolution = this.getResolution();
        this.width = this.data.width / this.resolution;
        this.height = this.data.height / this.resolution;
        this.buildScreen();
        this.buildGamebox();
        this.splashLoad.innerHTML = `
        ${renderGameInfo( this.data )}
        ${renderSplash( "Press Start" )}
        `;
        this.gamepad = new GamePad( this );
        this.gameaudio = new GameAudio( this.device );
        this.bind();

        // Handle basic pre-game raf cycle to capture gamepad connection before main game engine starts
        this.idleGo();
    }


    detect () {
        // https://developer.mozilla.org/en-US/docs/Web/HTTP/Browser_detection_using_the_user_agent#mobile_tablet_or_desktop
        this.device = /Mobi/i.test( window.navigator.userAgent );
        this.installed = ( window.navigator.standalone || window.matchMedia( "(display-mode: standalone)" ).matches );
    }


    // Debugging and feature flagging...
    debug () {
        const query = new URLSearchParams( window.location.search );

        this.query = {
            fps: query.get( "fps" ),
            map: query.get( "map" ),
            items: query.get( "items" ),
            spawn: query.get( "spawn" ),
            debug: query.get( "debug" ),
            status: query.get( "status" ),
            gamepad: query.get( "gamepad" ),
            companion: query.get( "companion" ),
            resolution: query.get( "resolution" ),
            // Skip loading from game storage (for development purposes)
            nostorage: query.get( "nostorage" ),
        };
    }


    getHeroData () {
        const heroData = Utils.merge( this.data.heroes[ this.data.hero.sprite ], this.data.hero );

        if ( this.query.map ) {
            heroData.map = `maps/${this.query.map}`;
            heroData.spawn = 0; // Can be overriden with below query string
        }

        if ( this.query.spawn ) {
            heroData.spawn = Number( this.query.spawn );
        }

        if ( this.query.companion ) {
            heroData.companion = {
                id: this.query.companion,
                type: Config.verbs.WALK,
            };
        }

        return heroData;
    }


    getResolution () {
        const res = this.query.resolution ?
            Number( this.query.resolution ) :
            this.device ?
                Config.player.deviceResolution :
                this.data.resolution;
        return res > this.data.maxresolution ? this.data.maxresolution : res;
    }


    getMergedData ( data, type, force = false ) {
        const baseData = this.data[ type ].find( ( obj ) => {
            return ( obj.id === data.id );
        });

        return baseData ? Utils.merge( baseData, data, force ) : data;
    }


/*******************************************************************************
* Build DOM
*******************************************************************************/
    build () {
        this.element = document.createElement( "div" );
        this.element.className = "_2dk";
        document.body.appendChild( this.element );
    }


    buildSplash () {
        this.splash = document.createElement( "div" );
        this.splash.className = "_2dk__splash";
        this.splashInfo = document.createElement( "div" );
        this.splashInfo.className = "_2dk__splash__info";
        this.splashInfo.innerHTML = renderSplashInfo( this.installed );
        this.splashLoad = document.createElement( "div" );
        this.splashLoad.className = "_2dk__splash__load";
        this.splashLoad.innerHTML = renderSplash( "Loading game bundle..." );
        this.splashUpdate = document.createElement( "div" );
        this.splashUpdate.className = "_2dk__splash__update btn";
        this.splashUpdate.innerHTML = "<div>Update Available</div>";
        this.splash.appendChild( this.splashInfo );
        this.splash.appendChild( this.splashLoad );
        this.splash.appendChild( this.splashUpdate );
        this.element.appendChild( this.splash );
    }


    buildScreen () {
        this.element.dataset.resolution = this.resolution;
        this.screen = document.createElement( "div" );
        this.screen.className = "_2dk__screen";
        this.screen.style.width = `${this.width}px`;
        this.screen.style.height = `${this.height}px`;
        this.element.appendChild( this.screen );
    }


    buildGamebox () {
        this.gbox = document.createElement( "div" );
        this.gbox.className = "_2dk__gamebox";

        // Main canvas visible on screen
        const cameraWidth = this.width * this.resolution;
        const cameraHeight = this.height * this.resolution;
        this.renderLayer = new MapLayer({
            id: "gamebox",
            width: cameraWidth,
            height: cameraHeight,
        });
        this.renderLayer.canvas.width = cameraWidth * this.resolution;
        this.renderLayer.canvas.height = cameraHeight * this.resolution;

        this.gbox.appendChild( this.renderLayer.canvas );
        this.screen.appendChild( this.gbox );
    }



/*******************************************************************************
* Presentation
*******************************************************************************/
    fadeOut () {
        return new Promise( ( resolve ) => {
            this.element.classList.add( "is-fader" );
            setTimeout( resolve, Config.player.fadeDur );
        });
    }


    fadeIn () {
        return new Promise( ( resolve ) => {
            this.element.classList.remove( "is-fader" );
            setTimeout( resolve, Config.player.fadeDur );
        });
    }


/*******************************************************************************
* Event handling
*******************************************************************************/
    bind () {
        // Screen size / Orientation change
        window.onresize = this.onRotate.bind( this );
    }


    onRotate () {
        if ( !this.ready ) {
            return;
        }

        if ( window.screen.orientation.type.includes( "landscape" ) ) {
            this.resume();
        } else {
            this.pause();
        }
    }


    onReady () {
        if ( !this.ready ) {
            this.ready = true;
            this.element.classList.add( "is-started" );

            if ( this.data.plugin === Config.plugins.TOPVIEW ) {
                this.gamebox = new TopView( this );
                this.gamebox.pause( false );
                this.go();
            }
        }
    }


    onPressStart () {
        if ( this.gamebox?.hero?.killed ) {
            return;
        }

        // Stop the idle game loop
        if ( this.idleStarted ) {
            super.stop();
            this.idleStarted = false;
        }

        if ( !this.ready ) {
            this.onReady();
            return;
        }

        if ( this.paused ) {
            this.resume();

        } else {
            this.pause();
        }
    }


    onPressSelect () {
        if ( !this.ready ) {
            return;
        }

        if ( !this.gamebox.hero.hasProjectile() ) {
            return;
        }

        switch ( this.gamebox.hero.mode ) {
            case Config.hero.modes.WEAPON:
                this.gamebox.hero.mode = Config.hero.modes.PROJECTILE;
                this.gamebox.hero.updateProjectileItem();
                break;
            case Config.hero.modes.PROJECTILE:
                if ( this.gamebox.hero.canCycleProjectile() ) {
                    this.gamebox.hero.updateProjectileItem();
                    // HACK: Need to force a HUD button sprite update when cycling projectiles
                    // This is okay so long as we have this low-brow projectile cycling method
                    this.gamebox.hud.buttons.b = null;
                } else {
                    this.gamebox.hero.mode = Config.hero.modes.WEAPON;
                }
                break;
        }
    }
}


export class PlayerMenu {
    constructor ( player ) {
        this.player = player;
        this.timeout = null;
        this.build();
        this.bind();
    }


    build () {
        this.element = document.createElement( "div" );
        this.element.className = "_2dk__menu";
        this.player.element.appendChild( this.element );
    }


    show () {
        if ( this.timeout ) {
            clearTimeout( this.timeout );
            this.timeout = null;
        }

        if ( this.player.gamebox.hero ) {
            this.element.innerHTML = renderMenu( this.player );
        }

        this.element.classList.add( "is-active" );
    }


    hide () {
        this.element.classList.remove( "is-active" );
        this.timeout = setTimeout(() => {
            this.element.innerHTML = "";

        }, Config.player.hideDur );
    }


    bind () {
        this.element.addEventListener( "click", ( e ) => {
            const tab = e.target.closest( "[data-tab]" );

            if ( tab ) {
                const content = this.element.querySelector( `[data-content="${tab.dataset.tab}"]` );

                this.element.querySelectorAll( ".is-active" ).forEach( ( el ) => {
                    el.classList.remove( "is-active" );
                });
                tab.classList.add( "is-active" );
                content.classList.add( "is-active" );
                return;
            }

            const save = e.target.closest( "[data-save]" );
            
            if ( save ) {
                this.player.gamestorage.persist( this.player.gamebox );
                this.player.reset();
                return;
            }
            
            const reset = e.target.closest( "[data-reset]" );

            if ( reset ) {
                this.player.gamestorage.reset();
                this.player.reset();
                return;
            }
        });
    }
}
