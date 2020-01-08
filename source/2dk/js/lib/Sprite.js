const Loader = require( "./Loader" );
const Config = require( "./Config" );
const $ = require( "properjs-hobo" );
const { TweenLite } = require( "gsap" );



class Sprite {
    // width, height, image, name
    constructor ( data ) {
        this.data = data;
        this.width = data.width / data.scale;
        this.height = data.height / data.scale;
        this.loader = new Loader();
        this.cycling = false;
        this.locked = false;
        this.dir = null;
        this.verb = null;
        this.offset = {
            x: data.spawn.x,
            y: data.spawn.y
        };
        this.hitbox = {
            x: !data.boxes ? 0 : data.spawn.x + (data.boxes.hit.x / data.scale),
            y: !data.boxes ? 0 : data.spawn.y + (data.boxes.hit.y / data.scale),
            width: !data.boxes ? 0 : (data.boxes.hit.width / data.scale),
            height: !data.boxes ? 0 : (data.boxes.hit.height / data.scale),
        };

        if ( !this.data.boxes ) {
            this.data.boxes = {
                hit: this.hitbox,
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
                this.move( null, this.offset );
                resolve();
            });
        });
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
        this.hitbox.x = this.offset.x + (this.data.boxes.hit.x / this.data.scale);
        this.hitbox.y = this.offset.y + (this.data.boxes.hit.y / this.data.scale);
    }


    move ( dir, poi ) {
        if ( this.locked ) {
            return;
        }

        this.pos( poi );
        this.element.style.webkitTransform = `translate3d(
            ${this.offset.x}px,
            ${this.offset.y}px,
            0
        )`;
    }


    cycle ( verb, dir ) {
        if ( this.locked ) {
            return;
        }

        if ( verb !== this.verb ) {
            this.cycling = true;
            this.$child.removeClass( `${this.verb} up down right left` );
            this.dir = dir;
            this.verb = verb;
            this.$child.addClass( `${verb} ${dir}` );

        } else if ( !this.cycling ) {
            this.cycling = true;
            this.dir = dir;
            this.verb = verb;
            this.$child.removeClass( "up down right left" );
            this.$child.addClass( `${verb} ${dir}` );
        }
    }

    lockCycle ( verb, dir ) {
        this.cycling = true;
        this.$child.removeClass( `${this.verb} up down right left` );
        this.dir = dir;
        this.verb = verb;
        this.$child.addClass( `${verb} ${dir}` );
    }


    face ( dir ) {
        if ( this.locked ) {
            return;
        }

        this.$child.removeClass( `${this.verb} up down right left` );
        this.$child.addClass( dir );
        this.cycling = false;
        this.dir = dir;
    }


    lock ( bool ) {
        this.locked = bool;
    }


    getBox ( poi, box ) {
        return {
            x: poi.x + (this.data.boxes[ box ].x / this.data.scale),
            y: poi.y + (this.data.boxes[ box ].y / this.data.scale),
            width: this.data.boxes[ box ].width / this.data.scale,
            height: this.data.boxes[ box ].height / this.data.scale
        };
    }
}



class Hero extends Sprite {
    constructor ( data, gamebox ) {
        super( data );
        this.gamebox = gamebox;
        this.styles = document.createElement( "style" );
    }


    init () {
        this.element.appendChild( this.styles );
        this.gamebox.map.addSprite( this );
        // this.child.style.backgroundPosition = `${this.data.verbs.face.down.offsetX / this.data.scale}px ${this.data.verbs.face.down.offsetY / this.data.scale}px`;
        this.child.style.backgroundSize = `${this.image.naturalWidth / this.data.scale}px ${this.image.naturalHeight / this.data.scale}px`;
        this.child.style.backgroundRepeat = "no-repeat";
        this.stylePacks = [];

        for ( let verb in this.data.verbs ) {
            if ( verb === Config.verbs.FACE ) {
                this.stylePacks.push(`
                    ._2dk__${this.data.id} ._2dk__child.down {
                        background-position: ${this.data.verbs.face.down.offsetX / this.data.scale}px ${this.data.verbs.face.down.offsetY / this.data.scale}px;
                    }
                    ._2dk__${this.data.id} ._2dk__child.up {
                        background-position: ${this.data.verbs.face.up.offsetX / this.data.scale}px ${this.data.verbs.face.up.offsetY / this.data.scale}px;
                    }
                    ._2dk__${this.data.id} ._2dk__child.left {
                        background-position: ${this.data.verbs.face.left.offsetX / this.data.scale}px ${this.data.verbs.face.left.offsetY / this.data.scale}px;
                    }
                    ._2dk__${this.data.id} ._2dk__child.right {
                        background-position: ${this.data.verbs.face.right.offsetX / this.data.scale}px ${this.data.verbs.face.right.offsetY / this.data.scale}px;
                    }
                `);

            } else {
                this.stylePacks.push(`
                    ._2dk__${this.data.id} ._2dk__child.${verb}.down {
                        background-position: ${this.data.verbs[ verb ].down.offsetX / this.data.scale}px ${this.data.verbs[ verb ].down.offsetY / this.data.scale}px;
                        animation: ${this.data.id}-${verb}-down ${this.data.verbs[ verb ].dur}ms steps( ${this.data.verbs[ verb ].down.stepsX} ) infinite;
                    }
                    @keyframes ${this.data.id}-${verb}-down {
                        100% { background-position: -${Math.abs( this.data.verbs[ verb ].down.offsetX / this.data.scale ) + (this.width * this.data.verbs[ verb ].down.stepsX)}px ${this.data.verbs[ verb ].down.offsetY / this.data.scale}px; }
                    }
                    ._2dk__${this.data.id} ._2dk__child.${verb}.up {
                        background-position: ${this.data.verbs[ verb ].up.offsetX / this.data.scale}px ${this.data.verbs[ verb ].up.offsetY / this.data.scale}px;
                        animation: ${this.data.id}-${verb}-up ${this.data.verbs[ verb ].dur}ms steps( ${this.data.verbs[ verb ].up.stepsX} ) infinite;
                    }
                    @keyframes ${this.data.id}-${verb}-up {
                        100% { background-position: -${Math.abs( this.data.verbs[ verb ].up.offsetX / this.data.scale ) + (this.width * this.data.verbs[ verb ].up.stepsX)}px ${this.data.verbs[ verb ].up.offsetY / this.data.scale}px; }
                    }
                    ._2dk__${this.data.id} ._2dk__child.${verb}.left {
                        background-position: ${this.data.verbs[ verb ].left.offsetX / this.data.scale}px ${this.data.verbs[ verb ].left.offsetY / this.data.scale}px;
                        animation: ${this.data.id}-${verb}-left ${this.data.verbs[ verb ].dur}ms steps( ${this.data.verbs[ verb ].left.stepsX} ) infinite;
                    }
                    @keyframes ${this.data.id}-${verb}-left {
                        100% { background-position: -${Math.abs( this.data.verbs[ verb ].left.offsetX / this.data.scale ) + (this.width * this.data.verbs[ verb ].left.stepsX)}px ${this.data.verbs[ verb ].left.offsetY / this.data.scale}px; }
                    }
                    ._2dk__${this.data.id} ._2dk__child.${verb}.right {
                        background-position: ${this.data.verbs[ verb ].right.offsetX / this.data.scale}px ${this.data.verbs[ verb ].right.offsetY / this.data.scale}px;
                        animation: ${this.data.id}-${verb}-right ${this.data.verbs[ verb ].dur}ms steps( ${this.data.verbs[ verb ].right.stepsX} ) infinite;
                    }
                    @keyframes ${this.data.id}-${verb}-right {
                        100% { background-position: -${Math.abs( this.data.verbs[ verb ].right.offsetX / this.data.scale ) + (this.width * this.data.verbs[ verb ].right.stepsX)}px ${this.data.verbs[ verb ].right.offsetY / this.data.scale}px; }
                    }
                `);
            }
        }

        this.styles.innerHTML = this.stylePacks.join( "" );
    }


    render () {
        this.element.style.webkitTransform = `translate3d(
            ${this.offset.x}px,
            ${this.offset.y}px,
            0
        )`;
    }
}



class NPC extends Sprite {
    constructor ( data, gamebox ) {
        super( data );
        this.gamebox = gamebox;
        this.styles = document.createElement( "style" );
        // Copy so we can cooldown and re-spawn objects with fresh states
        this.states = Config.utils.copy( data.states );
        this.pushed = {
            timer: null,
            pushes: 0,
            needed: gamebox.map.data.tilesize,
            pushing: false,
            bounce: Config.animation.bounce
        };
    }


    init () {
        this.shift();
        this.$element.addClass( this.data.layer );
        this.element.appendChild( this.styles );
        this.gamebox.map.addSprite( this );
        this.checkBox();
    }


    shift () {
        if ( this.states.length ) {
            this.state = this.states.shift();
            this.child.style.backgroundPosition = `${this.state.bgp.x / this.data.scale}px ${this.state.bgp.y / this.data.scale}px`;
            this.child.style.backgroundSize = `${this.image.naturalWidth / this.data.scale}px ${this.image.naturalHeight / this.data.scale}px`;
            this.child.style.backgroundRepeat = `${this.state.repeat ? "repeat" : "no-repeat"}`;

            if ( this.state.animated ) {
                this.styles.innerHTML = `
                    ._2dk__${this.data.id} ._2dk__child.animate {
                        background-position: ${this.state.bgp.x / this.data.scale}px ${this.state.bgp.y / this.data.scale}px;
                        animation: ${this.data.id}-anim ${this.state.dur}ms steps(${this.state.stepsX}) infinite;
                    }
                    @keyframes ${this.data.id}-anim {
                        100% { background-position: -${Math.abs( this.state.offsetX / this.data.scale ) + (this.width * this.state.stepsX)}px ${this.state.offsetY / this.data.scale}px; }
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


    checkAct ( poi, btn ) {
        if ( this.state.action && this.state.action.verb === Config.verbs.PUSH ) {
            this.push( poi, btn );

        } else if ( this.state.action && this.state.action.verb === Config.verbs.OPEN ) {
            this.open( poi, btn );
        }
    }


    checkPoi ( poi ) {
        if ( (this.hitbox.width === 0 && this.hitbox.height === 0) || (this.hitbox.width === this.width && this.hitbox.height === this.height) ) {
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
                this.gamebox.payload( this.state.action.payload );
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
                            this.gamebox.payload( this.state.action.payload );
                        }
                    }
                }
            );
        }

        this.pushed.timer = setTimeout(() => {
            this.pushed.pushes = 0;

        }, this.pushed.bounce );
    }
}



module.exports = {
    NPC,
    Hero,
    Sprite
};
