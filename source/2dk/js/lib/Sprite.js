const Loader = require( "./Loader" );
const Config = require( "./Config" );
const $ = require( "properjs-hobo" );
const { TweenLite } = require( "gsap" );



class Sprite {
    // width, height, image, name
    constructor ( data ) {
        this.data = data;
        this.width = data.width;
        this.height = data.height;
        this.loader = new Loader();
        this.cycling = false;
        this.dir = "";
        this.offset = {
            x: data.spawn.x,
            y: data.spawn.y
        };
        this.hitbox = {
            x: !data.boxes ? 0 : data.spawn.x + data.boxes.hit.x,
            y: !data.boxes ? 0 : data.spawn.y + data.boxes.hit.y,
            width: !data.boxes ? 0 : data.boxes.hit.width,
            height: !data.boxes ? 0 : data.boxes.hit.height,
        };
        this.collisionbox = {
            x: !data.boxes ? 0 : data.spawn.x + data.boxes.collision.x,
            y: !data.boxes ? 0 : data.spawn.y + data.boxes.collision.y,
            width: !data.boxes ? 0 : data.boxes.collision.width,
            height: !data.boxes ? 0 : data.boxes.collision.height,
        };

        if ( !this.data.boxes ) {
            this.data.boxes = {
                hit: this.hitbox,
                collision: this.collisionbox
            };
        }

        this.build();
    }


    destroy () {
        this.data = null;
        this.element.parentNode.removeChild( this.element );
        this.element = null;
        this.child = null;
        this.image = null;
        this.$element = null;
        this.$child = null;
    }


    build () {
        this.element = document.createElement( "div" );
        this.element.style.width = `${this.width}px`;
        this.element.style.height = `${this.height}px`;
        this.element.className = `_2dk__sprite _2dk__${this.data.id}`;
        this.child = document.createElement( "div" );
        this.child.className = `_2dk__child`;
        this.element.appendChild( this.child );
        this.$element = $( this.element );
        this.$child = $( this.child );
    }


    load () {
        return new Promise(( resolve ) => {
            this.loader.loadImg( this.data.image ).then(( image ) => {
                this.image = image;
                this.child.style.backgroundImage = `url(${this.data.image})`;
                this.init();
                resolve();
            });
        });
    }


    init () {
        this.element.style.webkitTransform = `translate3d(
            ${this.offset.x}px,
            ${this.offset.y}px,
            0
        )`;
    }


    // General positioning method
    // Useful for keeping sprite position updated with TweenLite animations
    /*
        onUpdate: () => {
            this.pos({
                x: this.tween.target._gsTransform.x,
                y: this.tween.target._gsTransform.y
            });
        }
    */
    pos ( poi ) {
        this.offset = poi;
        this.hitbox.x = this.offset.x + this.data.boxes.hit.x;
        this.hitbox.y = this.offset.y + this.data.boxes.hit.y;
        this.collisionbox.x = this.offset.x + this.data.boxes.collision.x;
        this.collisionbox.y = this.offset.y + this.data.boxes.collision.y;
    }


    move ( dir, poi ) {
        this.pos( poi );
        this.element.style.webkitTransform = `translate3d(
            ${this.offset.x}px,
            ${this.offset.y}px,
            0
        )`;
    }


    cycle ( dir ) {
        if ( !this.cycling ) {
            this.cycling = true;
            this.dir = dir;
            this.$child.removeClass( "up down right left" );
            this.$child.addClass( `walk ${dir}` );
        }
    }


    face ( dir ) {
        this.cycling = false;
        this.dir = dir;
        this.$child.removeClass( "walk up down right left" );
        this.$child.addClass( dir );
    }


    getBox ( poi, box ) {
        return {
            x: poi.x + this.data.boxes[ box ].x,
            y: poi.y + this.data.boxes[ box ].y,
            width: this.data.boxes[ box ].width,
            height: this.data.boxes[ box ].height
        };
    }
}



class Hero extends Sprite {
    constructor ( data, gamebox ) {
        super( data );
        this.gamebox = gamebox;
    }


    payload ( payload ) {
        console.log( "Hero Payload", payload );
    }
}



class NPC extends Sprite {
    constructor ( data, gamebox ) {
        super( data );
        this.gamebox = gamebox;
        this.styles = document.createElement( "style" );
        // Copy so we can cooldown and re-spawn objects with fresh states
        this.states = JSON.parse( JSON.stringify( data.states ) );
        this.pushed = {
            timer: null,
            pushes: 0,
            needed: gamebox.map.data.tilesize,
            pushing: false,
            bounce: Config.animation.bounce
        };
        this.load().then(() => {
            this.shift();
            this.$element.addClass( this.data.layer );
            this.element.appendChild( this.styles );
            this.gamebox.map.addSprite( this );
            this.checkBox();
        });
    }


    shift () {
        if ( this.states.length ) {
            this.state = this.states.shift();
            this.child.style.backgroundPosition = `-${this.state.bgp.x}px -${this.state.bgp.y}px`;
            this.child.style.backgroundSize = `${this.image.naturalWidth / this.data.resolution}px ${this.image.naturalHeight / this.data.resolution}px`;
            this.child.style.backgroundRepeat = `${this.state.repeat ? "repeat" : "no-repeat"}`;

            if ( this.state.animated ) {
                const lastStep = this.state.steps[ this.state.steps.length - 1 ];

                this.styles.innerHTML = `
                    ._2dk__${this.data.id} ._2dk__child.animate {
                        animation: ${this.data.id}-anim ${this.state.timing}ms steps(${this.state.steps.length}) infinite;
                    }
                    @keyframes ${this.data.id}-anim {
                        100% { background-position: -${lastStep.x}px -${lastStep.y}px; }
                    }
                `;
            }
        }
    }


    pause ( paused ) {
        if ( paused && this.state.animated ) {
            this.$child.removeClass( "animate" );

        } else if ( this.state.animated ) {
            this.$child.addClass( "animate" );
        }
    }


    checkPoi ( poi ) {
        if ( (this.collisionbox.width === 0 && this.collisionbox.height === 0) || (this.collisionbox.width === this.width && this.collisionbox.height === this.height) ) {
            return;
        }

        if ( poi.y > this.offset.y ) {
            this.$element.removeClass( "fg" ).addClass( "bg" );

        } else {
            this.$element.removeClass( "bg" ).addClass( "fg" );
        }
    }


    checkBox ( poi ) {
        const offset = {
            top: this.offset.y + this.gamebox.map.offset.y,
            bottom: (this.offset.y + this.height) + this.gamebox.map.offset.y,
            left: this.offset.x + this.gamebox.map.offset.x,
            right: (this.offset.x + this.width) + this.gamebox.map.offset.x,
        };

        // Object is offscreen...
        if ( offset.bottom <= 0 || offset.top >= this.gamebox.player.height || offset.right <= 0 || offset.left >= this.gamebox.player.width ) {
            this.element.style.display = "none";

            if ( this.state.animated ) {
                this.$child.removeClass( "animate" );
            }

        } else {
            this.element.style.display = "block";

            if ( this.state.animated ) {
                this.$child.addClass( "animate" );
            }
        }
    }


    open ( poi, btn ) {
        if ( !this.state.action ) {
            return;
        }

        if ( this.state.action.verb !== Config.verbs.OPEN ) {
            return;
        }

        if ( this.state.action.require.button && !btn ) {
            return;
        }

        if ( this.state.action.shift ) {
            if ( this.state.action.payload ) {
                this.gamebox.hero.payload( this.state.action.payload );
            }

            this.shift();
        }
    }


    push ( poi, btn ) {
        if ( btn ) {
            return;
        }

        if ( !this.state.action ) {
            return;
        }

        if ( this.state.action.verb !== Config.verbs.PUSH ) {
            return;
        }

        if ( !this.state.action.counter ) {
            return;
        }

        if ( this.pushed.pushing ) {
            return;
        }

        if ( this.state.action.require.dir && this.gamebox.hero.dir !== this.state.action.require.dir ) {
            return;
        }

        clearTimeout( this.pushed.timer );

        this.pushed.pushes++;

        if ( this.pushed.pushes >= this.pushed.needed ) {
            this.pushed.pushes = 0;
            this.pushed.pushing = true;
            this.state.action.counter--;

            const css = {};

            if ( this.gamebox.hero.dir === "left" ) {
                css.x = this.offset.x - this.gamebox.map.data.gridsize;
            }

            if ( this.gamebox.hero.dir === "right" ) {
                css.x = this.offset.x + this.gamebox.map.data.gridsize;
            }

            if ( this.gamebox.hero.dir === "up" ) {
                css.y = this.offset.y - this.gamebox.map.data.gridsize;
            }

            if ( this.gamebox.hero.dir === "down" ) {
                css.y = this.offset.y + this.gamebox.map.data.gridsize;
            }

            this.tween = TweenLite.to(
                this.element,
                Config.animation.duration.pushed,
                {
                    css,
                    onUpdate: () => {
                        this.pos({
                            x: parseInt( this.tween._targets[ 0 ]._gsap.x, 10 ),
                            y: parseInt( this.tween._targets[ 0 ]._gsap.y, 10 )
                        });
                    },
                    onComplete: () => {
                        this.pushed.pushing = false;

                        if ( this.state.action.payload ) {
                            this.gamebox.hero.payload( this.state.action.payload );
                        }
                    }
                }
            );
        }

        this.pushed.timer = setTimeout(() => {
            this.pushed.pushes = 0;

        }, this.pushed.bounce );
    }


    checkAct ( poi, btn ) {
        if ( this.state.action && this.state.action.verb === Config.verbs.PUSH ) {
            this.push( poi, btn );

        } else if ( this.state.action && this.state.action.verb === Config.verbs.OPEN ) {
            this.open( poi, btn );
        }
    }
}



module.exports = {
    NPC,
    Hero,
    Sprite
};
