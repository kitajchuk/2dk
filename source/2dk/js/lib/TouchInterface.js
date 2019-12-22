import Config from "./Config";
import Controller from "properjs-controller";



const timers = {};
const touchInterval = Config.values.speed;
const touchRepeated = Config.values.repeat;
let aButton = 0;
let bButton = 0;
let controls = null;
let controlsUp = null;
let controlsRight = null;
let controlsDown = null;
let controlsLeft = null;
let controlsA = null;
let controlsB = null;
let controlsStart = null;
let controlsSelect = null;
let instance = null;



const onTouchEnd = ( e ) => {
    e.preventDefault();

    endTouches();

    controlsUp.classList.remove( "is-active" );
    controlsLeft.classList.remove( "is-active" );
    controlsRight.classList.remove( "is-active" );
    controlsDown.classList.remove( "is-active" );

    return false;
};



const onTouchMove = ( e ) => {
    e.preventDefault();

    console.log( e );

    const elem = document.elementFromPoint(
        e.touches[ 0 ].pageX,
        e.touches[ 0 ].pageY
    );

    // Move off of a specific control
    if ( elem.className === "_2dk__controls" ) {
        endTouches();

        controlsUp.classList.remove( "is-active" );
        controlsLeft.classList.remove( "is-active" );
        controlsRight.classList.remove( "is-active" );
        controlsDown.classList.remove( "is-active" );

    // Move into a specific control
    } else if ( /up/.test( elem.className ) ) {
        endTouches();
        onStartUp( e );

    } else if ( /right/.test( elem.className ) ) {
        endTouches();
        onStartRight( e );

    } else if ( /down/.test( elem.className ) ) {
        endTouches();
        onStartDown( e );

    } else if ( /left/.test( elem.className ) ) {
        endTouches();
        onStartLeft( e );
    }

    return false;
};



const endTouches = () => {
    for ( const k in timers ) {
        if ( timers.hasOwnProperty( k ) ) {
            endTouch( k );
        }
    }
};



const endTouch = ( k ) => {
    if ( timers[ k ] ) {
        clearInterval( timers[ k ] );

        delete timers[ k ];
    }

    onGameTouchEnd( k );
};



const startTouch = ( k ) => {
    if ( !timers[ k ] ) {
        onGameTouchStart( k );

        timers[ k ] = setInterval(() => {
            onGameTouchStart( k );

        }, touchInterval );
    }
};



const onStartUp = ( e ) => {
    e.preventDefault();

    startTouch( Config.keys.UP );

    controlsUp.classList.add( "is-active" );

    return false;
};



const onStartRight = ( e ) => {
    e.preventDefault();

    startTouch( Config.keys.RIGHT );

    controlsRight.classList.add( "is-active" );

    return false;
};



const onStartDown = ( e ) => {
    e.preventDefault();

    startTouch( Config.keys.DOWN );

    controlsDown.classList.add( "is-active" );

    return false;
};



const onStartLeft = ( e ) => {
    e.preventDefault();

    startTouch( Config.keys.LEFT );

    controlsLeft.classList.add( "is-active" );

    return false;
};



const onStartA = ( e ) => {
    e.preventDefault();

    startTouch( Config.keys.A );

    controlsA.classList.add( "is-active" );

    return false;
};



const onStartB = ( e ) => {
    e.preventDefault();

    startTouch( Config.keys.B );

    controlsB.classList.add( "is-active" );

    return false;
};



const onStartStart = ( e ) => {
    e.preventDefault();

    startTouch( Config.keys.START );

    controlsStart.classList.add( "is-active" );

    return false;
};



const onStartSelect = ( e ) => {
    e.preventDefault();

    startTouch( Config.keys.SELECT );

    controlsSelect.classList.add( "is-active" );

    return false;
};



const onEndUp = ( e ) => {
    e.preventDefault();

    endTouch( Config.keys.UP );

    controlsUp.classList.remove( "is-active" );

    return false;
};



const onEndRight = ( e ) => {
    e.preventDefault();

    endTouch( Config.keys.RIGHT );

    controlsRight.classList.remove( "is-active" );

    return false;
};



const onEndDown = ( e ) => {
    e.preventDefault();

    endTouch( Config.keys.DOWN );

    controlsDown.classList.remove( "is-active" );

    return false;
};



const onEndLeft = ( e ) => {
    e.preventDefault();

    endTouch( Config.keys.LEFT );

    controlsLeft.classList.remove( "is-active" );

    return false;
};



const onEndA = ( e ) => {
    e.preventDefault();

    endTouch( Config.keys.A );

    controlsA.classList.remove( "is-active" );

    return false;
};



const onEndB = ( e ) => {
    e.preventDefault();

    endTouch( Config.keys.B );

    controlsB.classList.remove( "is-active" );

    return false;
};



const onEndStart = ( e ) => {
    e.preventDefault();

    endTouch( Config.keys.START );

    controlsStart.classList.remove( "is-active" );

    return false;
};



const onEndSelect = ( e ) => {
    e.preventDefault();

    endTouch( Config.keys.SELECT );

    controlsSelect.classList.remove( "is-active" );

    return false;
};



const onGameTouchEnd = ( k ) => {
    // Force number type
    k = Number( k );

    if ( k === Config.keys.A ) {
        instance.fire( "a-release" );

        if ( aButton < touchRepeated ) {
            instance.fire( "a" );
        }

        aButton = 0;
    }

    if ( k === Config.keys.B ) {
        instance.fire( "b-release" );

        if ( bButton < touchRepeated ) {
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



const onGameTouchStart = ( k ) => {
    // Force number type
    k = Number( k );

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



export default class TouchInterface extends Controller {
    constructor () {
        super();

        if ( !instance ) {
            instance = this;

            this.build();

            document.addEventListener( "touchmove", onTouchMove, false );
            document.addEventListener( "touchend", onTouchEnd, false );

            controlsUp.addEventListener( "touchstart", onStartUp, false );
            controlsRight.addEventListener( "touchstart", onStartRight, false );
            controlsDown.addEventListener( "touchstart", onStartDown, false );
            controlsLeft.addEventListener( "touchstart", onStartLeft, false );
            controlsA.addEventListener( "touchstart", onStartA, false );
            controlsB.addEventListener( "touchstart", onStartB, false );
            controlsStart.addEventListener( "touchstart", onStartStart, false );
            controlsSelect.addEventListener( "touchstart", onStartSelect, false );

            controlsUp.addEventListener( "touchend", onEndUp, false );
            controlsRight.addEventListener( "touchend", onEndRight, false );
            controlsDown.addEventListener( "touchend", onEndDown, false );
            controlsLeft.addEventListener( "touchend", onEndLeft, false );
            controlsA.addEventListener( "touchend", onEndA, false );
            controlsB.addEventListener( "touchend", onEndB, false );
            controlsStart.addEventListener( "touchend", onEndStart, false );
            controlsSelect.addEventListener( "touchend", onEndSelect, false );
        }

        return instance;
    }


    build () {
        controls = document.createElement( "div" );
        controlsUp = document.createElement( "div" );
        controlsRight = document.createElement( "div" );
        controlsDown = document.createElement( "div" );
        controlsLeft = document.createElement( "div" );
        controlsA = document.createElement( "div" );
        controlsB = document.createElement( "div" );
        controlsStart = document.createElement( "div" );
        controlsSelect = document.createElement( "div" );

        controls.className = "_2dk__controls";
        controlsUp.className = "_2dk__controls__up";
        controlsRight.className = "_2dk__controls__right";
        controlsDown.className = "_2dk__controls__down";
        controlsLeft.className = "_2dk__controls__left";
        controlsA.className = "_2dk__controls__a";
        controlsB.className = "_2dk__controls__b";
        controlsStart.className = "_2dk__controls__start";
        controlsSelect.className = "_2dk__controls__select";

        controlsA.innerHTML = "<span>A</span>";
        controlsB.innerHTML = "<span>B</span>";
        controlsStart.innerHTML = "<span>Start</span>";
        controlsSelect.innerHTML = "<span>Select</span>";

        controls.appendChild( controlsUp );
        controls.appendChild( controlsRight );
        controls.appendChild( controlsDown );
        controls.appendChild( controlsLeft );
        controls.appendChild( controlsA );
        controls.appendChild( controlsB );
        controls.appendChild( controlsStart );
        controls.appendChild( controlsSelect );

        this.element = controls;
    }
}
