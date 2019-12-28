const Loader = require( "./Loader" );
const Config = require( "./Config" );
const $ = require( "properjs-hobo" );



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


    build () {
        this.element = document.createElement( "div" );
        this.element.style.width = `${this.width}px`;
        this.element.style.height = `${this.height}px`;
        this.element.className = `_2dk__obj _2dk__${this.data.id}`;
        this.$element = $( this.element );
    }


    load () {
        return new Promise(( resolve ) => {
            this.loader.loadImg( this.data.image ).then(( image ) => {
                this.image = image;
                this.element.style.backgroundImage = `url(${this.data.image})`;
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
            this.$element.removeClass( "up down right left" );
            this.$element.addClass( `walk ${dir}` );
        }
    }


    face ( dir ) {
        this.cycling = false;
        this.dir = dir;
        this.$element.removeClass( "walk up down right left" );
        this.$element.addClass( dir );
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
    constructor ( data ) {
        // Enfore the heroes journey
        data.id = "hero";
        super( data );
    }
}



class NPC extends Sprite {
    constructor ( data, gamebox ) {
        super( data );
        this.gamebox = gamebox;
        this.styles = document.createElement( "style" );
        this.pushed = {
            timer: null,
            pushes: 0,
            needed: 64,
            pushing: false,
            bounce: 300
        };
        this.load().then(() => {
            this.shift();
            this.element.appendChild( this.styles );
            this.$element.addClass( this.data.layer );
            this.gamebox.map.addSprite( this );
            this.checkBox();
        });
    }


    shift () {
        if ( this.data.states.length ) {
            this.state = this.data.states.shift();
            this.element.style.backgroundPosition = `-${this.state.bgp.x}px -${this.state.bgp.y}px`;
            this.element.style.backgroundSize = `${this.image.naturalWidth / this.gamebox.map.data.resolution}px ${this.image.naturalHeight / this.gamebox.map.data.resolution}px`;
            this.element.style.backgroundRepeat = `${this.state.repeat ? "repeat" : "no-repeat"}`;

            if ( this.state.animated ) {
                const lastStep = this.state.steps[ this.state.steps.length - 1 ];

                this.styles.innerHTML = `
                    ._2dk__${this.data.id}.animate,
                    ._2dk__${this.data.id}.animate > div {
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
            this.$element.removeClass( "animate" );

        } else if ( this.state.animated ) {
            this.$element.addClass( "animate" );
        }
    }


    // Need math-based collider check with screen
    // Display none breaks getBoundingClientRect()
    // And we would like to be able to use display none!
    checkBox () {
        const screen = this.gamebox.screen.getBoundingClientRect();
        const sprite = this.element.getBoundingClientRect();

        if ( this.gamebox.collide( sprite, screen ) ) {
            // this.element.style.display = "block";

            if ( this.state.animated ) {
                this.$element.addClass( "animate" );
            }

        } else {
            // this.element.style.display = "none";

            if ( this.state.animated ) {
                this.$element.removeClass( "animate" );
            }
        }
    }


    checkPush ( poi ) {
        if ( !this.state.pushable || this.pushed.pushing ) {
            return;
        }

        clearTimeout( this.pushed.timer );

        this.pushed.pushes++;

        if ( this.pushed.pushes >= this.pushed.needed ) {
            this.pushed.pushing = true;
            // this.state.pushable = false;

            const css = {};

            if ( this.gamebox.hero.dir === Config.moves.LEFT ) {
                css.x = this.offset.x - this.gamebox.map.data.gridsize;
            }

            if ( this.gamebox.hero.dir === Config.moves.RIGHT ) {
                css.x = this.offset.x + this.gamebox.map.data.gridsize;
            }

            if ( this.gamebox.hero.dir === Config.moves.UP ) {
                css.y = this.offset.y - this.gamebox.map.data.gridsize;
            }

            if ( this.gamebox.hero.dir === Config.moves.DOWN ) {
                css.y = this.offset.y + this.gamebox.map.data.gridsize;
            }

            this.tween = window.TweenLite.to( this.element, 0.5, {
                css,
                onUpdate: () => {
                    this.pos({
                        x: this.tween.target._gsTransform.x,
                        y: this.tween.target._gsTransform.y
                    });
                },
                onComplete: () => {
                    this.pushed.pushing = false;
                }
            });
        }

        this.pushed.timer = setTimeout(() => {
            this.pushed.pushes = 0;

        }, this.pushed.bounce );
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


    checkCon ( hero ) {
        return true;
    }
}



module.exports = {
    NPC,
    Hero,
    Sprite
};
