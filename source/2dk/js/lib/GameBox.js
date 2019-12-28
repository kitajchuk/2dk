const Config = require( "./Config" );
const { NPC } = require( "./Sprite" );



class GameBox {
    // Player
    constructor ( player ) {
        this.player = player;
        this.hero = player.hero;
        this.map = player.map;
        this.step = Config.values.step;
        this.mapbounds = {
            top: 0,
            bottom: this.map.height - this.player.height,
            left: 0,
            right: this.map.width - this.player.width,
        };
        this.playbox = {
            top: 0,
            bottom: this.map.height - this.hero.height,
            left: 0,
            right: this.map.width - this.hero.width,
        };
        this.transform = {
            x: 0,
            y: 0
        };
        this.npcs = [];
        this.build();
        this.apply();
        this.init();
    }


    build () {
        this.screen = document.createElement( "div" );
        this.screen.className = `_2dk__screen`;

        if ( this.player.data.fullscreen ) {
            this.screen.style.width = "100%";
            this.screen.style.height = "100%";

        } else {
            this.screen.style.width = `${this.player.width}px`;
            this.screen.style.height = `${this.player.height}px`;
        }

        this.screen.appendChild( this.map.element );
        this.player.element.appendChild( this.screen );
    }


    apply () {
        this.map.data.objects.forEach(( data ) => {
            const npc = new NPC( data, this );

            this.npcs.push( npc );
        });
    }


    init () {
        this.transform = this.update( this.hero.offset );
        this.map.init( this.transform );
    }


    update ( poi ) {
        const x = ( poi.x - (this.player.width / 2) );
        const y = ( poi.y - (this.player.height / 2) );
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


    press ( dir ) {
        const poi = this.getPoi( dir, Config.values.step );
        const collision = {
            map: this.checkMap( poi ),
            box: this.checkBox( poi ),
            npc: this.checkNPC( poi ),
        };

        this.awareNPC( poi );

        if ( collision.map || collision.box || collision.npc ) {
            this.hero.cycle( dir );
            return;
        }

        const transform = this.update( poi );

        this.hero.move( dir, poi );
        this.hero.cycle( dir );
        this.map.move( dir, transform );
    }


    pressA () {
        const poi = this.getPoi( this.hero.dir, Config.values.step );
        const npc = this.checkNPC( poi );

        if ( npc && npc.checkCon( this.hero ) ) {
            npc.shift();
        }
    }


    getPoi ( dir, step ) {
        const poi = {};

        if ( dir === Config.moves.LEFT ) {
            poi.x = this.hero.offset.x - step;
            poi.y = this.hero.offset.y;
        }

        if ( dir === Config.moves.RIGHT ) {
            poi.x = this.hero.offset.x + step;
            poi.y = this.hero.offset.y;
        }

        if ( dir === Config.moves.UP ) {
            poi.x = this.hero.offset.x;
            poi.y = this.hero.offset.y - step;
        }

        if ( dir === Config.moves.DOWN ) {
            poi.x = this.hero.offset.x;
            poi.y = this.hero.offset.y + step;
        }

        return poi;
    }


    awareNPC ( poi ) {
        for ( let i = this.npcs.length; i--; ) {
            this.npcs[ i ].checkPoi( poi );
            this.npcs[ i ].checkBox( poi );
        }
    }


    checkNPC ( poi ) {
        let ret = null;
        const hitbox = this.hero.getBox( poi, "collision" );

        for ( let i = this.npcs.length; i--; ) {
            const hitnpc = this.npcs[ i ].getBox( this.npcs[ i ].offset, "collision" );

            if ( this.collide( hitbox, hitnpc ) ) {
                ret = this.npcs[ i ];
                break;
            }
        }

        return ret;
    }


    checkBox ( poi ) {
        let ret = false;

        if ( poi.x <= this.playbox.left || poi.x >= this.playbox.right ) {
            ret = true;
        }

        if ( poi.y <= this.playbox.top || poi.y >= this.playbox.bottom ) {
            ret = true;
        }

        return ret;
    }


    checkMap ( poi ) {
        let ret = false;
        const hitbox = this.hero.getBox( poi, "collision" );

        for ( let y = this.map.data.collision.length; y--; ) {
            if ( ret ) {
                break;
            }

            for ( let x = this.map.data.collision[ y ].length; x--; ) {
                if ( this.map.data.collision[ y ][ x ] === 1 ) {
                    const tile = {
                        width: this.map.data.gridsize,
                        height: this.map.data.gridsize,
                        x: x * this.map.data.gridsize,
                        y: y * this.map.data.gridsize
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
        this.hero.face( dir );
    }


    collide ( box1, box2 ) {
        let ret = false;

        if ( box1.x < box2.x + box2.width && box1.x + box1.width > box2.x && box1.y < box2.y + box2.height && box1.height + box1.y > box2.y ) {
            ret = true;
        }

        return ret;
    };
}



module.exports = GameBox;
