const Config = require( "./Config" );
const Controller = require( "properjs-controller" );



const inputStream = [];
const touchInterval = 8;
const touchRepeated = 50;
const touchControls = {
    a: {
        key: Config.keys.A,
        elem: null,
        timer: null,
        touched: false,
        hold: 0,
        text: "A",
        gamepad: [0],
    },
    b: {
        key: Config.keys.B,
        elem: null,
        timer: null,
        touched: false,
        hold: 0,
        text: "B",
        gamepad: [1],
    },
    start: {
        key: Config.keys.START,
        elem: null,
        timer: null,
        touched: false,
        hold: 0,
        text: "Start",
        menu: true,
        gamepad: [9],
    },
    select: {
        key: Config.keys.SELECT,
        elem: null,
        hold: 0,
        timer: null,
        touched: false,
        text: "Select",
        menu: true,
        gamepad: [8],
    },
    // D-Pad
    "up-left": {
        key: Config.keys.UPLEFT,
        elem: null,
        timer: null,
        touched: false,
        dpad: ["left", "up"],
    },
    up: {
        key: Config.keys.UP,
        elem: null,
        timer: null,
        touched: false,
        dpad: ["up"],
        axes: [0, -1],
    },
    "up-right": {
        key: Config.keys.UPRIGHT,
        elem: null,
        timer: null,
        touched: false,
        dpad: ["right", "up"],
    },
    left: {
        key: Config.keys.LEFT,
        elem: null,
        timer: null,
        touched: false,
        dpad: ["left"],
        axes: [-1, 0],
    },
    neutral: {
        elem: null,
        dpad: [],
    },
    right: {
        key: Config.keys.RIGHT,
        elem: null,
        timer: null,
        touched: false,
        dpad: ["right"],
        axes: [1, 0],
    },
    "down-left": {
        key: Config.keys.DOWNLEFT,
        elem: null,
        timer: null,
        touched: false,
        dpad: ["left", "down"],
    },
    down: {
        key: Config.keys.DOWN,
        elem: null,
        timer: null,
        touched: false,
        dpad: ["down"],
        axes: [0, 1],
    },
    "down-right": {
        key: Config.keys.DOWNRIGHT,
        elem: null,
        timer: null,
        touched: false,
        dpad: ["right", "down"],
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



const getGamepad = ( val ) => {
    let ret = null;

    for ( let btn in touchControls ) {
        if ( touchControls[ btn ].gamepad && touchControls[ btn ].gamepad.indexOf( val ) !== -1 ) {
            ret = touchControls[ btn ];
            break;
        }
    }

    return ret;
};



const getAxes = ( xy, val ) => {
    let ret = null;

    for ( let btn in touchControls ) {
        if ( touchControls[ btn ].axes && touchControls[ btn ].axes[ xy ] === val ) {
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



const onGamepadConnected = ( e ) => {
    instance.stop();
    instance.go(() => {
        const gamepad = navigator.getGamepads()[ 0 ];

        // GamePad Axes (dpad): [x, y]
        const controls = {
            x: getAxes( 0, gamepad.axes[ 0 ] ),
            y: getAxes( 1, gamepad.axes[ 1 ] ),
        };

        if ( controls.x ) {
            startTouch( controls.x );

        } else {
            cancelTouch( touchControls.left );
            cancelTouch( touchControls.right );
        }

        if ( controls.y ) {
            startTouch( controls.y );

        } else {
            cancelTouch( touchControls.up );
            cancelTouch( touchControls.down );
        }

        for ( let i = gamepad.buttons.length; i--; ) {
            const control = getGamepad( i );

            if ( control && gamepad.buttons[ i ].pressed ) {
                startTouch( control );

            } else if ( control ) {
                cancelTouch( control );
            }
        }
    });

    console.log( `GamePad Connected: ${navigator.getGamepads()[ 0 ].id}` );
};



const onGamepadDisconnected = ( e ) => {
    instance.stop();
};



const clearTouches = () => {
    for ( let btn in touchControls ) {
        touchControls[ btn ].elem.classList.remove( "is-active" );
    }
};



const cancelTouches = () => {
    for ( let btn in touchControls ) {
        if ( touchControls[ btn ].touched ) {
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

        if ( control.hasOwnProperty( "hold" ) && !control.menu ) {
            control.timer = setInterval(() => {
                handleTouchStart( control );

            }, touchInterval );
        }
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
            instance.fire( `${control.btn[ 0 ]}-holdpress` );
            // console.log( `${control.btn[ 0 ]}-holdpress` );

        } else {
            instance.fire( `${control.btn[ 0 ]}-press` );
            // console.log( `${control.btn[ 0 ]}-press` );
        }

    } else if ( control.dpad ) {
        control.dpad.forEach(( dpad, i ) => {
            instance.fire( `${control.btn[ i ]}-press`, dpad );
            // console.log( `${control.btn[ i ]}-press` );
        });

    } else {
        instance.fire( `${control.btn[ 0 ]}-press`, null );
        // console.log( `${control.btn[ 0 ]}-press` );
    }
};



const handleTouchEnd = ( control ) => {
    if ( control.hasOwnProperty( "hold" ) ) {
        if ( control.hold > touchRepeated ) {
            instance.fire( `${control.btn[ 0 ]}-holdrelease` );
            // console.log( `${control.btn[ 0 ]}-holdrelease` );

        } else {
            instance.fire( `${control.btn[ 0 ]}-release` );
            // console.log( `${control.btn[ 0 ]}-release` );
        }

        control.hold = 0;

    } else if ( control.dpad ) {
        instance.fire( `${control.btn[ 0 ]}-release`, control.dpad[ 0 ] );
        // console.log( `${control.btn[ i ]}-release` );

    } else {
        instance.fire( `${control.btn[ 0 ]}-release`, null );
        // console.log( `${control.btn[ 0 ]}-release` );
    }
};



class GamePad extends Controller {
    constructor ( player ) {
        super();

        if ( !instance ) {
            instance = this;

            this.player = player;
            this.build();
            this.bind();
        }

        return instance;
    }


    clear () {
        clearTouches();
        cancelTouches();
    }


    bind () {
        // Main interface is Touch
        this.element.addEventListener( "touchstart", onTouchStart, false );
        this.element.addEventListener( "touchmove", onTouchMove, false );
        this.element.addEventListener( "touchend", onTouchEnd, false );

        // Support keys for Desktop
        document.addEventListener( "keyup", onKeyUp, false );
        document.addEventListener( "keydown", onKeyDown, false );

        // Native GamePad interface (NES, SNES USB controllers)
        window.addEventListener( "gamepadconnected", onGamepadConnected );
        window.addEventListener( "gamepaddisconnected", onGamepadDisconnected );
    }


    build () {
        this.element = document.createElement( "div" );
        this.dpad = document.createElement( "div" );
        this.btns = document.createElement( "div" );
        this.element.className = "_2dk__gamepad";
        this.dpad.className = "_2dk__gamepad__dpad";
        this.btns.className = "_2dk__gamepad__btns";
        this.element.appendChild( this.dpad );
        this.element.appendChild( this.btns );

        for ( let btn in touchControls ) {
            touchControls[ btn ].btn = btn.split( "-" );
            touchControls[ btn ].elem = document.createElement( "div" );
            touchControls[ btn ].elem.className = `_2dk__gamepad__${btn}`;
            touchControls[ btn ].elem.dataset.key = touchControls[ btn ].key;

            if ( touchControls[ btn ].text ) {
                touchControls[ btn ].elem.innerHTML = `<span>${touchControls[ btn ].text}</span>`;
            }

            if ( touchControls[ btn ].dpad ) {
                this.dpad.appendChild( touchControls[ btn ].elem );

            } else {
                this.btns.appendChild( touchControls[ btn ].elem );
            }
        }

        this.player.element.appendChild( this.element );
    }


    checkDpad () {
        const ctrls = [];

        for ( let btn in touchControls ) {
            if ( touchControls[ btn ].touched && touchControls[ btn ].dpad ) {
                ctrls.push( touchControls[ btn ] );
            }
        }

        // Sort UP and DOWN to be last the dispatch in a stream of directions
        return ctrls.sort(( ctrl ) => {
            if ( ctrl.key === Config.keys.UP || ctrl.key === Config.keys.DOWN ) {
                return 1;

            } else {
                return -1;
            }
        });
    }
}



module.exports = GamePad;
