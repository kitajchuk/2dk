import KeysInterface from "./KeysInterface";
import TouchInterface from "./TouchInterface";



export default class Player {
    constructor () {
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
        this.screen = document.createElement( "div" );

        this.element.className = `_2dk _2dk--${this.sac || this.device ? "play" : "debug"}`;
        this.screen.className = `_2dk__screen`;

        this.element.appendChild( this.screen );
        this.element.appendChild( this.interfaces.touch.element );

        document.body.appendChild( this.element );
    }


    bind () {
        this.interfaces.keys.on( "a", () => {
            console.log( "keys a" );
        });

        this.interfaces.touch.on( "a", () => {
            console.log( "touch a" );
        });
    }
}
