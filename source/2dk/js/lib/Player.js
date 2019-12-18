import KeysInterface from "./KeysInterface";
import TouchInterface from "./TouchInterface";
import Library from "./Library";
import GameBox from "./GameBox";



export default class Player {
    constructor ( data ) {
        this.data = data;
        this.paused = true;

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
        this.debug = (!this.sac && !this.device);
    }


    build () {
        this.interfaces = {};
        this.interfaces.keys = new KeysInterface();
        this.interfaces.touch = new TouchInterface();
        this.element = document.createElement( "div" );
        this.element.className = `_2dk _2dk--${this.sac || this.device ? "play" : "debug"}`;
        this.element.appendChild( this.interfaces.touch.element );
        document.body.appendChild( this.element );
    }


    bind () {
        this._dPadPress = this.dPadPress.bind( this );
        this.interfaces.keys.on( "d-left-press", this._dPadPress );
        this.interfaces.touch.on( "d-left-press", this._dPadPress );
        this.interfaces.keys.on( "d-right-press", this._dPadPress );
        this.interfaces.touch.on( "d-right-press", this._dPadPress );
        this.interfaces.keys.on( "d-up-press", this._dPadPress );
        this.interfaces.touch.on( "d-up-press", this._dPadPress );
        this.interfaces.keys.on( "d-down-press", this._dPadPress );
        this.interfaces.touch.on( "d-down-press", this._dPadPress );

        this._dPadRelease = this.dPadRelease.bind( this );
        this.interfaces.keys.on( "d-left-release", this._dPadRelease );
        this.interfaces.touch.on( "d-leftreleases", this._dPadRelease );
        this.interfaces.keys.on( "d-right-release", this._dPadRelease );
        this.interfaces.touch.on( "d-right-release", this._dPadRelease );
        this.interfaces.keys.on( "d-up-release", this._dPadRelease );
        this.interfaces.touch.on( "d-up-release", this._dPadRelease );
        this.interfaces.keys.on( "d-down-release", this._dPadRelease );
        this.interfaces.touch.on( "d-down-release", this._dPadRelease );
    }


    start () {
        this.hero.load().then(() => {
            this.map.load().then(() => {
                this.gamebox = new GameBox( this );
                this.paused = false;
            });
        });
    }


    dPadPress ( dir ) {
        // if ( this.paused ) {
        //     return;
        // }

        this.gamebox.press( dir );
    }


    dPadRelease ( dir ) {
        // if ( this.paused ) {
        //     return;
        // }

        this.gamebox.release( dir );
    }


    setMap ( map ) {
        this.map = map;
        this.map.player = this;
    }


    setHero ( hero ) {
        this.hero = hero;
        this.hero.player = this;
    }
}
