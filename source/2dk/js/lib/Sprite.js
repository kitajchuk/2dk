const Utils = require( "./Utils" );
const Config = require( "./Config" );
const Loader = require( "./Loader" );
const $ = require( "properjs-hobo" );



class Sprite {
    constructor ( data, gamebox ) {
        this.data = data;
        this.gamebox = gamebox;
        this.scale = this.data.scale || this.gamebox.player.data.game.resolution;
        this.width = this.data.width / this.scale;
        this.height = this.data.height / this.scale;
        this.cycling = false;
        this.dir = this.data.spawn.dir;
        this.verb = Config.verbs.FACE;
        this.image = Loader.cash( this.data.image );
        this.position = {
            x: this.data.spawn.x / this.gamebox.player.data.game.resolution,
            y: this.data.spawn.y / this.gamebox.player.data.game.resolution,
        };
        this.offset = {
            x: 0,
            y: 0,
        };
        this.hitbox = {
            x: this.position.x + (this.data.hitbox.x / this.scale),
            y: this.position.y + (this.data.hitbox.y / this.scale),
            width: this.data.hitbox.width / this.scale,
            height: this.data.hitbox.height / this.scale,
        };

        this.build();
    }


    build () {
        this.element = document.createElement( "div" );
        this.element.style.width = `${this.width}px`;
        this.element.style.height = `${this.height}px`;
        this.element.className = `_2dk__sprite _2dk__${this.data.id}`;
        this.child = document.createElement( "div" );
        this.child.className = `_2dk__child`;
        this.child.style.backgroundImage = `url(${this.data.image})`;
        this.styles = document.createElement( "style" );
        this.element.appendChild( this.styles );
        this.element.appendChild( this.child );
        this.$element = $( this.element );
        this.$child = $( this.child );
    }


    render ( elapsed ) {
        this.element.style.webkitTransform = `translate3d(
            ${this.offset.x}px,
            ${this.offset.y}px,
            0
        )`;
    }


    cycle ( verb, dir ) {
        if ( verb !== this.verb ) {
            this.$child.removeClass( this.verb );
        }

        this.$child.removeClass( "up down right left" );
        this.dir = dir;
        this.verb = verb;
        this.$child.addClass( `${verb} ${dir}` );
    }


    face ( dir ) {
        this.$child.removeClass( `${this.verb} up down right left` );
        this.$child.addClass( dir );
        this.dir = dir;
        this.verb = Config.verbs.FACE;
    }


    getHitbox ( poi ) {
        return {
            x: poi.x + (this.data.hitbox.x / this.scale),
            y: poi.y + (this.data.hitbox.y / this.scale),
            width: this.hitbox.width,
            height: this.hitbox.height,
        };
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
}



class Hero extends Sprite {
    constructor ( data, gamebox ) {
        super( data, gamebox );
        this.package();
    }


    update ( poi, offset ) {
        this.position = poi;
        this.hitbox.x = this.position.x + (this.data.hitbox.x / this.scale);
        this.hitbox.y = this.position.y + (this.data.hitbox.y / this.scale);

        const absolute = {
            x: Math.abs( offset.x ),
            y: Math.abs( offset.y ),
        };

        this.offset = {
            x: this.gamebox.camera.width / 2,
            y: this.gamebox.camera.height / 2,
        };

        if ( absolute.x <= 0 ) {
            this.offset.x = Math.max( 0, poi.x );
        }

        if ( absolute.x >= (this.gamebox.map.width - this.gamebox.camera.width) ) {
            this.offset.x = poi.x + offset.x;
        }

        if ( absolute.y <= 0 ) {
            this.offset.y = Math.max( 0, poi.y );
        }

        if ( absolute.y >= (this.gamebox.map.height - this.gamebox.camera.height) ) {
            this.offset.y = poi.y + offset.y;
        }
    }


    package () {
        this.child.style.backgroundSize = `${this.image.naturalWidth / this.scale}px ${this.image.naturalHeight / this.scale}px`;
        this.child.style.backgroundRepeat = "no-repeat";
        this.stylePacks = [];

        for ( let verb in this.data.verbs ) {
            if ( verb === Config.verbs.FACE ) {
                this.stylePacks.push(`
                    ._2dk__${this.data.id} ._2dk__child.down {
                        background-position: ${this.data.verbs.face.down.offsetX / this.scale}px ${this.data.verbs.face.down.offsetY / this.scale}px;
                    }
                    ._2dk__${this.data.id} ._2dk__child.up {
                        background-position: ${this.data.verbs.face.up.offsetX / this.scale}px ${this.data.verbs.face.up.offsetY / this.scale}px;
                    }
                    ._2dk__${this.data.id} ._2dk__child.left {
                        background-position: ${this.data.verbs.face.left.offsetX / this.scale}px ${this.data.verbs.face.left.offsetY / this.scale}px;
                    }
                    ._2dk__${this.data.id} ._2dk__child.right {
                        background-position: ${this.data.verbs.face.right.offsetX / this.scale}px ${this.data.verbs.face.right.offsetY / this.scale}px;
                    }
                `);

            } else {
                this.stylePacks.push(`
                    ._2dk__${this.data.id} ._2dk__child.${verb}.down {
                        background-position: ${this.data.verbs[ verb ].down.offsetX / this.scale}px ${this.data.verbs[ verb ].down.offsetY / this.scale}px;
                        animation: ${this.data.id}-${verb}-down ${this.data.verbs[ verb ].dur}ms steps( ${this.data.verbs[ verb ].down.stepsX} ) infinite;
                    }
                    @keyframes ${this.data.id}-${verb}-down {
                        100% { background-position: -${Math.abs( this.data.verbs[ verb ].down.offsetX / this.scale ) + (this.width * this.data.verbs[ verb ].down.stepsX)}px ${this.data.verbs[ verb ].down.offsetY / this.scale}px; }
                    }
                    ._2dk__${this.data.id} ._2dk__child.${verb}.up {
                        background-position: ${this.data.verbs[ verb ].up.offsetX / this.scale}px ${this.data.verbs[ verb ].up.offsetY / this.scale}px;
                        animation: ${this.data.id}-${verb}-up ${this.data.verbs[ verb ].dur}ms steps( ${this.data.verbs[ verb ].up.stepsX} ) infinite;
                    }
                    @keyframes ${this.data.id}-${verb}-up {
                        100% { background-position: -${Math.abs( this.data.verbs[ verb ].up.offsetX / this.scale ) + (this.width * this.data.verbs[ verb ].up.stepsX)}px ${this.data.verbs[ verb ].up.offsetY / this.scale}px; }
                    }
                    ._2dk__${this.data.id} ._2dk__child.${verb}.left {
                        background-position: ${this.data.verbs[ verb ].left.offsetX / this.scale}px ${this.data.verbs[ verb ].left.offsetY / this.scale}px;
                        animation: ${this.data.id}-${verb}-left ${this.data.verbs[ verb ].dur}ms steps( ${this.data.verbs[ verb ].left.stepsX} ) infinite;
                    }
                    @keyframes ${this.data.id}-${verb}-left {
                        100% { background-position: -${Math.abs( this.data.verbs[ verb ].left.offsetX / this.scale ) + (this.width * this.data.verbs[ verb ].left.stepsX)}px ${this.data.verbs[ verb ].left.offsetY / this.scale}px; }
                    }
                    ._2dk__${this.data.id} ._2dk__child.${verb}.right {
                        background-position: ${this.data.verbs[ verb ].right.offsetX / this.scale}px ${this.data.verbs[ verb ].right.offsetY / this.scale}px;
                        animation: ${this.data.id}-${verb}-right ${this.data.verbs[ verb ].dur}ms steps( ${this.data.verbs[ verb ].right.stepsX} ) infinite;
                    }
                    @keyframes ${this.data.id}-${verb}-right {
                        100% { background-position: -${Math.abs( this.data.verbs[ verb ].right.offsetX / this.scale ) + (this.width * this.data.verbs[ verb ].right.stepsX)}px ${this.data.verbs[ verb ].right.offsetY / this.scale}px; }
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
        // Copy so we can cooldown and re-spawn objects with fresh states
        this.states = Utils.copy( this.data.states );
        // Render between "objects" and "foreground" layers relative to Hero
        this.relative = (this.hitbox.height !== this.height);
        this.$element.addClass( this.data.layer );
        this.element.style.display = "none";
        this.shift();
    }


    update ( poi, offset ) {
        this.offset.x = offset.x + this.position.x;
        this.offset.y = offset.y + this.position.y;
        this.hitbox.x = this.position.x + (this.data.hitbox.x / this.scale);
        this.hitbox.y = this.position.y + (this.data.hitbox.y / this.scale);
    }


    shift () {
        if ( this.states.length ) {
            this.state = this.states.shift();
            this.child.style.backgroundPosition = `-${this.state.offsetX / this.scale}px -${this.state.offsetY / this.scale}px`;
            this.child.style.backgroundSize = `${this.image.naturalWidth / this.scale}px ${this.image.naturalHeight / this.scale}px`;
            this.child.style.backgroundRepeat = "no-repeat";

            if ( this.state.animated ) {
                this.styles.innerHTML = `
                    ._2dk__${this.data.id} ._2dk__child.animate {
                        animation: ${this.data.id}-anim ${this.state.dur}ms steps(${this.state.stepsX}) infinite;
                    }
                    @keyframes ${this.data.id}-anim {
                        100% { background-position: -${(this.state.offsetX / this.scale) + (this.width * this.state.stepsX)}px -${this.state.offsetY / this.scale}px; }
                    }
                `;
            }
        }
    }


    payload () {
        if ( this.data.payload.dialogue ) {
            this.gamebox.dialogue.play( this.data.payload.dialogue );
        }
    }


    pause ( paused ) {
        if ( paused && this.state.animated ) {
            this.$child.removeClass( "animate" );

        } else if ( this.state.animated ) {
            this.$child.addClass( "animate" );
        }
    }


    checkHero ( poi ) {
        if ( !this.relative ) {
            return;
        }

        if ( this.hitbox.width === 0 && this.hitbox.height === 0 ) {
            return;
        }

        const hitbox = this.gamebox.hero.getHitbox( poi );

        if ( this.hitbox.y > hitbox.y ) {
            this.$element.removeClass( "background" ).addClass( "foreground" );

        } else {
            this.$element.removeClass( "foreground" ).addClass( "background" );
        }
    }


    checkCamera ( poi ) {
        const npcRect = {
            x: this.position.x,
            y: this.position.y,
            width: this.width,
            height: this.height,
        };

        if ( Utils.collide( npcRect, this.gamebox.camera ) ) {
            this.element.style.display = "block";

            if ( this.state.animated ) {
                this.$child.addClass( "animate" );
            }

        } else {
            this.element.style.display = "none";

            if ( this.state.animated ) {
                this.$child.removeClass( "animate" );
            }
        }
    }


    canInteract ( dir ) {
        return (this.state.action && this.state.action.require && this.state.action.require.dir && dir === this.state.action.require.dir);
    }


    doInteract ( dir ) {
        if ( this.data.payload ) {
            this.payload();
        }

        if ( this.state.action.shift ) {
            this.shift();
        }
    }
}



module.exports = {
    NPC,
    Hero,
    Sprite,
};
