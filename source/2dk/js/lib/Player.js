import KeysInterface from "./KeysInterface";
import TouchInterface from "./TouchInterface";
import Config from "./Config";
import GameBox from "./GameBox";
import paramalama from "paramalama";



export default class Player {
    constructor ( data ) {
        this.data = data;
        this.paused = true;
        this.query = paramalama( window.location.search );
        this.debug = this.query.debug ? true : false;
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
        this.interfaces = {};
        this.interfaces.keys = new KeysInterface();
        this.interfaces.touch = new TouchInterface();
        this.element = document.createElement( "div" );
        this.element.className = `_2dk _2dk--${this.debug ? "debug" : "play"}`;
        this.element.appendChild( this.interfaces.touch.element );
        document.body.appendChild( this.element );
    }


    bind () {
        this._dPadPress = this.dPadPress.bind( this );
        this._dPadRelease = this.dPadRelease.bind( this );

        // Standard 4 point d-pad
        this.interfaces.keys.on( "left-press", this._dPadPress );
        this.interfaces.touch.on( "left-press", this._dPadPress );
        this.interfaces.keys.on( "right-press", this._dPadPress );
        this.interfaces.touch.on( "right-press", this._dPadPress );
        this.interfaces.keys.on( "up-press", this._dPadPress );
        this.interfaces.touch.on( "up-press", this._dPadPress );
        this.interfaces.keys.on( "down-press", this._dPadPress );
        this.interfaces.touch.on( "down-press", this._dPadPress );

        // Standard 4 point d-pad on release
        this.interfaces.keys.on( "left-release", this._dPadRelease );
        this.interfaces.touch.on( "left-release", this._dPadRelease );
        this.interfaces.keys.on( "right-release", this._dPadRelease );
        this.interfaces.touch.on( "right-release", this._dPadRelease );
        this.interfaces.keys.on( "up-release", this._dPadRelease );
        this.interfaces.touch.on( "up-release", this._dPadRelease );
        this.interfaces.keys.on( "down-release", this._dPadRelease );
        this.interfaces.touch.on( "down-release", this._dPadRelease );
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
        this.map.addSprite( this.hero );
    }


    setHero ( hero ) {
        this.hero = hero;
        this.hero.player = this;
    }
}
