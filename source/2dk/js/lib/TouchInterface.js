import Library from "./Library";
import Controller from "properjs-controller";
import $ from "properjs-hobo";



const timers = {};
const touchInterval = 1;
const touchRepeated = 50;
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
let directions = [];
let instance = null;



const onPreventStart = ( e ) => {
    e.preventDefault();
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
        $( directions ).removeClass( "is-active" );

    // Move into a specific control
    } else if ( /up/.test( elem.className ) ) {
        startTouch( Library.keys.UP );
        $( elem ).addClass( "is-active" );

    } else if ( /right/.test( elem.className ) ) {
        startTouch( Library.keys.RIGHT );
        $( elem ).addClass( "is-active" );

    } else if ( /down/.test( elem.className ) ) {
        startTouch( Library.keys.DOWN );
        $( elem ).addClass( "is-active" );

    } else if ( /left/.test( elem.className ) ) {
        startTouch( Library.keys.LEFT );
        $( elem ).addClass( "is-active" );
    }
};



const endTouches = () => {
    for ( const k in timers ) {
        if ( timers.hasOwnProperty( k ) ) {
            endTouch( k );
        }
    }
};



const startTouch = ( k ) => {
    if ( !timers[ k ] ) {
        onGameTouchStart( k );

        timers[ k ] = setInterval(() => {
            onGameTouchStart( k );

        }, touchInterval );
    }
};



const endTouch = ( k ) => {
    if ( timers[ k ] ) {
        clearInterval( timers[ k ] );

        delete timers[ k ];
    }

    onGameTouchEnd( k );
};



const onStartUp = () => {
    startTouch( Library.keys.UP );

    $( controlsUp ).addClass( "is-active" );
};



const onStartRight = () => {
    startTouch( Library.keys.RIGHT );

    $( controlsRight ).addClass( "is-active" );
};



const onStartDown = () => {
    startTouch( Library.keys.DOWN );

    $( controlsDown ).addClass( "is-active" );
};



const onStartLeft = () => {
    startTouch( Library.keys.LEFT );

    $( controlsLeft ).addClass( "is-active" );
};



const onStartA = () => {
    startTouch( Library.keys.A );

    $( controlsA ).addClass( "is-active" );
};



const onStartB = () => {
    startTouch( Library.keys.B );

    $( controlsB ).addClass( "is-active" );
};



const onStartStart = () => {
    startTouch( Library.keys.START );

    $( controlsStart ).addClass( "is-active" );
};



const onStartSelect = () => {
    startTouch( Library.keys.SELECT );

    $( controlsSelect ).addClass( "is-active" );
};



const onEndUp = () => {
    endTouch( Library.keys.UP );

    $( controlsUp ).removeClass( "is-active" );
};



const onEndRight = () => {
    endTouch( Library.keys.RIGHT );

    $( controlsRight ).removeClass( "is-active" );
};



const onEndDown = () => {
    endTouch( Library.keys.DOWN );

    $( controlsDown ).removeClass( "is-active" );
};



const onEndLeft = () => {
    endTouch( Library.keys.LEFT );

    $( controlsLeft ).removeClass( "is-active" );
};



const onEndA = () => {
    endTouch( Library.keys.A );

    $( controlsA ).removeClass( "is-active" );
};



const onEndB = () => {
    endTouch( Library.keys.B );

    $( controlsB ).removeClass( "is-active" );
};



const onEndStart = () => {
    endTouch( Library.keys.START );

    $( controlsStart ).removeClass( "is-active" );
};



const onEndSelect = () => {
    endTouch( Library.keys.SELECT );

    $( controlsSelect ).removeClass( "is-active" );
};



const onGameTouchEnd = ( k ) => {
    if ( k === Library.keys.A ) {
        instance.fire( "a-up" );

        if ( aButton < touchRepeated ) {
            instance.fire( "a" );
        }

        aButton = 0;
    }

    if ( k === Library.keys.B ) {
        instance.fire( "b-up" );

        if ( bButton < touchRepeated ) {
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



const onGameTouchStart = ( k ) => {
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



export default class TouchInterface extends Controller {
    constructor () {
        super();

        if ( !instance ) {
            instance = this;

            this.build();

            // Prevent default on all touchstarts
            document.addEventListener( "touchstart", onPreventStart, false );
            document.addEventListener( "touchmove", onTouchMove, false );

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

        directions = [controlsUp, controlsRight, controlsDown, controlsLeft];

        this.element = controls;
    }
}
