import Utils from "./Utils";
import Config from "./Config";



export default class GamePad {
    constructor ( player ) {
        this.player = player;
        this.gamepad = null;
        this.gamepadConnected = false;
        this.build();
        this.bind();
    }


/*******************************************************************************
* Blit controls handling
*******************************************************************************/
    blit ( currentTime ) {
        for ( let i = 0; i < this.blitControls.length; i++ ) {
            const control = touchControls[ this.blitControls[ i ] ];

            if ( control.touched && Utils.def( control.hold ) ) {
                const timeSinceHold = currentTime - control.holdTime;

                if ( timeSinceHold >= touchHoldTime ) {
                    this.player.controls[ `${control.btn[ 0 ]}Hold` ] = true;
                    return;
                }

                control.hold++;
            }
        }
    }


    // If connected this should be blit before the main blit above
    blitNativeGamepad () {
        if ( this.gamepadConnected ) {
            this.gamepad = navigator.getGamepads()[ 0 ];

            // GamePad Axes (dpad): [x, y]
            this.handleGamepadAxes();

            // GamePad Buttons (a, b, start, select)
            this.handleGamepadButtons();
        }
    }


    clear () {
        setTimeout( () => {
            this.clearTouches();
            this.cancelTouches();

        }, 300 );
    }


    bind () {
        // Main interface is Touch
        this.element.addEventListener( "touchstart", this.onTouchStart.bind( this ), false );
        this.element.addEventListener( "touchmove", this.onTouchMove.bind( this ), false );
        this.element.addEventListener( "touchend", this.onTouchEnd.bind( this ), false );

        // Support keys for Desktop
        document.addEventListener( "keyup", this.onKeyUp.bind( this ), false );
        document.addEventListener( "keydown", this.onKeyDown.bind( this ), false );

        // Native GamePad interface (NES, SNES USB controllers)
        window.addEventListener( "gamepadconnected", this.onGamepadConnected.bind( this ) );
        window.addEventListener( "gamepaddisconnected", this.onGamepadDisconnected.bind( this ) );
    }


    build () {
        this.element = document.createElement( "div" );
        this.dpad = document.createElement( "div" );
        this.btns = document.createElement( "div" );
        this.menu = document.createElement( "div" );
        this.element.className = "_2dk__gamepad";
        this.dpad.className = "_2dk__gamepad__dpad";
        this.btns.className = "_2dk__gamepad__btns";
        this.menu.className = "_2dk__gamepad__menu";
        this.element.appendChild( this.dpad );
        this.element.appendChild( this.btns );
        this.element.appendChild( this.menu );
        this.diagonaldpad = this.player.data.diagonaldpad;
        this.availableControls = Object.keys( touchControls );
        this.functionalControls = Object.keys( touchControls ).reduce( ( acc, btn ) => {
            if ( btn === "neutral" ) {
                return acc;
            }

            if ( !this.diagonaldpad && touchDiagonals.includes( touchControls[ btn ].key ) ) {
                return acc;
            }

            acc.push( btn );

            return acc;
        }, []);
        this.blitControls = this.availableControls.filter( ( btn ) => {
            return Utils.def( touchControls[ btn ].hold );
        });

        this.availableControls.forEach( ( btn ) => {
            const isFunctional = this.functionalControls.some( ( functional ) => {
                return functional === btn;
            });

            touchControls[ btn ].btn = btn.split( "-" );
            touchControls[ btn ].elem = document.createElement( "div" );
            touchControls[ btn ].elem.className = `_2dk__gamepad__${btn}`;
            touchControls[ btn ].elem.role = "button";

            
            if ( touchControls[ btn ].key ) {
                touchControls[ btn ].elem.dataset.key = touchControls[ btn ].key;
            }
            
            if ( !isFunctional ) {
                touchControls[ btn ].elem.dataset.off = "true";
            }

            this.renderButtonText( btn );

            if ( touchControls[ btn ].dpad ) {
                this.dpad.appendChild( touchControls[ btn ].elem );

            } else if ( touchControls[ btn ].menu ) {
                this.menu.appendChild( touchControls[ btn ].elem );

            } else {
                this.btns.appendChild( touchControls[ btn ].elem );
            }
        });

        this.player.element.appendChild( this.element );

        if ( !this.player.device ) {
            this.element.style.display = "none";
        }
    }


    renderButtonText ( btn ) {
        if ( touchControls[ btn ].text ) {
            touchControls[ btn ].elem.innerHTML = `<span>${touchControls[ btn ].text}</span>`;
        }
    }


    canReceiveInput ( key ) {
        const isDpad = touchDpad.includes( key );
        const hasDpad = inputStream.some( ( input ) => touchDpad.includes( input ) );
        const dpadCheck = this.diagonaldpad || !isDpad ? true : !hasDpad;
        const keyCheck = !inputStream.includes( key );

        return dpadCheck && keyCheck;
    }


    pushInput ( key ) {
        inputStream.push( key );
    }


    removeInput ( key ) {
        if ( inputStream.includes( key ) ) {
            inputStream.splice( inputStream.indexOf( key ), 1 );
        }
    }


    checkDpad () {
        const ctrls = [];

        this.functionalControls.forEach( ( btn ) => {
            if ( touchControls[ btn ].touched && touchControls[ btn ].dpad ) {
                ctrls.push( touchControls[ btn ] );
            }
        });

        // Sort UP and DOWN so they dispatch last in a stream of directions
        return ctrls.sort( ( ctrl ) => {
            if ( ctrl.key === Config.keys.UP || ctrl.key === Config.keys.DOWN ) {
                return 1;

            } else {
                return -1;
            }
        });
    }


    getControl ( key ) {
        let ret = null;

        this.availableControls.forEach( ( btn ) => {
            if ( touchControls[ btn ].key === key ) {
                ret = touchControls[ btn ];
            }
        });

        return ret;
    }


    getTouched ( touches, control ) {
        for ( let i = 0; i < touches.length; i++ ) {
            const touched = document.elementFromPoint( touches[ i ].pageX, touches[ i ].pageY );

            if ( touched.dataset.key === control.key ) {
                return control;
            }
        }

        return null;
    }


    onTouchStart ( e ) {
        e.preventDefault();

        for ( let i = 0; i < e.touches.length; i++ ) {
            const touched = document.elementFromPoint( e.touches[ i ].pageX, e.touches[ i ].pageY );

            if ( touched.dataset.key ) {
                const control = this.getControl( touched.dataset.key );

                this.startTouch( control );
            }
        }

        return false;
    }


    onTouchMove ( e ) {
        e.preventDefault();

        for ( let i = 0; i < e.touches.length; i++ ) {
            const touched = document.elementFromPoint( e.touches[ i ].pageX, e.touches[ i ].pageY );

            if ( touched.dataset.key ) {
                const control = this.getControl( touched.dataset.key );

                if ( control ) {
                    this.startTouch( control );
                }
            }

            this.functionalControls.forEach( ( btn ) => {
                if ( touchControls[ btn ].touched ) {
                    const touched = this.getTouched( e.touches, touchControls[ btn ] );

                    if ( !touched ) {
                        this.cancelTouch( touchControls[ btn ] );
                    }
                }
            });
        }

        return false;
    }


    onTouchEnd ( e ) {
        e.preventDefault();

        if ( !e.touches.length ) {
            this.clearTouches();
            this.cancelTouches();

        } else {
            this.availableControls.forEach( ( btn ) => {
                if ( touchControls[ btn ].touched ) {
                    const touched = this.getTouched( e.touches, touchControls[ btn ] );

                    if ( !touched ) {
                        this.cancelTouch( touchControls[ btn ] );
                    }
                }
            });
        }

        return false;
    }


    onKeyDown ( e ) {
        if ( this.canReceiveInput( e.code ) ) {
            this.pushInput( e.code );

            const control = this.getControl( e.code );

            if ( control ) {
                this.startTouch( control );
            }
        }
    }


    onKeyUp ( e ) {
        if ( !this.canReceiveInput( e.code ) ) {
            this.removeInput( e.code );

            const control = this.getControl( e.code );

            if ( control ) {
                this.cancelTouch( control );
            }
        }
    }


    clearTouches () {
        this.availableControls.forEach( ( btn ) => {
            touchControls[ btn ].elem.classList.remove( "is-active" );
        });
    }


    cancelTouches () {
        this.availableControls.forEach( ( btn ) => {
            if ( touchControls[ btn ].touched ) {
                this.cancelTouch( touchControls[ btn ] );
            }
        });
    }


    cancelTouch ( control ) {
        control.elem.classList.remove( "is-active" );
        control.touched = false;

        if ( control.dpad ) {
            control.dpad.forEach( ( dpad, i ) => {
                this.player.controls[ dpad ] = false;
            });

        } else {
            switch ( control.btn[ 0 ] ) {
                case "start":
                case "select":
                    // Do nothing for start and select buttons here
                    this.player.controls[ control.btn[ 0 ] ] = false;
                    break;
                default:
                    if ( Utils.def( control.holdTime ) ) {
                        // Player will handle this since it needs to distinguish between release and hold-release
                        // this.player.controls[ `${control.btn[ 0 ]}Hold` ] = false;
                        control.hold = 0;
                        control.holdTime = null;
                    }
        
                    this.player.controls[ control.btn[ 0 ] ] = false;
                    this.player.controls[ `${control.btn[ 0 ]}Release` ] = true;
                    break;
            }
        }
    }


    startTouch ( control ) {
        control.elem.classList.add( "is-active" );

        if ( control.dpad ) {
            control.touched = true;
            control.dpad.forEach( ( dpad ) => {
                this.player.controls[ dpad ] = true;
            });

        } else {
            if ( control.touched ) {
                return;
            }

            control.touched = true;

            switch ( control.btn[ 0 ] ) {
                case "start":
                    // First start press initializes the game loop and sets the player to ready
                    // When the game is paused the game loop is stopped and we need to manually handle resuming the game
                    if ( !this.player.ready || ( this.player.ready && this.player.paused ) ) {
                        this.player.onPressStart();
                        return;
                    }
                    // Start presses during gameplay will be handled by the game loop at the end of the render cycle
                    // in order to safely stop the game loop and show the menu
                    this.player.controls.start = true;
                    break;
                case "select":
                    if ( this.player.ready ) {
                        this.player.controls.select = true;
                    }
                    break;
                default:
                    if ( Utils.def( control.hold ) ) {
                        control.holdTime = performance.now();
                    }
        
                    this.player.controls[ control.btn[ 0 ] ] = true;
                    break;
            }
        }
    }



/*******************************************************************************
* Native GamePad Interface
*******************************************************************************/
    getGamepad ( val ) {
        let ret = null;

        this.availableControls.forEach( ( btn ) => {
            if ( touchControls[ btn ].gamepad && touchControls[ btn ].gamepad.indexOf( val ) !== -1 ) {
                ret = touchControls[ btn ];
            }
        });

        return ret;
    }


    getAxes ( xy, val ) {
        let ret = null;

        this.availableControls.forEach( ( btn ) => {
            if ( touchControls[ btn ].axes && touchControls[ btn ].axes[ xy ] === val ) {
                ret = touchControls[ btn ];
            }
        });

        return ret;
    }


    handleGamepadAxes () {
        const controls = {
            x: this.getAxes( 0, this.gamepad.axes[ 0 ] ),
            y: this.getAxes( 1, this.gamepad.axes[ 1 ] ),
        };

        if ( controls.x && this.canReceiveInput( controls.x.key ) ) {
            this.pushInput( controls.x.key );
            this.startTouch( controls.x );

        } else if ( !controls.x ) {
            if ( !this.canReceiveInput( Config.keys.LEFT ) ) {
                this.removeInput( Config.keys.LEFT );
                this.cancelTouch( touchControls.left );
            }

            if ( !this.canReceiveInput( Config.keys.RIGHT ) ) {
                this.removeInput( Config.keys.RIGHT );
                this.cancelTouch( touchControls.right );
            }
        }

        if ( controls.y && this.canReceiveInput( controls.y.key ) ) {
            this.pushInput( controls.y.key );
            this.startTouch( controls.y );

        } else if ( !controls.y ) {
            if ( !this.canReceiveInput( Config.keys.UP ) ) {
                this.removeInput( Config.keys.UP );
                this.cancelTouch( touchControls.up );
            }

            if ( !this.canReceiveInput( Config.keys.DOWN ) ) {
                this.removeInput( Config.keys.DOWN );
                this.cancelTouch( touchControls.down );
            }
        }
    }


    handleGamepadButtons () {
        for ( let i = this.gamepad.buttons.length; i--; ) {
            const control = this.getGamepad( i );

            if ( control && this.canReceiveInput( control.key ) && this.gamepad.buttons[ i ].pressed ) {
                this.pushInput( control.key );
                this.startTouch( control );

            } else if ( control && !this.canReceiveInput( control.key ) && !this.gamepad.buttons[ i ].pressed ) {
                this.removeInput( control.key );
                this.cancelTouch( control );
            }
        }
    }


    onGamepadConnected () {
        this.gamepadConnected = true;
        this.gamepad = navigator.getGamepads()[ 0 ];
        Utils.log( `GamePad Connected: ${this.gamepad.id}`, this.gamepad );
    }


    onGamepadDisconnected () {
        this.gamepadConnected = false;
        Utils.log( "GamePad Disconnected" );
    }
}



const inputStream = [];
const touchHoldTime = 400;
const touchDiagonals = [
    Config.keys.UPLEFT,
    Config.keys.UPRIGHT,
    Config.keys.DOWNLEFT,
    Config.keys.DOWNRIGHT,
];
const touchDpad = [
    Config.keys.UP,
    Config.keys.DOWN,
    Config.keys.LEFT,
    Config.keys.RIGHT,
];

export const touchControls = {
    a: {
        key: Config.keys.A,
        elem: null,
        touched: false,
        hold: 0,
        holdTime: null,
        text: "A",
        gamepad: [0],
    },
    b: {
        key: Config.keys.B,
        elem: null,
        touched: false,
        hold: 0,
        holdTime: null,
        text: "B",
        gamepad: [1],
    },
    start: {
        key: Config.keys.START,
        elem: null,
        touched: false,
        text: "Start",
        menu: true,
        gamepad: [9],
    },
    select: {
        key: Config.keys.SELECT,
        elem: null,
        touched: false,
        text: "Select",
        menu: true,
        gamepad: [8],
    },
    // D-Pad
    "up-left": {
        key: Config.keys.UPLEFT,
        elem: null,
        touched: false,
        dpad: ["left", "up"],
    },
    up: {
        key: Config.keys.UP,
        elem: null,
        touched: false,
        dpad: ["up"],
        axes: [0, -1],
    },
    "up-right": {
        key: Config.keys.UPRIGHT,
        elem: null,
        touched: false,
        dpad: ["right", "up"],
    },
    left: {
        key: Config.keys.LEFT,
        elem: null,
        touched: false,
        dpad: ["left"],
        axes: [-1, 0],
    },
    neutral: {
        // D-pad center (non-interactive)
        elem: null,
        dpad: [],
    },
    right: {
        key: Config.keys.RIGHT,
        elem: null,
        touched: false,
        dpad: ["right"],
        axes: [1, 0],
    },
    "down-left": {
        key: Config.keys.DOWNLEFT,
        elem: null,
        touched: false,
        dpad: ["left", "down"],
    },
    down: {
        key: Config.keys.DOWN,
        elem: null,
        touched: false,
        dpad: ["down"],
        axes: [0, 1],
    },
    "down-right": {
        key: Config.keys.DOWNRIGHT,
        elem: null,
        touched: false,
        dpad: ["right", "down"],
    },
};