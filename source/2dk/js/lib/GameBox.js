const Config = require( "./Config" );
const Loader = require( "./Loader" );
const { Map } = require( "./Map" );
const { Hero } = require( "./Sprite" );



class GameBox {
    constructor ( player ) {
        this.player = player;
        this.step = Config.values.step;
        this.offset = {
            x: 0,
            y: 0,
        };
        this.camera = {
            x: 0,
            y: 0,
            width: this.player.width,
            height: this.player.height,
        };

        // Hero
        this.hero = new Hero( this.player.data.hero, this );

        // Map
        this.map = new Map( Loader.cash( this.hero.data.spawn.map ), this );

        this.build();
        this.initMap();
    }


    build () {
        this.map.addSprite( this.hero );
        this.player.screen.appendChild( this.map.element );
    }

    initMap () {
        this.offset = this.update( this.hero.position );
        this.map.update( this.offset );
        this.hero.update( this.hero.position, this.offset );
    }


    pause ( paused ) {
        if ( paused ) {
            this.hero.face( this.hero.dir );
        }
    }


    update ( poi ) {
        const x = ( poi.x - (this.camera.width / 2) );
        const y = ( poi.y - (this.camera.height / 2) );
        const offset = {};

        if ( x >= 0 && x <= (this.map.width - this.camera.width) ) {
            offset.x = -x;

        } else {
            if ( x >= (this.map.width - this.camera.width) ) {
                offset.x = -(this.map.width - this.camera.width);

            } else {
                offset.x = 0;
            }
        }

        if ( y >= 0 && y <= (this.map.height - this.camera.height) ) {
            offset.y = -y;

        } else {
            if ( y >= (this.map.height - this.camera.height) ) {
                offset.y = -(this.map.height - this.camera.height);

            } else {
                offset.y = 0;
            }
        }

        this.camera.x = Math.abs( offset.x );
        this.camera.y = Math.abs( offset.y );

        return offset;
    }


    /*
    pressD ( dir ) {}


    pressA () {}


    pressB () {}


    releaseD ( dir ) {}


    releaseA () {}


    longReleaseA () {}


    releaseB () {}


    longReleaseB () {}
    */
}



module.exports = GameBox;
