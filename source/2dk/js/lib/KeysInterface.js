import Config from "./Config";
import Controller from "properjs-controller";
import $ from "properjs-hobo";


const timers = {};
const keyInterval = Config.values.speed;
const keyRepeated = Config.values.repeat;
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
    if ( k === Config.keys.A ) {
        instance.fire( "a-release" );

        if ( aButton < keyRepeated ) {
            instance.fire( "a" );
        }

        aButton = 0;
    }

    if ( k === Config.keys.B ) {
        instance.fire( "b-release" );

        if ( bButton < keyRepeated ) {
            instance.fire( "b" );
        }

        bButton = 0;
    }

    if ( k === Config.keys.UP ) {
        instance.fire( "d-up-release", Config.moves.UP );
    }

    if ( k === Config.keys.RIGHT ) {
        instance.fire( "d-right-release", Config.moves.RIGHT );
    }

    if ( k === Config.keys.DOWN ) {
        instance.fire( "d-down-release", Config.moves.DOWN );
    }

    if ( k === Config.keys.LEFT ) {
        instance.fire( "d-left-release", Config.moves.LEFT );
    }
};



const onGameKeyDown = ( k ) => {
    if ( k === Config.keys.A ) {
        // Longpress ( hold )
        aButton++;
        instance.fire( "a-press" );
    }

    if ( k === Config.keys.B ) {
        // Longpress ( hold )
        bButton++;
        instance.fire( "b-press" );
    }

    if ( k === Config.keys.START ) {
        instance.fire( "start" );
    }

    if ( k === Config.keys.SELECT ) {
        instance.fire( "select" );
    }

    if ( k === Config.keys.UP ) {
        instance.fire( "d-up-press", Config.moves.UP );
    }

    if ( k === Config.keys.RIGHT ) {
        instance.fire( "d-right-press", Config.moves.RIGHT );
    }

    if ( k === Config.keys.DOWN ) {
        instance.fire( "d-down-press", Config.moves.DOWN );
    }

    if ( k === Config.keys.LEFT ) {
        instance.fire( "d-left-press", Config.moves.LEFT );
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
