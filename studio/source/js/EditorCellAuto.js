const CellAuto = require( "../../../source/2dk/js/lib/vendor/CellAuto" );
const Utils = require( "./Utils" );
const raf = window.requestAnimationFrame;
const caf = window.cancelAnimationFrame;



class EditorCellAuto {
    constructor () {
        this.map = null;
        this.rafId = null;
        this.world = null;
        this.tiles = [];
        this.textures = [];
        this.callback = null;
    }


    register ( map ) {
        this.map = Utils.copyObj( map );
        this.tiles = [];
        this.textures = this.map.textures.background; // For now we're just testing background renders...
        this.world = new CellAuto.World({
            width: this.map.tilewidth,
            height: this.map.tileheight,
            cellSize: this.map.tilesize,
        });
        this.registerType( "ground", 1 );
        this.registerType( "flower", 2 );
        this.registerType( "bush", 3 );
        this.world.initialize([
            {
                name: "ground",
                distribution: 96
            },
            {
                name: "flower",
                distribution: 2
            },
            {
                name: "bush",
                distribution: 2
            }
        ]);
    }


    step ( cb ) {
        if ( typeof cb === "function" ) {
            this.callback = cb;
        }
    }


    call ( data ) {
        if ( typeof this.callback === "function" ) {
            this.callback( data );
        }
    }


    generate () {
        return new Promise(( resolve ) => {
            const tiles = [];
            const cycle = () => {
                this.rafId = raf( cycle );

                this.world.step();

                for ( let y = 0; y < this.world.height; y++ ) {
                    for ( let x = 0; x < this.world.width; x++ ) {
                        const cell = this.world.grid[ y ][ x ];
                        const value = cell.getValue();

                        // Hardcoded dummy textures for now...
                        const textures = [
                            [[1 * this.world.cellSize, 9 * this.world.cellSize], [0 * this.world.cellSize, 8 * this.world.cellSize]], // 0: collision
                            [[1 * this.world.cellSize, 11 * this.world.cellSize]],
                            [[8 * this.world.cellSize, 34 * this.world.cellSize]],
                            [[0 * this.world.cellSize, 34 * this.world.cellSize]],
                        ];

                        // Texture layer mapping...
                        this.textures[ y ][ x ] = textures[ value ];

                        tiles.push( value );
                    }
                }

                // When the old bytes matches the new bytes the mapping is done
                if ( this.tiles.join( "" ) === tiles.join( "" ) ) {
                    caf( this.rafId );
                    this.rafId = null;
                    resolve( Utils.copyObj( this.textures ) );

                } else {
                    this.tiles = tiles;
                    this.call( Utils.copyObj( this.textures ) );
                }
            };

            this.rafId = raf( cycle );
        });
    }


    registerType ( type, value ) {
        this.world.registerCellType( type, {
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
            }

        }, function () {
            this.alive = Math.random() > 0.5;
            this.simulated = 0;
        });
    }
}



module.exports = EditorCellAuto;