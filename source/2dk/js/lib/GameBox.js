import Library from "./Library";
import Tween from "properjs-tween";
import Easing from "properjs-easing";



export default class GameBox {
    // Player
    constructor ( player ) {
        this.player = player;
        this.hero = player.hero;
        this.map = player.map;
        this.step = Library.values.step;
        this.tweens = {};
        this.viewbox = {
            width: this.player.data.width,
            height: this.player.data.height
        };
        this.mapbounds = {
            top: 0,
            bottom: this.map.height - this.viewbox.height,
            left: 0,
            right: this.map.width - this.viewbox.width
        };
        this.transform = {
            x: 0,
            y: 0,
            z: 0
        };

        this.build();
        this.init();
    }


    build () {
        this.screen = document.createElement( "div" );
        this.plane = document.createElement( "div" );
        this.screen.className = `_2dk__screen`;
        this.plane.className = `_2dk__plane`;
        this.plane.style.width = `${this.map.width}px`;
        this.plane.style.height = `${this.map.height}px`;
        this.plane.appendChild( this.hero.element );
        this.screen.appendChild( this.map.element );
        this.screen.appendChild( this.plane );
        this.player.element.appendChild( this.screen );
    }


    init () {
        this.transform = this.update( this.hero.offset );
        this.map.init( this.transform );
        this.plane.style.webkitTransform = `translate3d(
            ${this.transform.x}px,
            ${this.transform.y}px,
            0
        )`;
    }


    update ( poi ) {
        const x = ( poi.x - (this.player.data.width / 2) );
        const y = ( poi.y - (this.player.data.height / 2) );
        const transform = {};

        if ( x >= this.mapbounds.left && x <= this.mapbounds.right ) {
            transform.x = -x;

        } else {
            if ( x >= this.mapbounds.right ) {
                transform.x = -this.mapbounds.right;

            } else {
                transform.x = 0;
            }
        }

        if ( y >= this.mapbounds.top && y <= this.mapbounds.bottom ) {
            transform.y = -y;

        } else {
            if ( y >= this.mapbounds.bottom ) {
                transform.y = -this.mapbounds.bottom;

            } else {
                transform.y = 0;
            }
        }

        return transform;
    }


    move ( transform ) {
        this.transform = transform;
        this.plane.style.webkitTransform = `translate3d(
            ${this.transform.x}px,
            ${this.transform.y}px,
            0
        )`;
    }


    tween ( axis, from, to ) {
        const handler = ( t ) => {
            this.transform[ axis ] = t;
            this.plane.style.webkitTransform = `translate3d(
                ${this.transform.x}px,
                ${this.transform.y}px,
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
            complete: ( t ) => {
                handler( t );
            }
        });
    }


    press ( dir ) {
        // TODO: Cancel physics slide on end of movement!!!
        // TODO: Hero sprite cycle is buggy for diagonal movement
        // TODO: Hero hitbox collision with map tiles for movement

        // Point of interest we'd like to move to...
        const poi = {};

        if ( dir === Library.moves.LEFT ) {
            poi.x = this.hero.offset.x - Library.values.step;
            poi.y = this.hero.offset.y;
        }

        if ( dir === Library.moves.RIGHT ) {
            poi.x = this.hero.offset.x + Library.values.step;
            poi.y = this.hero.offset.y;
        }

        if ( dir === Library.moves.UP ) {
            poi.x = this.hero.offset.x;
            poi.y = this.hero.offset.y - Library.values.step;
        }

        if ( dir === Library.moves.DOWN ) {
            poi.x = this.hero.offset.x;
            poi.y = this.hero.offset.y + Library.values.step;
        }

        const collision = this.checkMap( poi );

        if ( collision ) {
            this.hero.clear( dir );
            return;
        }

        const transform = this.update( poi );

        this.hero.move( dir, poi );
        this.hero.cycle( dir );
        this.map.move( dir, transform );
        this.move( transform );
    }


    checkMap ( poi ) {
        let ret = false;
        const hitbox = this.hero.getHitbox( poi );

        for ( let y = this.map.data.collision.length; y--; ) {
            if ( ret ) {
                break;
            }

            for ( let x = this.map.data.collision[ y ].length; x--; ) {
                if ( this.map.data.collision[ y ][ x ] === 1 ) {
                    const tile = {
                        width: this.map.data.tilesize,
                        height: this.map.data.tilesize,
                        x: x * this.map.data.tilesize,
                        y: y * this.map.data.tilesize
                    };

                    if ( this.collide( hitbox, tile ) ) {
                        ret = true;
                        break;
                    }
                }
            }
        }

        return ret;
    }


    release ( dir ) {
        console.log( `GameBox release ${dir}` );

        this.hero.clear( dir );

        // TODO: Physics slide on end of movement for effect

        // this.hero.tween( "x", this.offset.x, poi.x );
        // this.hero.tween( "y", this.offset.y, poi.y );

        // this.map.tween( "x", this.offset.x, transform.x );
        // this.map.tween( "y", this.offset.y, transform.y );

        // this.tween( "x", this.transform.x, transform.x );
        // this.tween( "y", this.transform.y, transform.y );
    }


    collide ( box1, box2 ) {
        let ret = false;

        if ( box1.x < box2.x + box2.width && box1.x + box1.width > box2.x && box1.y < box2.y + box2.height && box1.height + box1.y > box2.y ) {
            ret = true;
        }

        return ret;
    };
}
