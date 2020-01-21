const Utils = require( "./Utils" );
const Loader = require( "./Loader" );
const Config = require( "./Config" );
const Tween = require( "properjs-tween" );
const Easing = require( "properjs-easing" );
const stopTiles = [
    Config.verbs.GRAB,
    Config.verbs.MOVE,
    Config.verbs.LIFT,
];



class Sprite {
    constructor ( data, map ) {
        this.data = data;
        this.map = map;
        this.gamebox = this.map.gamebox;
        this.scale = this.gamebox.player.data.game.resolution;
        this.width = this.data.width / this.scale;
        this.height = this.data.height / this.scale;
        this.dir = this.data.spawn.dir;
        this.verb = Config.verbs.FACE;
        this.image = Loader.cash( this.data.image );
        this.position = {
            x: this.data.spawn.x / this.scale,
            y: this.data.spawn.y / this.scale,
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
        this.footbox = {
            x: this.hitbox.x,
            y: this.hitbox.y + (this.hitbox.height / 2),
            width: this.hitbox.width,
            height: this.hitbox.height / 2,
        };
        this.spritecel = this.getCel();
    }


    blit ( elapsed ) {
        if ( typeof this.previousElapsed === "undefined" ) {
            this.previousElapsed = elapsed;
        }

        this.frame = 0;

        if ( this.data.verbs[ this.verb ][ this.dir ].stepsX ) {
            const diff = (elapsed - this.previousElapsed);

            this.frame = Math.floor( (diff / this.data.verbs[ this.verb ].dur) * this.data.verbs[ this.verb ][ this.dir ].stepsX );

            if ( diff >= this.data.verbs[ this.verb ].dur ) {
                this.previousElapsed = elapsed;
                this.frame = this.data.verbs[ this.verb ][ this.dir ].stepsX - 1;
            }
        }

        this.spritecel = this.getCel();
    }


    render () {
        this.map.layers.background.onCanvas.context.drawImage(
            this.image,
            this.spritecel[ 0 ],
            this.spritecel[ 1 ],
            this.data.width,
            this.data.height,
            this.offset.x,
            this.offset.y,
            this.width,
            this.height,
        );
    }


    getCel () {
        return [
            Math.abs( this.data.verbs[ this.verb ][ this.dir ].offsetX ) + (this.data.width * this.frame),
            Math.abs( this.data.verbs[ this.verb ][ this.dir ].offsetY ),
        ];
    }


    cycle ( verb, dir ) {
        this.dir = dir;
        this.verb = verb;
    }


    act ( verb, dir ) {
        this.dir = dir;
        this.verb = verb;
    }


    face ( dir ) {
        this.act( Config.verbs.FACE, dir );
    }


    getHitbox ( poi ) {
        return {
            x: poi.x + (this.data.hitbox.x / this.scale),
            y: poi.y + (this.data.hitbox.y / this.scale),
            width: this.hitbox.width,
            height: this.hitbox.height,
        };
    }


    getFootbox ( poi ) {
        return {
            x: poi.x + (this.data.hitbox.x / this.scale),
            y: poi.y + ((this.data.hitbox.y / this.scale) + (this.hitbox.height / 2)),
            width: this.footbox.width,
            height: this.footbox.height,
        };
    }


    destroy () {
        this.data = null;
    }
}



class Hero extends Sprite {
    constructor ( data, gamebox ) {
        super( data, gamebox );
    }


    update ( poi, offset ) {
        this.position = poi;
        this.hitbox.x = this.position.x + (this.data.hitbox.x / this.scale);
        this.hitbox.y = this.position.y + (this.data.hitbox.y / this.scale);
        this.footbox.x = this.hitbox.x;
        this.footbox.y = this.hitbox.y + (this.hitbox.height / 2);

        const absolute = {
            x: Math.abs( offset.x ),
            y: Math.abs( offset.y ),
        };

        this.offset = {
            x: this.gamebox.camera.width / 2,
            y: this.gamebox.camera.height / 2,
        };

        if ( absolute.x <= 0 ) {
            // this.offset.x = Math.max( 0, poi.x );
            this.offset.x = poi.x;
        }

        if ( absolute.x >= (this.gamebox.map.width - this.gamebox.camera.width) ) {
            this.offset.x = poi.x + offset.x;
        }

        if ( absolute.y <= 0 ) {
            // this.offset.y = Math.max( 0, poi.y );
            this.offset.y = poi.y
        }

        if ( absolute.y >= (this.gamebox.map.height - this.gamebox.camera.height) ) {
            this.offset.y = poi.y + offset.y;
        }
    }
}



class Tossable {
    constructor ( activeTile, dir, dist, dur ) {
        this.activeTile = activeTile;
        this.dir = dir;
        this.dist = dist;
        this.dur = dur;
    }


    getValues () {
        const poi = {};
        const origin = this.activeTile.position;

        if ( this.dir === "up" ) {
            poi.x = this.activeTile.position.x;
            poi.y = this.activeTile.position.y - this.dist;

        } else if ( this.dir === "down" ) {
            poi.x = this.activeTile.position.x;
            poi.y = this.activeTile.position.y + this.dist;

        } else if ( this.dir === "left" ) {
            poi.x = this.activeTile.position.x - this.dist;
            poi.y = this.activeTile.position.y + this.activeTile.map.gridsize;

        } else if ( this.dir === "right" ) {
            poi.x = this.activeTile.position.x + this.dist;
            poi.y = this.activeTile.position.y + this.activeTile.map.gridsize;
        }

        const angle = Utils.getAngle( this.activeTile.position, poi );

        return {
            poi,
            angle,
            origin,
        }
    }


    update ( t ) {
        const distance = this.dist - (this.dist - t);
        const position = Utils.translate( this.values.origin, this.values.angle, distance );
        const collision = this.activeTile.gamebox.getCollision( position );

        this.activeTile.position = position;
        this.activeTile.hitbox.x = this.activeTile.position.x;
        this.activeTile.hitbox.y = this.activeTile.position.y;

        if ( collision.map || collision.obj || collision.box || (collision.tile && collision.tile.activeTiles.data.action && stopTiles.indexOf( collision.tile.activeTiles.data.action.verb ) !== -1) ) {
            this.tween.stop();
            this.activeTile.destroy();
            this.resolve();
        }
    }


    toss () {
        return new Promise(( resolve ) => {
            this.resolve = resolve;
            this.values = this.getValues();
            this.tween = new Tween({
                ease: Easing.swing,
                duration: this.dur,
                from: 0,
                to: this.dist,
                update: this.update.bind( this ),
                complete: ( t ) => {
                    this.update( t );
                    this.activeTile.destroy();
                    this.resolve();
                },
            });
        });
    }
}



/*******************************************************************************
* ActiveTile
* Generated when the Hero picks up a liftable tile from a group of ActiveTiles.
*******************************************************************************/
class ActiveTile {
    constructor ( activeTiles ) {
        this.activeTiles = activeTiles;
        this.map = this.activeTiles.map;
        this.gamebox = this.activeTiles.map.gamebox;
        this.tilecel = this.activeTiles.getTile();
        this.projectile = false;
        this.position = {
            x: this.map.hero.position.x + (this.map.hero.width / 2) - (this.map.gridsize / 2),
            y: this.map.hero.position.y - (this.map.gridsize / 8),
        };
        this.hitbox = {
            x: 0,
            y: 0,
            width: this.map.gridsize,
            height: this.map.gridsize,
        };
    }


    blit ( elapsed ) {
        if ( !this.projectile ) {
            this.position = {
                x: this.map.hero.position.x + (this.map.hero.width / 2) - (this.map.gridsize / 2),
                y: this.map.hero.position.y - (this.map.gridsize / 8),
            };
        }

        this.hitbox.x = this.position.x;
        this.hitbox.y = this.position.y;
    }


    render () {
        this.map.layers.foreground.onCanvas.context.drawImage(
            this.map.image,
            this.tilecel[ 0 ],
            this.tilecel[ 1 ],
            this.map.data.tilesize,
            this.map.data.tilesize,
            this.map.offset.x + this.position.x,
            this.map.offset.y + this.position.y,
            this.map.gridsize,
            this.map.gridsize,
        );
    }


    toss ( dir ) {
        this.projectile = true;
        this.tossable = new Tossable( this, dir, (this.gamebox.map.gridsize * 3), (this.gamebox.map.gridsize * 6) );
        return this.tossable.toss();
    }


    destroy () {
        this.tossable = null;
        this.map.activeTile = null;
    }
}



/*******************************************************************************
* ActiveTiles
* Static and animated background tiles injected into the texture map.
* They work in groups based on tileset background position for rendering.
* They can have interactions with VERB system or can be attacked with weapon.
*******************************************************************************/
class ActiveTiles {
    constructor ( data, map ) {
        this.data = data;
        this.map = map;
        this.frame = 0;
        this.spliced = [];
    }


    destroy () {
        this.data = null;
    }


    blit ( elapsed ) {
        if ( typeof this.previousElapsed === "undefined" ) {
            this.previousElapsed = elapsed;
        }

        this.frame = 0;

        if ( this.data.stepsX ) {
            const diff = (elapsed - this.previousElapsed);

            this.frame = Math.floor( (diff / this.data.dur) * this.data.stepsX );

            if ( diff >= this.data.dur ) {
                this.previousElapsed = elapsed;
                this.frame = this.data.stepsX - 1;
            }
        }
    }


    getTile () {
        return [
            (this.data.offsetX + (this.frame * this.map.data.tilesize)),
            this.data.offsetY,
        ];
    }


    canInteract () {
        return this.data.action;
    }


    canAttack () {
        return this.data.attack;
    }


    splice ( coords ) {
        for ( let i = this.data.coords.length; i--; ) {
            if ( this.data.coords[ i ][ 0 ] === coords[ 0 ] && this.data.coords[ i ][ 1 ] === coords[ 1 ] ) {
                this.spliced.push( this.data.coords[ i ] );
                this.data.coords.splice( i, 1 );
                break;
            }
        }
    }
}



/*******************************************************************************
* ActiveObject
* An interactive, collidable object to be injected in the texture map.
* Can be static or animated. Rendering is determined by object size & coords.
* This means a 4x4 tile sized object is rendered in 4 separate tile checks
* when the map textures are rendering.
*******************************************************************************/
class ActiveObject {
    constructor ( data, map ) {
        this.map = map;
        this.data = Utils.merge( map.gamebox.player.data.objects.find( ( obj ) => (obj.id === data.id) ), data );
        this.layer = this.data.layer;
        this.width = this.data.width;
        this.height = this.data.height;
        this.position = {
            x: this.data.coords[ 0 ][ 0 ] * this.map.gridsize,
            y: this.data.coords[ 0 ][ 1 ] * this.map.gridsize,
        };
        this.hitbox = {
            x: this.position.x + (this.data.hitbox.x / this.map.gamebox.camera.resolution),
            y: this.position.y + (this.data.hitbox.y / this.map.gamebox.camera.resolution),
            width: this.data.hitbox.width / this.map.gamebox.camera.resolution,
            height: this.data.hitbox.height / this.map.gamebox.camera.resolution,
        };
        this.states = Utils.copy( this.data.states );
        this.relative = (this.hitbox.height !== this.height);
        this.frame = 0;
        this.shift();
    }


    destroy () {
        this.data = null;
    }


    shift () {
        if ( this.states.length ) {
            this.state = this.states.shift();
        }
    }


    blit ( elapsed ) {
        if ( typeof this.previousElapsed === "undefined" ) {
            this.previousElapsed = elapsed;
        }

        this.frame = 0;

        if ( this.state.stepsX ) {
            const diff = (elapsed - this.previousElapsed);

            this.frame = Math.floor( (diff / this.state.dur) * this.state.stepsX );

            if ( diff >= this.state.dur ) {
                this.previousElapsed = elapsed;
                this.frame = this.state.stepsX - 1;
            }
        }

        if ( this.relative ) {
            if ( this.hitbox.y > this.map.hero.hitbox.y ) {
                this.layer = "foreground";

            } else {
                this.layer = "background";
            }
        }
    }


    getTile ( coords ) {
        const offsetX = (this.state.offsetX + (this.frame * this.width));

        return [
            offsetX + ((coords[ 0 ] - this.data.coords[ 0 ][ 0 ]) * this.map.data.tilesize),
            this.state.offsetY + ((coords[ 1 ] - this.data.coords[ 0 ][ 1 ]) * this.map.data.tilesize),
        ];
    }


    payload () {
        if ( this.data.payload.dialogue ) {
            this.map.gamebox.dialogue.play( this.data.payload.dialogue );
        }
    }


    canInteract ( dir ) {
        return (this.state.action && this.state.action.require && this.state.action.require.dir && dir === this.state.action.require.dir);
    }


    doInteract ( dir ) {
        if ( this.data.payload ) {
            this.payload();
        }

        if ( this.state.action.sound ) {
            this.map.gamebox.player.gameaudio.hitSound( this.state.action.sound );
        }

        if ( this.state.action.shift ) {
            this.shift();
        }
    }
}



/*******************************************************************************
* MapLayer
* Normalize a rendering layer for Canvas and Context.
*******************************************************************************/
class MapLayer {
    // id, width, height
    constructor ( data ) {
        this.data = data;
        this.build();
    }


    build () {
        this.canvas = document.createElement( "canvas" );
        this.canvas.className = "_2dk__layer";
        this.canvas.dataset.layer = this.data.id;
        this.context = this.canvas.getContext( "2d" );
        this.update( this.data.width, this.data.height );
    }


    update ( width, height ) {
        this.data.width = width;
        this.data.height = height;
        this.canvas.style.width = `${width}px`;
        this.canvas.style.height = `${height}px`;
        this.canvas.width = width;
        this.canvas.height = height;
    }


    clear () {
        this.context.clearRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );
    }


    destroy () {
        this.clear();
        this.canvas.width = 0;
        this.canvas.height = 0;
        this.context = null;
        this.canvas = null;
    }
}



/*******************************************************************************
* Map
* The logic map.
* Everything is rendered via the Map as the Map is our game world.
* My preference is to keep this sort of logic out of the GameBox, which
* manages Map offset and Camera position.
*******************************************************************************/
class Map {
    constructor ( data, heroData, gamebox ) {
        this.data = data;
        this.heroData = heroData;
        this.gamebox = gamebox;
        this.width = this.data.width / this.gamebox.camera.resolution;
        this.height = this.data.height / this.gamebox.camera.resolution;
        this.gridsize = this.data.tilesize / this.gamebox.camera.resolution;
        this.image = Loader.cash( data.image );
        this.layers = {
            background: null,
            foreground: null,
        };
        this.activeTile = null;
        this.activeTiles = [];
        this.activeObjects = [];
        this.offset = {
            x: 0,
            y: 0
        };
        this.poi = null;
        this.build();
    }


    destroy () {
        for ( let id in this.layers ) {
            this.layers[ id ].onCanvas.destroy();
            this.layers[ id ].offCanvas.destroy();
        }

        this.activeTiles.forEach(( activeTiles ) => {
            activeTiles.destroy();
            activeTiles = null;
        });

        this.activeObjects.forEach(( activeObject ) => {
            activeObject.destroy();
            activeObject = null;
        });

        this.element.parentNode.removeChild( this.element );
        this.activeObjects = null;
        this.activeTiles = null;
        this.data = null;
        this.element = null;
        this.image = null;
        this.layers = null;
    }


    build () {
        this.element = document.createElement( "div" );
        this.element.className = "_2dk__map";

        // Hero
        this.hero = new Hero( this.heroData, this );

        for ( let id in this.hero.data.sounds ) {
            this.gamebox.player.gameaudio.addSound({
                id,
                src: this.hero.data.sounds[ id ],
                channel: "sfx",
            });
        }

        // ActiveTiles
        this.data.tiles.forEach(( data ) => {
            this.activeTiles.push( new ActiveTiles( data, this ) );
        });

        // ActiveObjects
        this.data.objects.forEach(( data ) => {
            this.activeObjects.push( new ActiveObject( data, this ) );
        });

        // Render layers
        for ( let id in this.layers ) {
            this.addLayer( id );
        }
    }


    update ( poi, offset ) {
        this.poi = poi;
        this.offset = offset;
        this.hero.update( this.poi, this.offset );
    }


    getRenderbox ( elapsed, camera ) {
        const renderBox = {
            x: Math.floor( camera.x / this.gridsize ) - 1,
            y: Math.floor( camera.y / this.gridsize ) - 1,
            width: camera.width + (this.gridsize * 2),
            height: camera.height + (this.gridsize * 2),
            bleed: {},
            textures: {},
        };

        renderBox.bleed = this.getBleed( renderBox, elapsed, camera );
        renderBox.textures = this.getTextures( renderBox, elapsed, camera );

        return renderBox;
    }


    getBleed ( renderBox, elapsed, camera ) {
        return {
            x: -(camera.x - (renderBox.x * this.gridsize)),
            y: -(camera.y - (renderBox.y * this.gridsize)),
        };
    }


    getTextures ( renderBox, elapsed, camera ) {
        let ret = {};

        for ( let id in this.data.textures ) {
            ret[ id ] = [];

            const height = (renderBox.height / this.gridsize);
            let y = 0;

            while ( y < height ) {
                ret[ id ][ y ] = [];

                const lookupY = renderBox.y + y;

                if ( this.data.textures[ id ][ lookupY ] ) {
                    const width = (renderBox.width / this.gridsize);
                    let x = 0;

                    while ( x < width ) {
                        const lookupX = renderBox.x + x;
                        const activeObject = this.getActiveObject( id, lookupX, lookupY );

                        if ( this.data.textures[ id ][ lookupY ][ lookupX ] ) {
                            const celsCopy = Utils.copy( this.data.textures[ id ][ lookupY ][ lookupX ] );
                            const activeTile = this.getActiveTile( id, [lookupX, lookupY], celsCopy );

                            // Render the textures
                            ret[ id ][ y ][ x ] = celsCopy;

                            // Push any ActiveTiles to the cel stack
                            if ( activeTile ) {
                                ret[ id ][ y ][ x ].push( activeTile );
                            }

                            // Push any ActiveObject tiles to the cel stack
                            if ( activeObject ) {
                                ret[ id ][ y ][ x ].push( activeObject );
                            }

                        } else {
                            // ActiveObject tiles can move between background and foreground
                            ret[ id ][ y ][ x ] = activeObject ? [activeObject] : 0;
                        }

                        x++;
                    }
                }

                y++;
            }
        }

        return ret;
    }


    setActiveTile ( activeTiles, coords ) {
        activeTiles.splice( coords );

        this.activeTile = new ActiveTile( activeTiles );

        return this.activeTile;
    }


    getActiveTiles ( group ) {
        return this.activeTiles.find(( activeTiles ) => {
            return (activeTiles.data.group === group);
        });
    }


    getActiveTile ( layer, celsCoords, celsCopy ) {
        let ret = null;

        // Either return a tile or don't if it's a static thing...

        loopTiles:
            for ( let i = this.data.tiles.length; i--; ) {
                const tiles = this.data.tiles[ i ];

                // Skip if not even the right layer to begin with...
                if ( layer !== tiles.layer ) {
                    continue;
                }

                const topCel = celsCopy[ celsCopy.length - 1 ];

                if ( tiles.coords.length ) {
                    loopCoords:
                        for ( let j = tiles.coords.length; j--; ) {
                            const coord = tiles.coords[ j ];

                            // Correct tile coords
                            if ( coord[ 0 ] === celsCoords[ 0 ] && coord[ 1 ] === celsCoords[ 1 ] ) {
                                // (tiles.offsetX === topCel[ 0 ] && tiles.offsetY === topCel[ 1 ])
                                const isTileAnimated = tiles.stepsX;

                                // Make sure we don't dupe a tile match if it's NOT animated...
                                if ( isTileAnimated ) {
                                    ret = this.getActiveTiles( tiles.group ).getTile();
                                    break loopTiles;
                                }
                            }
                        }
                }

                if ( tiles.offsetX === topCel[ 0 ] && tiles.offsetY === topCel[ 1 ] ) {
                    // Check if tile is pushed...
                    const isTilePushed = tiles.coords.find(( coord ) => {
                        return (coord[ 0 ] === celsCoords[ 0 ] && coord[ 1 ] === celsCoords[ 1 ]);
                    });
                    const isTileSpliced = this.getActiveTiles( tiles.group ).spliced.find(( coord ) => {
                        return (coord[ 0 ] === celsCoords[ 0 ] && coord[ 1 ] === celsCoords[ 1 ]);
                    });

                    // Push the tile to the coords Array...
                    // This lets us generate ActiveTile groups that will
                    // find their coordinates in real-time using background-position...
                    /* Example: This will find stairs tiles and push them into the coords stack...
                        {
                            "group": "stairs",
                            "layer": "background",
                            "coords": [],
                            "offsetX": 256,
                            "offsetY": 384
                        }
                    */
                    if ( !isTilePushed && !isTileSpliced ) {
                        tiles.coords.push( celsCoords );
                        break loopTiles;

                    // An ActiveTiles coord can be spliced during interaction.
                    // Example: Hero picks up an action tile and throws it.
                    // The original tile cel still exists in the textures data,
                    // but we can capture this condition and make sure we pop
                    // if off and no longer render it to the texture map.
                    } else if ( isTileSpliced ) {
                        celsCopy.pop();
                        ret = celsCopy;
                    }
                }
            }

        return ret;
    }


    getActiveObject ( layer, lookupX, lookupY ) {
        let ret = null;

        this.activeObjects.forEach(( activeObject ) => {
            // Correct render layer AND correct tile coords
            if ( layer === activeObject.layer ) {
                activeObject.data.coords.forEach(( coord ) => {
                    if ( coord[ 0 ] === lookupX && coord[ 1 ] === lookupY ) {
                        ret = activeObject.getTile( coord );
                    }
                });
            }
        });

        return ret;
    }


    render ( elapsed, camera ) {
        this.clear();

        this.activeTiles.forEach(( activeTiles ) => {
            activeTiles.blit( elapsed );
        });

        this.activeObjects.forEach(( activeObject ) => {
            activeObject.blit( elapsed );
        });

        if ( this.activeTile ) {
            this.activeTile.blit( elapsed );
        }

        if ( this.hero ) {
            this.hero.blit( elapsed );
        }

        this.renderBox = this.getRenderbox( elapsed, camera );

        for ( let id in this.layers ) {
            // Draw textures to background / foreground
            Utils.drawMapTiles(
                this.layers[ id ].offCanvas.context,
                this.image,
                this.renderBox.textures[ id ],
                this.data.tilesize,
                this.gridsize,
            );

            // Draw offscreen canvases to the onscreen canvases
            this.layers[ id ].onCanvas.context.drawImage(
                this.layers[ id ].offCanvas.canvas,
                0,
                0,
                this.layers[ id ].offCanvas.canvas.width,
                this.layers[ id ].offCanvas.canvas.height,
                this.renderBox.bleed.x,
                this.renderBox.bleed.y,
                this.layers[ id ].offCanvas.canvas.width,
                this.layers[ id ].offCanvas.canvas.height,
            );
        }

        // Draw Hero: There can only be one at a time
        if ( this.hero ) {
            this.hero.render();
        }

        // Draw ActiveTile: There can only be one at a time
        if ( this.activeTile ) {
            this.activeTile.render();
        }
    }


    clear () {
        for ( let id in this.layers ) {
            this.layers[ id ].onCanvas.clear();
            this.layers[ id ].offCanvas.clear();
        }
    }


    addLayer ( id ) {
        const offWidth = this.gamebox.camera.width + (this.gridsize * 2);
        const offHeight = this.gamebox.camera.height + (this.gridsize * 2);

        this.layers[ id ] = {};
        this.layers[ id ].onCanvas = new MapLayer({
            id,
            map: this,
            width: this.gamebox.camera.width,
            height: this.gamebox.camera.height,
        });
        this.layers[ id ].offCanvas = new MapLayer({
            id,
            map: this,
            width: offWidth,
            height: offHeight,
        });

        this.element.appendChild( this.layers[ id ].onCanvas.canvas );
    }
}



module.exports = {
    Map,
    Hero,
    Sprite,
    MapLayer,
};
