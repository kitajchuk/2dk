const Config = require( "./Config" );
const Loader = require( "./Loader" );
const $ = require( "properjs-hobo" );



class Sprite {
    constructor ( data, gamebox ) {
        this.data = data;
        this.gamebox = gamebox;
        this.width = data.width / data.scale;
        this.height = data.height / data.scale;
        this.cycling = false;
        this.dir = data.spawn.dir;
        this.verb = Config.verbs.FACE;
        this.image = Loader.cash( data.image );
        this.position = {
            x: data.spawn.x / gamebox.map.data.resolution,
            y: data.spawn.y / gamebox.map.data.resolution,
        };
        this.offset = {
            x: 0,
            y: 0,
        };
        this.hitbox = {
            x: !data.boxes ? 0 : this.position.x + (data.boxes.hit.x / data.scale),
            y: !data.boxes ? 0 : this.position.y + (data.boxes.hit.y / data.scale),
            width: !data.boxes ? 0 : (data.boxes.hit.width / data.scale),
            height: !data.boxes ? 0 : (data.boxes.hit.height / data.scale),
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
            x: poi.x + (this.data.boxes.hit.x / this.data.scale),
            y: poi.y + (this.data.boxes.hit.y / this.data.scale),
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
        this.hitbox.x = this.position.x + (this.data.boxes.hit.x / this.data.scale);
        this.hitbox.y = this.position.y + (this.data.boxes.hit.y / this.data.scale);

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



module.exports = {
    Hero,
    Sprite,
};
