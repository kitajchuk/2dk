const Config = require( "./Config" );
const GamePad = require( "./GamePad" );
const GameBox = require( "./GameBox" );
const paramalama = require( "paramalama" );



class Player {
    constructor ( data ) {
        this.data = data;
        this.paused = true;
        this.query = paramalama( window.location.search );
        this.debug = this.query.debug ? true : false;
        this.gamepad = new GamePad();
        this.width = data.fullscreen ? Math.max( window.innerWidth, window.innerHeight ) : data.width;
        this.height = data.fullscreen ? Math.min( window.innerWidth, window.innerHeight ) : data.height;
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
        this.splash.innerHTML = "<div>Rotate to Landscape.</div><div>+Webapp</div>";
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
            this.width = this.data.fullscreen ? (this.sac ? screen.height : Math.max( window.innerWidth, window.innerHeight )) : this.data.width;
            this.height = this.data.fullscreen ? (this.sac ? screen.width : Math.min( window.innerWidth, window.innerHeight )) : this.data.height;
            this.map.updateLayers( this.width, this.height );
        };
    }


    init () {
        this.gamebox = new GameBox( this );
        this.paused = false;
    }


    start () {
        this.hero.load().then(() => {
            this.map.load().then( this.init.bind( this ) );
        });
    }


    startPress () {
        this.paused = !this.paused;

        if ( this.paused ) {
            this.hero.face( this.hero.dir );
        }
    }


    aPress () {
        this.gamebox.pressA();
    }


    dPadPress ( dir ) {
        if ( this.paused ) {
            return;
        }

        this.gamebox.press( dir );
    }


    dPadRelease ( dir ) {
        if ( this.paused ) {
            return;
        }

        this.gamebox.release( dir );
    }


    setMap ( map ) {
        this.map = map;
        this.map.player = this;
        this.map.addSprite( this.hero );
    }


    setHero ( hero ) {
        this.hero = hero;
        this.hero.player = this;
    }
}



module.exports = Player;
