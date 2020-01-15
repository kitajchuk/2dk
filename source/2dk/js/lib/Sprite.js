const Config = require( "./Config" );
const Loader = require( "./Loader" );
const $ = require( "properjs-hobo" );



class Sprite {
    constructor ( data, gamebox ) {
        this.data = data;
        this.gamebox = gamebox;
        this.width = this.data.width / this.gamebox.player.data.game.resolution;
        this.height = this.data.height / this.gamebox.player.data.game.resolution;
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
            x: !this.data.boxes ? 0 : this.position.x + (this.data.boxes.hit.x / this.gamebox.player.data.game.resolution),
            y: !this.data.boxes ? 0 : this.position.y + (this.data.boxes.hit.y / this.gamebox.player.data.game.resolution),
            width: !this.data.boxes ? 0 : (this.data.boxes.hit.width / this.gamebox.player.data.game.resolution),
            height: !this.data.boxes ? 0 : (this.data.boxes.hit.height / this.gamebox.player.data.game.resolution),
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
            x: poi.x + (this.data.boxes.hit.x / this.gamebox.player.data.game.resolution),
            y: poi.y + (this.data.boxes.hit.y / this.gamebox.player.data.game.resolution),
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
        this.hitbox.x = this.position.x + (this.data.boxes.hit.x / this.gamebox.player.data.game.resolution);
        this.hitbox.y = this.position.y + (this.data.boxes.hit.y / this.gamebox.player.data.game.resolution);

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
        this.child.style.backgroundSize = `${this.image.naturalWidth / this.gamebox.player.data.game.resolution}px ${this.image.naturalHeight / this.gamebox.player.data.game.resolution}px`;
        this.child.style.backgroundRepeat = "no-repeat";
        this.stylePacks = [];

        for ( let verb in this.data.verbs ) {
            if ( verb === Config.verbs.FACE ) {
                this.stylePacks.push(`
                    ._2dk__${this.data.id} ._2dk__child.down {
                        background-position: ${this.data.verbs.face.down.offsetX / this.gamebox.player.data.game.resolution}px ${this.data.verbs.face.down.offsetY / this.gamebox.player.data.game.resolution}px;
                    }
                    ._2dk__${this.data.id} ._2dk__child.up {
                        background-position: ${this.data.verbs.face.up.offsetX / this.gamebox.player.data.game.resolution}px ${this.data.verbs.face.up.offsetY / this.gamebox.player.data.game.resolution}px;
                    }
                    ._2dk__${this.data.id} ._2dk__child.left {
                        background-position: ${this.data.verbs.face.left.offsetX / this.gamebox.player.data.game.resolution}px ${this.data.verbs.face.left.offsetY / this.gamebox.player.data.game.resolution}px;
                    }
                    ._2dk__${this.data.id} ._2dk__child.right {
                        background-position: ${this.data.verbs.face.right.offsetX / this.gamebox.player.data.game.resolution}px ${this.data.verbs.face.right.offsetY / this.gamebox.player.data.game.resolution}px;
                    }
                `);

            } else {
                this.stylePacks.push(`
                    ._2dk__${this.data.id} ._2dk__child.${verb}.down {
                        background-position: ${this.data.verbs[ verb ].down.offsetX / this.gamebox.player.data.game.resolution}px ${this.data.verbs[ verb ].down.offsetY / this.gamebox.player.data.game.resolution}px;
                        animation: ${this.data.id}-${verb}-down ${this.data.verbs[ verb ].dur}ms steps( ${this.data.verbs[ verb ].down.stepsX} ) infinite;
                    }
                    @keyframes ${this.data.id}-${verb}-down {
                        100% { background-position: -${Math.abs( this.data.verbs[ verb ].down.offsetX / this.gamebox.player.data.game.resolution ) + (this.width * this.data.verbs[ verb ].down.stepsX)}px ${this.data.verbs[ verb ].down.offsetY / this.gamebox.player.data.game.resolution}px; }
                    }
                    ._2dk__${this.data.id} ._2dk__child.${verb}.up {
                        background-position: ${this.data.verbs[ verb ].up.offsetX / this.gamebox.player.data.game.resolution}px ${this.data.verbs[ verb ].up.offsetY / this.gamebox.player.data.game.resolution}px;
                        animation: ${this.data.id}-${verb}-up ${this.data.verbs[ verb ].dur}ms steps( ${this.data.verbs[ verb ].up.stepsX} ) infinite;
                    }
                    @keyframes ${this.data.id}-${verb}-up {
                        100% { background-position: -${Math.abs( this.data.verbs[ verb ].up.offsetX / this.gamebox.player.data.game.resolution ) + (this.width * this.data.verbs[ verb ].up.stepsX)}px ${this.data.verbs[ verb ].up.offsetY / this.gamebox.player.data.game.resolution}px; }
                    }
                    ._2dk__${this.data.id} ._2dk__child.${verb}.left {
                        background-position: ${this.data.verbs[ verb ].left.offsetX / this.gamebox.player.data.game.resolution}px ${this.data.verbs[ verb ].left.offsetY / this.gamebox.player.data.game.resolution}px;
                        animation: ${this.data.id}-${verb}-left ${this.data.verbs[ verb ].dur}ms steps( ${this.data.verbs[ verb ].left.stepsX} ) infinite;
                    }
                    @keyframes ${this.data.id}-${verb}-left {
                        100% { background-position: -${Math.abs( this.data.verbs[ verb ].left.offsetX / this.gamebox.player.data.game.resolution ) + (this.width * this.data.verbs[ verb ].left.stepsX)}px ${this.data.verbs[ verb ].left.offsetY / this.gamebox.player.data.game.resolution}px; }
                    }
                    ._2dk__${this.data.id} ._2dk__child.${verb}.right {
                        background-position: ${this.data.verbs[ verb ].right.offsetX / this.gamebox.player.data.game.resolution}px ${this.data.verbs[ verb ].right.offsetY / this.gamebox.player.data.game.resolution}px;
                        animation: ${this.data.id}-${verb}-right ${this.data.verbs[ verb ].dur}ms steps( ${this.data.verbs[ verb ].right.stepsX} ) infinite;
                    }
                    @keyframes ${this.data.id}-${verb}-right {
                        100% { background-position: -${Math.abs( this.data.verbs[ verb ].right.offsetX / this.gamebox.player.data.game.resolution ) + (this.width * this.data.verbs[ verb ].right.stepsX)}px ${this.data.verbs[ verb ].right.offsetY / this.gamebox.player.data.game.resolution}px; }
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
