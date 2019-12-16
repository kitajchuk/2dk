import Library from "./Library";
import Controller from "properjs-controller";
import $ from "properjs-hobo";


const timers = {};
const keyInterval = 1;
const keyRepeated = 50;
let aButton = 0;
let bButton = 0;
let instance = null;



const onKeyUp = ( e ) => {
    if ( timers[ e.which ] ) {
        clearInterval( timers[ e.which ] );

        delete timers[ e.which ];
    }

    onGameKeyUp( e.which );
};



const onKeyDown = ( e ) => {
    if ( !timers[ e.which ] ) {
        onGameKeyDown( e.which );

        timers[ e.which ] = setInterval(() => {
            onGameKeyDown( e.which );

        }, keyInterval );
    }
};



const onGameKeyUp = ( k ) => {
    if ( k === Library.keys.A ) {
        instance.fire( "a-up" );

        if ( aButton < keyRepeated ) {
            instance.fire( "a" );
        }

        aButton = 0;
    }

    if ( k === Library.keys.B ) {
        instance.fire( "b-up" );

        if ( bButton < keyRepeated ) {
            instance.fire( "b" );
        }

        bButton = 0;
    }

    if ( k === Library.keys.START ) {
        instance.fire( "start" );
    }

    if ( k === Library.keys.SELECT ) {
        instance.fire( "select" );
    }
};



const onGameKeyDown = ( k ) => {
    if ( k === Library.keys.A ) {
        aButton++;
        instance.fire( "a-down" );
    }

    if ( k === Library.keys.B ) {
        bButton++;
        instance.fire( "b-down" );
    }

    if ( k === Library.keys.UP ) {
        instance.fire( "d-up" );
    }

    if ( k === Library.keys.RIGHT ) {
        instance.fire( "d-right" );
    }

    if ( k === Library.keys.DOWN ) {
        instance.fire( "d-down" );
    }

    if ( k === Library.keys.LEFT ) {
        instance.fire( "d-left" );
    }
};



export default class KeyManager extends Controller {
    constructor () {
        super();

        if ( !instance ) {
            instance = this;

            document.addEventListener( "keyup", onKeyUp, false );
            document.addEventListener( "keydown", onKeyDown, false );
        }

        return instance;
    }
}
