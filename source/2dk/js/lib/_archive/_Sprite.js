const Utils = require( "./Utils" );
const Loader = require( "./Loader" );
const Config = require( "./Config" );
const $ = require( "properjs-hobo" );
const Tween = require( "properjs-tween" );
const Easing = require( "properjs-easing" );



class Sprite {
    // width, height, image, name
    constructor ( data, gamebox ) {
        this.data = data;
        this.gamebox = gamebox;
        this.width = data.width / data.scale;
        this.height = data.height / data.scale;
        this.loader = new Loader();
        this.cycling = false;
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
            this.loader.loadImage( this.data.image ).then(( image ) => {
                this.image = image;
                this.child.style.backgroundImage = `url(${this.data.image})`;
                this.move( this.offset );
                resolve();
            });
        });
    }


    pos ( poi ) {
        this.offset = poi;
        this.hitbox.x = this.offset.x + (this.data.boxes.hit.x / this.data.scale);
        this.hitbox.y = this.offset.y + (this.data.boxes.hit.y / this.data.scale);
    }


    move ( poi ) {
        this.pos( poi );
        this.render();
    }


    cycle ( verb, dir ) {
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


    face ( dir ) {
        this.$child.removeClass( `${this.verb} up down right left` );
        this.$child.addClass( dir );
        this.cycling = false;
        this.dir = dir;
    }


    render () {
        this.element.style.webkitTransform = `translate3d(
            ${this.offset.x}px,
            ${this.offset.y}px,
            0
        )`;
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
        super( data, gamebox );
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
}



class NPC extends Sprite {
    constructor ( data, gamebox ) {
        super( data, gamebox );
        this.styles = document.createElement( "style" );
        // Copy so we can cooldown and re-spawn objects with fresh states
        this.states = Utils.copy( data.states );
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

            // if ( this.state.drift ) {
            //     this.drift();
            // }
        }
    }


    // drift () {
    //     const center = {
    //         x: this.offset.x + 50,
    //         y: this.offset.y,
    //     };
    //     const radius = 100;
    //     const steps = 100;
    //     const points = [];
    //
    //     for ( let i = 0; i < steps; i++ ) {
    //         points.push({
    //             x: center.x + radius * Math.cos( 2 * Math.PI * i / steps ),
    //             y: center.y + radius * Math.sin( 2 * Math.PI * i / steps ),
    //         });
    //
    //         const el = this.element.cloneNode( true );
    //         this.element.parentNode.appendChild( el );
    //         el.style.webkitTransform = `translate3d(
    //             ${points[ i ].x}px,
    //             ${points[ i ].y}px,
    //             0
    //         )`;
    //     }
    // }


    // drift () {
    //     const origin = this.offset;
    //     const _clone = () => {
    //         const el = this.element.cloneNode( true );
    //         el.style.display = "block";
    //         this.element.parentNode.appendChild( el );
    //         return el;
    //     };
    //     const _move = ( node, pos ) => {
    //         node.style.webkitTransform = `translate3d(
    //             ${pos.x}px,
    //             ${pos.y}px,
    //             0
    //         )`;
    //     };
    //     const _drift = ( clone ) => {
    //         const dest = {
    //             x: origin.x,
    //             y: origin.y - (this.gamebox.map.data.gridsize * 4),
    //         };
    //         const dist = Utils.getDistance( origin, dest );
    //         const angle = Utils.getAngle( origin, dest );
    //
    //         return new Tween({
    //             ease: Easing.swing,
    //             duration: this.state.dur,
    //             from: 0,
    //             to: dist,
    //             update: ( t ) => {
    //                 _move( clone, Utils.translate( dest, angle, (t - dist) ) );
    //             },
    //             complete: ( t ) => {
    //                 _move( clone, Utils.translate( dest, angle, (t - dist) ) );
    //                 this.element.parentNode.removeChild( clone );
    //                 clone = null;
    //             }
    //         });
    //     };
    //
    //     this._interval = setInterval(() => {
    //         _drift( _clone() );
    //
    //     }, (this.state.dur / 2) );
    // }


    pause ( paused ) {
        if ( paused && this.state.animated ) {
            this.$child.removeClass( "animate" );

        } else if ( this.state.animated ) {
            this.$child.addClass( "animate" );
        }
    }


    checkPoi ( poi ) {
        if ( (this.hitbox.width === 0 && this.hitbox.height === 0) || (this.hitbox.width === this.width && this.hitbox.height === this.height) ) {
            return;
        }

        if ( (poi.y + this.gamebox.hero.height) > (this.offset.y + this.height) ) {
            this.$element.removeClass( "fg" ).addClass( "bg" );

        } else {
            this.$element.removeClass( "bg" ).addClass( "fg" );
        }
    }


    checkBox ( poi ) {
        if ( this.hitbox.width === 0 && this.hitbox.height === 0 ) {
            return;
        }

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
}



module.exports = {
    NPC,
    Hero,
    Sprite
};