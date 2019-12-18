import Loader from "./Loader";
import Library from "./Library";
import $ from "properjs-hobo";
import Tween from "properjs-tween";
import Easing from "properjs-easing";



class Sprite {
    // width, height, image, name
    constructor ( data ) {
        this.data = data;
        this.width = data.width;
        this.height = data.height;
        this.loader = new Loader();
        this.build();
    }


    build () {
        this.element = document.createElement( "div" );
        this.element.style.width = `${this.width}px`;
        this.element.style.height = `${this.height}px`;
        this.element.className = `_2dk__${this.data.name}`;
        this.$element = $( this.element );
    }


    load () {
        return new Promise(( resolve ) => {
            this.loader.loadImg( this.data.image ).then(() => {
                this.element.innerHTML = `
                    <style>
                        ._2dk__${this.data.name}:after {
                            background-image: url( "${this.data.image}" );
                        }
                    </style>
                `;

                resolve();
            });
        });
    }
}



class Hero extends Sprite {
    constructor ( data ) {
        // Enfore the heroes journey
        data.name = "hero";
        super( data );

        this.cycling = false;
        this.timeout = null;
        this.tweens = {};
        this.offset = {
            x: data.spawn.x,
            y: data.spawn.y
        };
        this.center = {
            x: data.spawn.x + (this.width / 2) + (this.height / 2),
            y: data.spawn.y + (this.width / 2) + (this.height / 2)
        };
        this.hitbox = {
            x: data.spawn.x,
            y: data.spawn.y + this.height / 2,
            width: this.width,
            height: this.height / 2
        };

        this.init();
    }


    init () {
        this.element.style.webkitTransform = `translate3d(
            ${this.offset.x}px,
            ${this.offset.y}px,
            0
        )`;
    }


    move ( dir, poi ) {
        this.offset = poi;
        this.center = {
            x: this.offset.x + (this.width / 2) + (this.height / 2),
            y: this.offset.y + (this.width / 2) + (this.height / 2)
        };
        this.hitbox.x = this.offset.x;
        this.hitbox.y = this.offset.y + this.height / 2;
        this.element.style.webkitTransform = `translate3d(
            ${this.offset.x}px,
            ${this.offset.y}px,
            0
        )`;
    }


    tween ( axis, from, to ) {
        const handler = ( t ) => {
            this.offset[ axis ] = t;
            this.center = {
                x: this.offset.x + (this.width / 2) + (this.height / 2),
                y: this.offset.y + (this.width / 2) + (this.height / 2)
            };
            this.hitbox.x = this.offset.x;
            this.hitbox.y = this.offset.y + this.height / 2;
            this.element.style.webkitTransform = `translate3d(
                ${this.offset.x}px,
                ${this.offset.y}px,
                0
            )`;
        };

        if ( this.tweens[ axis ] ) {
            this.tweens[ axis ].stop();
        }

        this.tweens[ axis ] = new Tween({
            ease: Easing.swing,
            from,
            to,
            delay: 0,
            duration: Library.values.cycle,
            update: handler,
            complete: handler
        });
    }


    cycle ( dir ) {
        if ( !this.cycling ) {
            this.cycling = true;

            this.$element.removeClass( "up down right left" );
            this.$element.addClass( `walk ${dir}` );

            this.timeout = setTimeout(() => {
                this.face( dir );
                this.cycling = false;

            }, Library.values.cycle );
        }
    }


    clear ( dir ) {
        clearTimeout( this.timeout );
        this.cycling = false;
        this.face( dir );
    }


    face ( dir ) {
        this.$element.removeClass( "walk up down right left" );
        this.$element.addClass( dir );
    }


    getHitbox ( poi ) {
        return {
            x: poi.x,
            y: poi.y + this.height / 2,
            width: this.width,
            height: this.height / 2
        };
    }
}



export { Hero, Sprite }
