import Controller from "../Controller";
import CellAuto from "../vendor/CellAuto";
import Utils from "../Utils";



/*******************************************************************************
* CellAutoMap
* A map that uses cellular automata generation.
*******************************************************************************/
class CellAutoMap {
    constructor () {
        this.controller = new Controller();
        
        // Reset for each call to initialize...
        this.map = null;
        this.world = null;
        this.tiles = null;
        this.textures = [];
    }


    destroy () {
        this.controller.stop();
    }


    initialize ( map ) {
        const { algo, textures: textureStack } = map.cellauto;

        this.map = structuredClone( map );
        this.algo = algo;
        this.textureStack = textureStack;
        this.tiles = null;
        this.walls = this.map.cellauto.walls;
        this.textures = this.map.textures.background;
        this.world = new CellAuto.World({
            width: this.map.tilewidth,
            height: this.map.tileheight,
            cellSize: this.map.tilesize,
        });
        
        this.textureStack.forEach( ( { name }, index ) => {
            this.register( name, index + 1 );
        } );

        this.world.initialize(
            this.textureStack.map( ( { name, distribution } ) => {
                return {
                    name,
                    distribution,
                };
            } )
        );

        return this;
    }


    register ( type, value ) {
        const factory = CellAutoAlgos[ this.algo ];
        const { options, init } = factory( value );
        this.world.registerCellType( type, options, init );
    }


    generate ( callback ) {
        return new Promise( ( resolve ) => {
            this.controller.go(() => {
                const tiles = [];

                this.world.step();

                for ( let y = 0; y < this.world.height; y++ ) {
                    for ( let x = 0; x < this.world.width; x++ ) {
                        const cell = this.world.grid[ y ][ x ];
                        const value = cell.getValue();

                        this.textures[ y ][ x ] = value === 0 ? this.walls.texture : this.textureStack[ value - 1 ].texture;

                        tiles.push( value );
                    }
                }

                if ( this.tiles ) {
                    // When the old bytes matches the new bytes the mapping is done
                    if ( this.tiles.join( "" ) === tiles.join( "" ) ) {
                        this.controller.stop();
                        resolve(
                            {
                                spawn: this.spawn(),
                                textures: structuredClone( this.textures ),
                            }
                        );
                    }
                }

                this.tiles = tiles;
                callback({ textures: structuredClone( this.textures ) });
            });
        });
    }


    spawn () {
        let spawn = null;

        for ( let y = 0; y < this.world.height; y++ ) {
            if ( spawn ) {
                break;
            }

            for ( let x = 0; x < this.world.width; x++ ) {
                const cell = this.world.grid[ y ][ x ];
                const value = cell.getValue();

                if ( spawn === null && value > 0 && x > 0 && y > 0 && x < this.world.width - 1 && y < this.world.height - 1 ) {
                    const surrounding = Utils.getSurroundingTileCoords( [ x, y ] );
                    const values = Object.keys( surrounding ).map( ( key ) => {
                        const tile = surrounding[ key ];
                        const tileCell = this.world.grid[ tile.y ][ tile.x ];
                        return tileCell.getValue();
                    });

                    const canSpawn = values.every( ( value ) => {
                        return value > 0;
                    });

                    if ( canSpawn ) {
                        spawn = { x: ( x * this.map.tilesize ), y: ( y * this.map.tilesize ), dir: "down" };
                        break;
                    }
                }
            }
        }

        return spawn;
    }
}



// For `getValue` a `0` represents a wall, anything else is a traversable cell...
export const CellAutoAlgos = {
    maze: function ( value ) {
        return {
            options: {
                getValue: function () {
                    return this.alive ? 0 : value;
                },
    
                process: function ( neighbors ) {
                    const surrounding = this.countSurroundingCellsWithValue( neighbors, "wasAlive" );
    
                    if ( this.simulated < 20 ) {
                        this.alive = surrounding === 1 || surrounding === 2 && this.alive;
                    }
    
                    if ( this.simulated > 20 && surrounding === 2 ) {
                        this.alive = true;
                    }
    
                    this.simulated += 1;
                },
    
                reset: function () {
                    this.wasAlive = this.alive;
                },
            },
    
            init: function () {
                this.alive = Math.random() > 0.5;
                this.simulated = 0;
            },
        };
    },
    caves: function ( value ) {
        return {
            options: {
                getValue: function () {
                    return this.open ? value : 0;
                },
    
                process: function ( neighbors ) {
                    const surrounding = this.countSurroundingCellsWithValue( neighbors, "wasOpen" );
                    this.open = (this.wasOpen && surrounding >= 4) || surrounding >= 6;
                },
    
                reset: function () {
                    this.wasOpen = this.open;
                },
    
            },
    
            init: function () {
                this.alive = Math.random() > 0.5;
                this.simulated = 0;
            },
        };
    },
};


export default CellAutoMap;
