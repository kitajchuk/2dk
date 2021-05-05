const Utils = require( "./Utils" );
const Loader = require( "./Loader" );
const Config = require( "./Config" );
const Hero = require( "./sprites/Hero" );
const NPC = require( "./sprites/NPC" );
const Companion = require( "./sprites/Companion" );
const companionSortFunc = ( a, b ) => {
    if ( a.hero ) {
        return 1;
    }

    if ( b.hero ) {
        return -1;
    }

    return 0;
};



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


    destroy () {}


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
        // this.map.clearCollider({
        //     x: coords[ 0 ] * this.map.data.tilesize,
        //     y: coords[ 1 ] * this.map.data.tilesize,
        //     width: this.map.data.tilesize,
        //     height: this.map.data.tilesize,
        // });
    }


    splice ( coords ) {
        for ( let i = this.data.coords.length; i--; ) {
            if ( this.data.coords[ i ][ 0 ] === coords[ 0 ] && this.data.coords[ i ][ 1 ] === coords[ 1 ] ) {
                this.spliced.push( this.data.coords[ i ] );
                this.data.coords.splice( i, 1 );
                return true;
            }
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
        this.camera = this.gamebox.camera;
        this.width = this.data.width;
        this.height = this.data.height;
        this.image = Loader.cash( data.image );
        this.layers = {
            background: null,
            foreground: null,
        };
        this.activeTiles = [];
        this.fx = [];
        this.npcs = [];
        this.offset = {
            x: 0,
            y: 0
        };
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
        });
        this.activeTiles = null;

        this.npcs.forEach(( npc ) => {
            npc.destroy();
        });
        this.npcs = null;

        this.fx.forEach(( fx ) => {
            fx.destroy();
        });
        this.fx = null;

        this.hero.destroy();
        this.hero = null;

        this.element.parentNode.removeChild( this.element );
        this.element = null;
        this.image = null;
        this.colliders = null;
    }


    build () {
        this.element = document.createElement( "div" );
        this.element.className = "_2dk__map";

        // Render layers
        for ( let id in this.layers ) {
            this.addLayer( id );
        }

        // Hero
        this.heroData.spawn = this.data.spawn[ this.heroData.spawn ];
        this.hero = new Hero( this.heroData, this );

        for ( let id in this.hero.data.sounds ) {
            this.gamebox.player.gameaudio.addSound({
                id,
                src: this.hero.data.sounds[ id ],
                channel: "sfx",
            });
        }

        // Companion?
        if ( this.heroData.companion ) {
            this.heroData.companion = this.gamebox.player.getMergedData( this.heroData.companion, "npcs" );
            this.heroData.companion.spawn = {
                x: this.hero.position.x,
                y: this.hero.position.y,
            };

            this.npcs.push( new Companion( this.heroData.companion, this.hero ) );
        }

        // NPCs
        this.data.npcs.forEach(( data ) => {
            this.npcs.push( new NPC( this.gamebox.player.getMergedData( data, "npcs" ), this ) );
        });

        // Tiles
        this.data.tiles.forEach(( data ) => {
            this.activeTiles.push( new ActiveTiles( data, this ) );
        });
    }


    addLayer ( id ) {
        const offWidth = this.gamebox.camera.width + (this.data.tilesize * 2);
        const offHeight = this.gamebox.camera.height + (this.data.tilesize * 2);

        this.layers[ id ] = {};
        this.layers[ id ].onCanvas = new MapLayer({
            id,
            width: this.gamebox.camera.width,
            height: this.gamebox.camera.height,
        });
        this.layers[ id ].offCanvas = new MapLayer({
            id,
            width: offWidth,
            height: offHeight,
        });

        this.layers[ id ].onCanvas.canvas.width = `${this.gamebox.camera.width * this.gamebox.camera.resolution}`;
        this.layers[ id ].onCanvas.canvas.height = `${this.gamebox.camera.height * this.gamebox.camera.resolution}`;
        this.layers[ id ].offCanvas.canvas.width = `${offWidth * this.gamebox.camera.resolution}`;
        this.layers[ id ].offCanvas.canvas.height = `${offHeight * this.gamebox.camera.resolution}`;

        this.element.appendChild( this.layers[ id ].onCanvas.canvas );
    }


/*******************************************************************************
* Rendering
* Order is: blit, update, render
* Map data order is: tiles, objects, hero, npcs, fx
*******************************************************************************/
    blit ( elapsed ) {
        this.activeTiles.forEach(( activeTiles ) => {
            activeTiles.blit( elapsed );
        });

        this.npcs.forEach(( npc ) => {
            npc.blit( elapsed );
        });

        this.hero.blit( elapsed );

        this.fx.forEach(( fx ) => {
            fx.blit( elapsed );
        });
    }


    update ( offset ) {
        this.offset = offset;

        this.npcs.forEach(( npc ) => {
            npc.update();
        });

        this.fx.forEach(( fx ) => {
            fx.update();
        });
    }


    render ( camera ) {
        this.clear();

        this.camera = camera;
        this.renderBox = this.getRenderbox( camera );

        // Separate FLOAT NPCs from the normies
        const npcs = this.npcs.filter(( npc ) => {
            return npc.data.type !== Config.npc.FLOAT;

        // Sort non-FLOAT companions to top of stack
        // Only a companion NPC can have a hero reference
        }).sort( companionSortFunc );
        const floats = this.npcs.filter(( npc ) => {
            return npc.data.type === Config.npc.FLOAT;
        });

        // Draw background textures
        this.renderTextures( "background" );

        // Note:
        // ActiveTiles get rendered above as they are mapped into
        // the texture layers while handling the renderBox mapping logic.
        // The following is to render debug-level canvas stuff for testing.
        // if ( this.colliders.length && this.gamebox.player.query.debug ) {
        //     this.drawColliders();
        // }

        // Draw NPCs
        // They can draw to either background OR foreground
        npcs.forEach(( npc ) => {
            npc.render();
        });

        // Draw Hero
        this.hero.render();

        // Draw foreground textures
        this.renderTextures( "foreground" );

        // Draw float companions (render AFTER texture foreground)
        floats.forEach(( float ) => {
            float.render();
        });

        // Draw FX
        // This is the topmost layer so we can do cool stuff...
        this.fx.forEach(( fx ) => {
            fx.render();
        });
    }


    renderTextures ( id ) {
        // Draw textures to background / foreground
        Utils.drawMapTiles(
            this.layers[ id ].offCanvas.context,
            this.image,
            this.renderBox.textures[ id ],
            this.data.tilesize,
            this.data.tilesize
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
            this.layers[ id ].offCanvas.canvas.height
        );
    }


    clear () {
        for ( let id in this.layers ) {
            this.layers[ id ].onCanvas.clear();
            this.layers[ id ].offCanvas.clear();
        }
    }


    getRenderbox ( camera ) {
        const renderBox = {
            x: Math.floor( camera.x / this.data.tilesize ) - 1,
            y: Math.floor( camera.y / this.data.tilesize ) - 1,
            width: camera.width + (this.data.tilesize * 2),
            height: camera.height + (this.data.tilesize * 2),
            bleed: {},
            textures: {},
        };

        renderBox.bleed = this.getBleed( renderBox, camera );
        renderBox.textures = this.getTextures( renderBox, camera );

        return renderBox;
    }


    getBleed ( renderBox, camera ) {
        return {
            x: -(camera.x - (renderBox.x * this.data.tilesize)),
            y: -(camera.y - (renderBox.y * this.data.tilesize)),
        };
    }


    getTextures ( renderBox ) {
        let ret = {};

        for ( let id in this.data.textures ) {
            ret[ id ] = [];

            const height = (renderBox.height / this.data.tilesize);
            let y = 0;

            while ( y < height ) {
                ret[ id ][ y ] = [];

                const lookupY = renderBox.y + y;

                if ( this.data.textures[ id ][ lookupY ] ) {
                    const width = (renderBox.width / this.data.tilesize);
                    let x = 0;

                    while ( x < width ) {
                        const lookupX = renderBox.x + x;

                        if ( this.data.textures[ id ][ lookupY ][ lookupX ] ) {
                            const celsCopy = Utils.copy( this.data.textures[ id ][ lookupY ][ lookupX ] );
                            const activeTile = this.getActiveTile( id, [lookupX, lookupY], celsCopy );

                            // Render the textures
                            ret[ id ][ y ][ x ] = celsCopy;

                            // Push any ActiveTiles to the cel stack
                            if ( activeTile ) {
                                ret[ id ][ y ][ x ].push( activeTile );
                            }

                        } else {
                            ret[ id ][ y ][ x ] = 0;
                        }

                        x++;
                    }
                }

                y++;
            }
        }

        return ret;
    }


    spliceActiveTile ( group, coords ) {
        const activeTiles = this.getActiveTiles( group );

        activeTiles.splice( coords );
    }


    getActiveTiles ( group ) {
        return this.activeTiles.find( ( activeTiles ) => (activeTiles.data.group === group) );
    }


    getActiveTile ( layer, celsCoords, celsCopy ) {
        // Either return a tile or don't if it's a static thing...
        for ( let i = this.data.tiles.length; i--; ) {
            const tiles = this.data.tiles[ i ];

            // Skip if not even the right layer to begin with...
            if ( layer !== tiles.layer ) {
                continue;
            }

            const topCel = celsCopy[ celsCopy.length - 1 ];

            if ( tiles.coords.length ) {
                for ( let j = tiles.coords.length; j--; ) {
                    const coord = tiles.coords[ j ];

                    // Correct tile coords
                    if ( coord[ 0 ] === celsCoords[ 0 ] && coord[ 1 ] === celsCoords[ 1 ] ) {
                        // (tiles.offsetX === topCel[ 0 ] && tiles.offsetY === topCel[ 1 ])
                        const isTileAnimated = tiles.stepsX;

                        // Make sure we don't dupe a tile match if it's NOT animated...
                        if ( isTileAnimated ) {
                            return this.getActiveTiles( tiles.group ).getTile();
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
                    return true;

                // An ActiveTiles coord can be spliced during interaction.
                // Example: Hero picks up an action tile and throws it.
                // The original tile cel still exists in the textures data,
                // but we can capture this condition and make sure we pop
                // if off and no longer render it to the texture map.
                } else if ( isTileSpliced ) {
                    celsCopy.pop();
                    return celsCopy;
                }
            }
        }
    }


    addNPC ( npc ) {
        this.npcs.push( npc );
    }


    addFX ( fx ) {
        this.fx.push( fx );
    }


    killObj ( type, obj ) {
        this[ type ].splice( this[ type ].indexOf( obj ), 1 );
        obj.destroy();
        obj = null;
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
                    return true;
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
                    collider.height
                );
                this.layers[ layer ].onCanvas.context.globalAlpha = 1.0;
            });
        }
    }
}



module.exports = {
    Map,
    MapLayer,
};
