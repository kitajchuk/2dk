import Config from "./Config";
import Controller from "properjs-controller";



const inputStream = [];
const touchInterval = Config.values.speed;
const touchRepeated = Config.values.repeat;
const touchControls = {
    a: {
        key: Config.keys.A,
        elem: null,
        timer: null,
        touched: false,
        hold: 0,
        text: "A",
    },
    b: {
        key: Config.keys.B,
        elem: null,
        timer: null,
        touched: false,
        hold: 0,
        text: "B",
    },
    start: {
        key: Config.keys.START,
        elem: null,
        timer: null,
        touched: false,
        hold: 0,
        text: "Start",
        menu: true,
    },
    select: {
        key: Config.keys.SELECT,
        elem: null,
        hold: 0,
        timer: null,
        touched: false,
        text: "Select",
        menu: true,
    },
    // D-Pad
    up: {
        key: Config.keys.UP,
        elem: null,
        timer: null,
        touched: false,
        dpad: Config.moves.UP,
    },
    down: {
        key: Config.keys.DOWN,
        elem: null,
        timer: null,
        touched: false,
        dpad: Config.moves.DOWN,
    },
    right: {
        key: Config.keys.RIGHT,
        elem: null,
        timer: null,
        touched: false,
        dpad: Config.moves.RIGHT,
    },
    left: {
        key: Config.keys.LEFT,
        elem: null,
        timer: null,
        touched: false,
        dpad: Config.moves.LEFT,
    },
};
let instance = null;



const getControl = ( key ) => {
    let ret = null;

    for ( let btn in touchControls ) {
        if ( touchControls[ btn ].key === key ) {
            ret = touchControls[ btn ];
            break;
        }
    }

    return ret;
};



const getDpad = ( key ) => {
    let ret = null;

    for ( let btn in touchControls ) {
        if ( touchControls[ btn ].key === key && touchControls[ btn ].dpad ) {
            ret = touchControls[ btn ];
            break;
        }
    }

    return ret;
};



const getTouched = ( touches, control ) => {
    let ret = null;

    for ( let i = 0; i < touches.length; i++ ) {
        const touched = document.elementFromPoint( touches[ i ].pageX, touches[ i ].pageY );
        const key = Number( touched.dataset.key );

        if ( key === control.key ) {
            ret = control;
            break;
        }
    }

    return ret;
};



const onTouchStart = ( e ) => {
    e.preventDefault();

    for ( let i = 0; i < e.touches.length; i++ ) {
        const touched = document.elementFromPoint( e.touches[ i ].pageX, e.touches[ i ].pageY );
        const key = Number( touched.dataset.key );

        if ( key ) {
            const control = getControl( key );

            startTouch( control );
        }
    }

    return false;
};



const onTouchMove = ( e ) => {
    e.preventDefault();

    for ( let i = 0; i < e.touches.length; i++ ) {
        const touched = document.elementFromPoint( e.touches[ i ].pageX, e.touches[ i ].pageY );
        const key = Number( touched.dataset.key );

        if ( key ) {
            const control = getControl( key );

            if ( control ) {
                startTouch( control );
            }
        }

        for ( let btn in touchControls ) {
            if ( touchControls[ btn ].touched ) {
                const touched = getTouched( e.touches, touchControls[ btn ] );

                if ( !touched ) {
                    cancelTouch( touchControls[ btn ] );
                }
            }
        }
    }

    return false;
};



const onTouchEnd = ( e ) => {
    e.preventDefault();

    if ( !e.touches.length ) {
        clearTouches();
        cancelTouches();

    } else {
        for ( let btn in touchControls ) {
            if ( touchControls[ btn ].touched ) {
                const touched = getTouched( e.touches, touchControls[ btn ] );

                if ( !touched ) {
                    cancelTouch( touchControls[ btn ] );
                }
            }
        }
    }

    return false;
};



const onKeyDown = ( e ) => {
    if ( inputStream.indexOf( e.which ) === -1 ) {
        inputStream.push( e.which );

        const control = getControl( e.which );

        if ( control ) {
            startTouch( control );
        }
    }
};



const onKeyUp = ( e ) => {
    if ( inputStream.indexOf( e.which ) !== -1 ) {
        inputStream.splice( inputStream.indexOf( e.which ), 1 );

        const control = getControl( e.which );

        if ( control ) {
            cancelTouch( control );
        }
    }
};



const clearTouches = () => {
    for ( let btn in touchControls ) {
        touchControls[ btn ].elem.classList.remove( "is-active" );
    }
};



const cancelTouches = () => {
    for ( let btn in touchControls ) {
        if ( touchControls[ btn ].timer ) {
            cancelTouch( touchControls[ btn ] );
        }
    }
};



const cancelTouch = ( control ) => {
    if ( control.timer ) {
        clearInterval( control.timer );
        control.timer = null;
    }

    control.elem.classList.remove( "is-active" );
    control.touched = false;

    handleTouchEnd( control );
};



const startTouch = ( control ) => {
    if ( !control.timer ) {
        control.elem.classList.add( "is-active" );
        control.touched = true;

        handleTouchStart( control );

        control.timer = setInterval(() => {
            handleTouchStart( control );

        }, touchInterval );
    }
};



const handleTouchStart = ( control ) => {
    if ( control.touched && control.menu && control.hold > 0 ) {
        control.hold++;
        // console.log( `suspended ${control.btn}` );
        return;
    }

    if ( control.hasOwnProperty( "hold" ) ) {
        control.hold++;

        if ( control.hold > touchRepeated ) {
            instance.fire( `${control.btn}-longpress` );
            // console.log( `${control.btn}-longpress` );

        } else {
            instance.fire( `${control.btn}-press` );
            // console.log( `${control.btn}-press` );
        }

    } else {
        instance.fire( `${control.btn}-press`, (control.dpad || null) );
        // console.log( `${control.btn}-press` );
    }
};



const handleTouchEnd = ( control ) => {
    if ( control.hasOwnProperty( "hold" ) ) {
        if ( control.hold > touchRepeated ) {
            instance.fire( `${control.btn}-longrelease` );
            console.log( `${control.btn}-longrelease` );

        } else {
            instance.fire( `${control.btn}-release` );
            console.log( `${control.btn}-release` );
        }

        control.hold = 0;

    } else {
        instance.fire( `${control.btn}-release`, (control.dpad || null) );
        // console.log( `${control.btn}-release` );
    }
};



export default class GamePad extends Controller {
    constructor () {
        super();

        if ( !instance ) {
            instance = this;

            this.build();
            this.bind();
        }

        return instance;
    }


    bind () {
        // Main interface is Touch
        this.element.addEventListener( "touchstart", onTouchStart, false );
        this.element.addEventListener( "touchmove", onTouchMove, false );
        this.element.addEventListener( "touchend", onTouchEnd, false );

        // Support keys for Desktop
        document.addEventListener( "keyup", onKeyUp, false );
        document.addEventListener( "keydown", onKeyDown, false );
    }


    build () {
        this.element = document.createElement( "div" );
        this.element.className = "_2dk__gamepad";

        for ( let btn in touchControls ) {
            touchControls[ btn ].btn = btn;
            touchControls[ btn ].elem = document.createElement( "div" );
            touchControls[ btn ].elem.className = `_2dk__gamepad__${btn}`;
            touchControls[ btn ].elem.dataset.key = touchControls[ btn ].key;

            if ( touchControls[ btn ].text ) {
                touchControls[ btn ].elem.innerHTML = `<span>${touchControls[ btn ].text}</span>`;
            }

            this.element.appendChild( touchControls[ btn ].elem );
        }
    }
}
