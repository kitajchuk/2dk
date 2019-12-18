import Library from "./Library";
import Controller from "properjs-controller";
import $ from "properjs-hobo";


const timers = {};
const keyInterval = Library.values.speed;
const keyRepeated = Library.values.repeat;
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
        instance.fire( "a-release" );

        if ( aButton < keyRepeated ) {
            instance.fire( "a" );
        }

        aButton = 0;
    }

    if ( k === Library.keys.B ) {
        instance.fire( "b-release" );

        if ( bButton < keyRepeated ) {
            instance.fire( "b" );
        }

        bButton = 0;
    }

    if ( k === Library.keys.UP ) {
        instance.fire( "d-up-release", Library.moves.UP );
    }

    if ( k === Library.keys.RIGHT ) {
        instance.fire( "d-right-release", Library.moves.RIGHT );
    }

    if ( k === Library.keys.DOWN ) {
        instance.fire( "d-down-release", Library.moves.DOWN );
    }

    if ( k === Library.keys.LEFT ) {
        instance.fire( "d-left-release", Library.moves.LEFT );
    }
};



const onGameKeyDown = ( k ) => {
    if ( k === Library.keys.A ) {
        // Longpress ( hold )
        aButton++;
        instance.fire( "a-press" );
    }

    if ( k === Library.keys.B ) {
        // Longpress ( hold )
        bButton++;
        instance.fire( "b-press" );
    }

    if ( k === Library.keys.START ) {
        instance.fire( "start" );
    }

    if ( k === Library.keys.SELECT ) {
        instance.fire( "select" );
    }

    if ( k === Library.keys.UP ) {
        instance.fire( "d-up-press", Library.moves.UP );
    }

    if ( k === Library.keys.RIGHT ) {
        instance.fire( "d-right-press", Library.moves.RIGHT );
    }

    if ( k === Library.keys.DOWN ) {
        instance.fire( "d-down-press", Library.moves.DOWN );
    }

    if ( k === Library.keys.LEFT ) {
        instance.fire( "d-left-press", Library.moves.LEFT );
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
