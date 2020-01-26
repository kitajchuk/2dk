const Utils = require( "./Utils" );
const Loader = require( "./Loader" );
const Config = require( "./Config" );
const { Hero, Projectile } = require( "./Sprite" );
const tileSortFunc = ( tileA, tileB ) => {
    if ( tileA.amount > tileB.amount ) {
        return -1;

    } else {
        return 1;
    }
};
const stopVerbs = [
    Config.verbs.GRAB,
    Config.verbs.MOVE,
    Config.verbs.LIFT,
];
const actionVerbs = [
    Config.verbs.LIFT,
];
const attackVerbs = [
    Config.verbs.ATTACK,
];



// @see notes in ./Config.js as these are related to that line of thought...
const footTiles = [
    Config.tiles.STAIRS,
    Config.tiles.WATER,
    Config.tiles.GRASS,
    Config.tiles.HOLE,
];
const cameraTiles = [
    Config.tiles.STAIRS,
    Config.tiles.GRASS,
];



class ActiveFX {
    constructor ( data, position, map ) {
        this.data = data;
        this.position = position;
        this.image = Loader.cash( this.data.image );
        this.map = map;
        this.gamebox = this.map.gamebox;
        this.scale = this.gamebox.player.data.game.resolution;
        this.width = this.data.width / this.scale;
        this.height = this.data.height / this.scale;
        this.spritecel = this.getCel();
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
                // this.previousElapsed = elapsed;
                // this.frame = this.data.stepsX - 1;
                this.destroy();
                return;
            }
        }

        this.spritecel = this.getCel();
    }


    render () {
        this.map.layers.foreground.onCanvas.context.drawImage(
            this.image,
            this.spritecel[ 0 ],
            this.spritecel[ 1 ],
            this.data.width,
            this.data.height,
            this.map.offset.x + this.position.x,
            this.map.offset.y + this.position.y,
            this.width,
            this.height,
        );
    }


    getCel () {
        return [
            Math.abs( this.data.offsetX ) + (this.data.width * this.frame),
            Math.abs( this.data.offsetY ),
        ];
    }


    destroy () {
        this.map.activeFX.splice( this.map.activeFX.indexOf( this ), 1 );
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
        this.width = this.map.gridsize;
        this.height = this.map.gridsize;
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
        if ( this.projectile ) {
            this.projectile.blit( elapsed );

        } else {
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


    throw ( dir ) {
        this.projectile = new Projectile( this, dir, -1 );
        return this.projectile.fire();
    }


    getHitbox ( poi ) {
        return this.hitbox;
    }


    destroy () {
        this.projectile = null;
        this.map.smokeObject( this );
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
        this.gamebox = this.map.gamebox;
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


    attack ( coords ) {
        this.splice( coords );
        this.map.clearCollider({
            x: coords[ 0 ] * this.map.gridsize,
            y: coords[ 1 ] * this.map.gridsize,
            width: this.map.gridsize,
            height: this.map.gridsize,
        });
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
        this.gamebox = this.map.gamebox;
        this.data = Utils.merge( this.gamebox.player.data.objects.find( ( obj ) => (obj.id === data.id) ), data );
        this.layer = this.data.layer;
        this.width = this.data.width;
        this.height = this.data.height;
        this.position = {
            x: this.data.coords[ 0 ][ 0 ] * this.map.gridsize,
            y: this.data.coords[ 0 ][ 1 ] * this.map.gridsize,
        };
        this.hitbox = {
            x: this.position.x + (this.data.hitbox.x / this.gamebox.camera.resolution),
            y: this.position.y + (this.data.hitbox.y / this.gamebox.camera.resolution),
            width: this.data.hitbox.width / this.gamebox.camera.resolution,
            height: this.data.hitbox.height / this.gamebox.camera.resolution,
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
            this.gamebox.dialogue.play( this.data.payload.dialogue );
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
            this.gamebox.player.gameaudio.hitSound( this.state.action.sound );
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
        this.activeFX = [];
        this.offset = {
            x: 0,
            y: 0
        };
        this.poi = null;
        this.colliders = [];
        this.build();
    }


    destroy () {
        for ( let id in this.layers ) {
            this.layers[ id ].onCanvas.destroy();
            this.layers[ id ].offCanvas.destroy();
        }
        this.layers = null;

        this.activeTiles.forEach(( activeTiles ) => {
            activeTiles.destroy();
            activeTiles = null;
        });
        this.activeTiles = null;

        this.activeObjects.forEach(( activeObject ) => {
            activeObject.destroy();
            activeObject = null;
        });
        this.activeObjects = null;

        this.hero.destroy();
        this.hero = null;

        this.element.parentNode.removeChild( this.element );
        this.element = null;
        this.data = null;
        this.image = null;
        this.activeTile = null;
        this.activeFX = null;
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


/*******************************************************************************
* Rendering
*******************************************************************************/
    blit ( elapsed ) {
        this.activeTiles.forEach(( activeTiles ) => {
            activeTiles.blit( elapsed );
        });

        this.activeObjects.forEach(( activeObject ) => {
            activeObject.blit( elapsed );
        });

        if ( this.activeTile ) {
            this.activeTile.blit( elapsed );
        }

        this.activeFX.forEach(( activeFx ) => {
            activeFx.blit( elapsed );
        });
    }


    update ( offset ) {
        this.offset = offset;
    }


    render ( camera ) {
        this.clear();

        this.renderBox = this.getRenderbox( camera );

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

        // Note:
        // ActiveTiles/Objects get rendered above as they are mapped into
        // the texture layers while handling the renderBox mapping logic.
        // The following is to render debug-level canvas stuff for testing.

        if ( this.colliders.length && this.gamebox.player.query.debug ) {
            this.drawColliders();
        }

        // Draw Hero: There can only be one at a time
        if ( this.hero ) {
            this.hero.render();
        }

        // Draw FX: There can be many at one time...
        this.activeFX.forEach(( activeFx ) => {
            activeFx.render();
        });

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


    getRenderbox ( camera ) {
        const renderBox = {
            x: Math.floor( camera.x / this.gridsize ) - 1,
            y: Math.floor( camera.y / this.gridsize ) - 1,
            width: camera.width + (this.gridsize * 2),
            height: camera.height + (this.gridsize * 2),
            bleed: {},
            textures: {},
        };

        renderBox.bleed = this.getBleed( renderBox, camera );
        renderBox.textures = this.getTextures( renderBox, camera );

        return renderBox;
    }


    getBleed ( renderBox, camera ) {
        return {
            x: -(camera.x - (renderBox.x * this.gridsize)),
            y: -(camera.y - (renderBox.y * this.gridsize)),
        };
    }


    getTextures ( renderBox, camera ) {
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


    setActiveTile ( group, coords ) {
        const activeTiles = this.getActiveTiles( group );

        activeTiles.splice( coords );

        this.activeTile = new ActiveTile( activeTiles );
    }


    getActiveTiles ( group ) {
        return this.activeTiles.find( ( activeTiles ) => (activeTiles.data.group === group) );
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
                    const isTilePushed = tiles.coords.find( ( coord ) => (coord[ 0 ] === celsCoords[ 0 ] && coord[ 1 ] === celsCoords[ 1 ]) );
                    const isTileSpliced = this.getActiveTiles( tiles.group ).spliced.find( ( coord ) => (coord[ 0 ] === celsCoords[ 0 ] && coord[ 1 ] === celsCoords[ 1 ]) );

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


    addActiveFX ( id, position ) {
        const fx = this.gamebox.player.data.effects.find( ( effect ) => (effect.id === id) );

        this.activeFX.push( new ActiveFX( fx, position, this ) );
    }


    smokeObject ( obj ) {
        const origin = {
            x: obj.position.x + (obj.width / 2) - (this.gridsize / 2),
            y: obj.position.y + (obj.height / 2) - (this.gridsize / 2),
        };

        this.addActiveFX( "smoke", origin );
        this.addActiveFX( "smoke", { x: origin.x - (this.gridsize / 4), y: origin.y - (this.gridsize / 4) } );
        this.addActiveFX( "smoke", { x: origin.x + (this.gridsize / 4), y: origin.y - (this.gridsize / 4) } );
        this.addActiveFX( "smoke", { x: origin.x - (this.gridsize / 4), y: origin.y + (this.gridsize / 4) } );
        this.addActiveFX( "smoke", { x: origin.x + (this.gridsize / 4), y: origin.y + (this.gridsize / 4) } );
    }


/*******************************************************************************
* Collisions:
* Perception Checks
*******************************************************************************/
    setCollider ( obj ) {
        if ( this.gamebox.player.query.debug ) {
            const collider = this.colliders.find( ( collid ) => (collid.x === obj.x && collid.y === obj.y) );

            if ( !collider ) {
                this.colliders.push( obj );
            }
        }
    }


    setTileColliders ( tiles ) {
        if ( this.gamebox.player.query.debug ) {
            for ( let id in tiles ) {
                tiles[ id ].forEach(( tile, i ) => {
                    // Top tile for a group is sorted as most collided...
                    if ( i === 0 ) {
                        tile.tilebox.color = Config.colors.green;
                    }

                    this.clearCollider( tile.tilebox );
                    this.setCollider( tile.tilebox );
                });
            }
        }
    }


    clearCollider ( obj ) {
        if ( this.gamebox.player.query.debug ) {
            for ( let i = this.colliders.length; i--; ) {
                if ( this.colliders[ i ].x === obj.x && this.colliders[ i ].y === obj.y ) {
                    this.colliders.splice( i, 1 );
                    break;
                }
            }
        }
    }


    drawColliders () {
        if ( this.colliders.length && this.gamebox.player.query.debug ) {
            this.colliders.forEach(( collider ) => {
                const layer = (collider.layer || "background");
                const color = (collider.color || Config.colors.teal);

                this.layers[ layer ].onCanvas.context.globalAlpha = 0.5;
                this.layers[ layer ].onCanvas.context.fillStyle = color;
                this.layers[ layer ].onCanvas.context.fillRect(
                    this.offset.x + collider.x,
                    this.offset.y + collider.y,
                    collider.width,
                    collider.height,
                );
                this.layers[ layer ].onCanvas.context.globalAlpha = 1.0;
            });
        }
    }


    checkBox ( poi, sprite ) {
        let ret = false;

        if ( poi.x <= this.gamebox.camera.x || poi.x >= (this.gamebox.camera.x + this.gamebox.camera.width - sprite.width) ) {
            ret = true;
        }

        if ( poi.y <= this.gamebox.camera.y || poi.y >= (this.gamebox.camera.y + this.gamebox.camera.height - sprite.height) ) {
            ret = true;
        }

        return ret;
    }


    checkMap ( poi, sprite ) {
        let ret = false;
        const hitbox = sprite.getHitbox( poi );

        for ( let i = this.data.collision.length; i--; ) {
            const collider = this.data.collider / this.gamebox.player.data.game.resolution;
            const tile = {
                width: collider,
                height: collider,
                x: this.data.collision[ i ][ 0 ] * collider,
                y: this.data.collision[ i ][ 1 ] * collider,
                layer: "foreground",
            };

            if ( Utils.collide( hitbox, tile ) ) {
                ret = true;
                this.setCollider( tile );
                // break;

            } else {
                this.clearCollider( tile );
            }
        }

        return ret;
    }


    checkEvt ( poi, sprite ) {
        let ret = false;
        const hitbox = {
            width: sprite.width,
            height: sprite.height,
            x: sprite.position.x,
            y: sprite.position.y,
        };

        for ( let i = this.data.events.length; i--; ) {
            const tile = {
                width: this.gridsize,
                height: this.gridsize,
                x: this.data.events[ i ].coords[ 0 ] * this.gridsize,
                y: this.data.events[ i ].coords[ 1 ] * this.gridsize
            };

            if ( Utils.collide( hitbox, tile ) && (this.hero.dir === this.data.events[ i ].dir) ) {
                ret = this.data.events[ i ];
                this.setCollider( tile );
                break;

            } else {
                this.clearCollider( tile );
            }
        }

        return ret;
    }


    checkObj ( poi, sprite ) {
        let ret = false;
        let collider;
        const hitbox = sprite.getHitbox( poi );

        for ( let i = this.activeObjects.length; i--; ) {
            collider = {
                x: this.activeObjects[ i ].position.x,
                y: this.activeObjects[ i ].position.y,
                width: this.activeObjects[ i ].width / this.gamebox.camera.resolution,
                height: this.activeObjects[ i ].height / this.gamebox.camera.resolution,
                layer: this.activeObjects[ i ].layer,
            };

            if ( Utils.collide( hitbox, this.activeObjects[ i ].hitbox ) ) {
                ret = this.activeObjects[ i ];
                this.setCollider( collider );
                // break;

            } else {
                this.clearCollider( collider );
            }
        }

        return ret;
    }


    checkTiles ( poi ) {
        let ret = false;
        let amount;
        const tiles = {
            action: [],
            attack: [],
            passive: [],
        };
        const hitbox = this.hero.getHitbox( poi );
        const footbox = this.hero.getFootbox( poi );

        for ( let i = this.activeTiles.length; i--; ) {
            const tile = this.activeTiles[ i ];
            const lookbox = ((footTiles.indexOf( tile.data.group ) !== -1) ? footbox : hitbox);

            for ( let j = this.activeTiles[ i ].data.coords.length; j--; ) {
                const tilebox = {
                    width: this.gridsize,
                    height: this.gridsize,
                    x: tile.data.coords[ j ][ 0 ] * this.gridsize,
                    y: tile.data.coords[ j ][ 1 ] * this.gridsize,
                };
                const collides = Utils.collide( lookbox, tilebox );

                if ( collides ) {
                    // Utils.collides returns a useful collider object...
                    const amount = collides.width * collides.height;
                    const match = {
                        tile,
                        jump: (tile.data.action && tile.data.action.verb === Config.verbs.JUMP),
                        stop: (tile.data.action && stopVerbs.indexOf( tile.data.action.verb ) !== -1),
                        act: (tile.data.action && actionVerbs.indexOf( tile.data.action.verb ) !== -1),
                        hit: (tile.data.attack && attackVerbs.indexOf( tile.data.attack.verb ) !== -1),
                        cam: (cameraTiles.indexOf( tile.data.group ) !== -1),
                        group: tile.data.group,
                        coord: tile.data.coords[ j ],
                        amount,
                        tilebox,
                        collides,
                    };

                    if ( tile.data.action ) {
                        tiles.action.push( match );
                    }

                    if ( tile.data.attack ) {
                        tiles.attack.push( match );
                    }

                    if ( (!tile.data.action && !tile.data.attack) || (tile.data.attack && match.cam) ) {
                        tiles.passive.push( match );
                    }

                } else if ( this.gamebox.player.query.debug ) {
                    this.clearCollider( tilebox );
                }
            }
        }

        if ( tiles.action.length || tiles.attack.length || tiles.passive.length ) {
            tiles.action = tiles.action.sort( tileSortFunc );
            tiles.attack = tiles.attack.sort( tileSortFunc );
            tiles.passive = tiles.passive.sort( tileSortFunc );

            if ( this.gamebox.player.query.debug ) {
                this.setTileColliders( tiles );
            }

            ret = tiles;
        }

        return ret;
    }
}



module.exports = {
    Map,
    MapLayer,
};
