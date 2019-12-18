import Library from "./Library";
import Controller from "properjs-controller";



const timers = {};
const touchInterval = Library.values.speed;
const touchRepeated = Library.values.repeat;
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
        startTouch( Library.keys.UP );
        elem.classList.add( "is-active" );

    } else if ( /right/.test( elem.className ) ) {
        endTouches();
        startTouch( Library.keys.RIGHT );
        elem.classList.add( "is-active" );

    } else if ( /down/.test( elem.className ) ) {
        endTouches();
        startTouch( Library.keys.DOWN );
        elem.classList.add( "is-active" );

    } else if ( /left/.test( elem.className ) ) {
        endTouches();
        startTouch( Library.keys.LEFT );
        elem.classList.add( "is-active" );
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

    startTouch( Library.keys.UP );

    controlsUp.classList.add( "is-active" );

    return false;
};



const onStartRight = ( e ) => {
    e.preventDefault();

    startTouch( Library.keys.RIGHT );

    controlsRight.classList.add( "is-active" );

    return false;
};



const onStartDown = ( e ) => {
    e.preventDefault();

    startTouch( Library.keys.DOWN );

    controlsDown.classList.add( "is-active" );

    return false;
};



const onStartLeft = ( e ) => {
    e.preventDefault();

    startTouch( Library.keys.LEFT );

    controlsLeft.classList.add( "is-active" );

    return false;
};



const onStartA = ( e ) => {
    e.preventDefault();

    startTouch( Library.keys.A );

    controlsA.classList.add( "is-active" );

    return false;
};



const onStartB = ( e ) => {
    e.preventDefault();

    startTouch( Library.keys.B );

    controlsB.classList.add( "is-active" );

    return false;
};



const onStartStart = ( e ) => {
    e.preventDefault();

    startTouch( Library.keys.START );

    controlsStart.classList.add( "is-active" );

    return false;
};



const onStartSelect = ( e ) => {
    e.preventDefault();

    startTouch( Library.keys.SELECT );

    controlsSelect.classList.add( "is-active" );

    return false;
};



const onEndUp = ( e ) => {
    e.preventDefault();

    endTouch( Library.keys.UP );

    controlsUp.classList.remove( "is-active" );

    return false;
};



const onEndRight = ( e ) => {
    e.preventDefault();

    endTouch( Library.keys.RIGHT );

    controlsRight.classList.remove( "is-active" );

    return false;
};



const onEndDown = ( e ) => {
    e.preventDefault();

    endTouch( Library.keys.DOWN );

    controlsDown.classList.remove( "is-active" );

    return false;
};



const onEndLeft = ( e ) => {
    e.preventDefault();

    endTouch( Library.keys.LEFT );

    controlsLeft.classList.remove( "is-active" );

    return false;
};



const onEndA = ( e ) => {
    e.preventDefault();

    endTouch( Library.keys.A );

    controlsA.classList.remove( "is-active" );

    return false;
};



const onEndB = ( e ) => {
    e.preventDefault();

    endTouch( Library.keys.B );

    controlsB.classList.remove( "is-active" );

    return false;
};



const onEndStart = ( e ) => {
    e.preventDefault();

    endTouch( Library.keys.START );

    controlsStart.classList.remove( "is-active" );

    return false;
};



const onEndSelect = ( e ) => {
    e.preventDefault();

    endTouch( Library.keys.SELECT );

    controlsSelect.classList.remove( "is-active" );

    return false;
};



const onGameTouchEnd = ( k ) => {
    if ( k === Library.keys.A ) {
        instance.fire( "a-release" );

        if ( aButton < touchRepeated ) {
            instance.fire( "a" );
        }

        aButton = 0;
    }

    if ( k === Library.keys.B ) {
        instance.fire( "b-release" );

        if ( bButton < touchRepeated ) {
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



const onGameTouchStart = ( k ) => {
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
