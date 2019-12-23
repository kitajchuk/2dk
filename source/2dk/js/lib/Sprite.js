import Loader from "./Loader";
import Config from "./Config";
import $ from "properjs-hobo";



class Sprite {
    // width, height, image, name
    constructor ( data ) {
        this.data = data;
        this.width = data.width;
        this.height = data.height;
        this.offset = {
            x: data.spawn.x,
            y: data.spawn.y
        };
        this.hitbox = {
            x: data.spawn.x + this.data.boxes.hit.x,
            y: data.spawn.y + this.data.boxes.hit.y,
            width: this.data.boxes.hit.width,
            height: this.data.boxes.hit.height
        };
        this.collisionbox = {
            x: data.spawn.x + this.data.boxes.collision.x,
            y: data.spawn.y + this.data.boxes.collision.y,
            width: this.data.boxes.collision.width,
            height: this.data.boxes.collision.height
        };
        this.loader = new Loader();
        this.dir = "none";
        this.build();
    }


    build () {
        this.element = document.createElement( "div" );
        this.element.style.width = `${this.width}px`;
        this.element.style.height = `${this.height}px`;
        this.element.className = `_2dk__${this.data.id}`;
        this.$element = $( this.element );
    }


    load () {
        return new Promise(( resolve ) => {
            this.loader.loadImg( this.data.image ).then(() => {
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


    move ( dir, poi ) {
        this.offset = poi;
        this.hitbox.x = this.offset.x + this.data.boxes.hit.x;
        this.hitbox.y = this.offset.y + this.data.boxes.hit.y;
        this.collisionbox.x = this.offset.x + this.data.boxes.collision.x;
        this.collisionbox.y = this.offset.y + this.data.boxes.collision.y;
        this.element.style.webkitTransform = `translate3d(
            ${this.offset.x}px,
            ${this.offset.y}px,
            0
        )`;
    }


    cycle ( dir ) {
        this.dir = dir;
        this.$element.removeClass( "up down right left" );
        this.$element.addClass( `walk ${dir}` );
    }


    face ( dir ) {
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



export { Hero, Sprite }
