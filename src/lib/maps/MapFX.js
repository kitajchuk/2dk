import Utils from "../Utils";
import FX from "../sprites/FX";



export default class MapFX {
    constructor ( map ) {
        this.map = map;
        this.player = this.map.player;
    }


    smokeObject ( obj, fx = "smoke", props = {} ) {
        const origin = {
            x: obj.position.x + ( obj.width / 2 ) - ( this.map.data.tilesize / 2 ),
            y: obj.position.y + ( obj.height / 2 ) - ( this.map.data.tilesize / 2 ),
        };
        const data = this.player.getMergedData({
            id: fx,
            kill: true,
            spawn: origin,
            ...props,
        }, "fx" );

        this.map.addObject( "fx", new FX( data, this.map ) );
        this.map.addObject( "fx", new FX( Utils.merge( data, {
            spawn: {
                x: origin.x - ( this.map.data.tilesize / 4 ),
                y: origin.y - ( this.map.data.tilesize / 4 ),
            },
            vx: -8,
            vy: -8,

        }), this.map ) );
        this.map.addObject( "fx", new FX( Utils.merge( data, {
            spawn: {
                x: origin.x + ( this.map.data.tilesize / 4 ),
                y: origin.y - ( this.map.data.tilesize / 4 ),
            },
            vx: 8,
            vy: -8,

        }), this.map ) );
        this.map.addObject( "fx", new FX( Utils.merge( data, {
            spawn: {
                x: origin.x - ( this.map.data.tilesize / 4 ),
                y: origin.y + ( this.map.data.tilesize / 4 ),
            },
            vx: -8,
            vy: 8,

        }), this.map ) );
        this.map.addObject( "fx", new FX( Utils.merge( data, {
            spawn: {
                x: origin.x + ( this.map.data.tilesize / 4 ),
                y: origin.y + ( this.map.data.tilesize / 4 ),
            },
            vx: 8,
            vy: 8,

        }), this.map ) );
    }


    smokeObjectBase ( obj, fx = "smoke" ) {
        const data = this.player.getMergedData({
            id: fx,
            kill: true,
        }, "fx" );

        // Center
        this.map.addObject( "fx", new FX( Utils.merge( data, {
            spawn: {
                x: obj.position.x + ( obj.width / 2 ) - ( data.width / 2 ),
                y: obj.position.y + obj.height - (data.height / 2 ),
            },
            vy: -Utils.random( 0, obj.height / 2 ),
        }), this.map ) );

        // Left
        this.map.addObject( "fx", new FX( Utils.merge( data, {
            spawn: {
                x: obj.position.x - ( data.width / 2 ),
                y: obj.position.y + obj.height - (data.height / 2 ),
            },
            vx: -Utils.random( 0, 16 ),
            vy: -Utils.random( 0, obj.height / 2 ),
        }), this.map ) );

        // Right
        this.map.addObject( "fx", new FX( Utils.merge( data, {
            spawn: {
                x: obj.position.x + obj.width - ( data.width / 2 ),
                y: obj.position.y + obj.height - (data.height / 2 ),
            },
            vx: Utils.random( 0, 16 ),
            vy: -Utils.random( 0, obj.height / 2 ),
        }), this.map ) );

        // Add more FX if the door is wider than a tile
        if ( obj.width > this.map.data.tilesize ) {
            // Left center
            this.map.addObject( "fx", new FX( Utils.merge( data, {
                spawn: {
                    x: obj.position.x + ( obj.width / 4 ) - ( data.width / 2 ),
                    y: obj.position.y + obj.height - (data.height / 2 ),
                },
                vx: -Utils.random( 0, 16 ),
                vy: -Utils.random( 0, obj.height / 2 ),
            }), this.map ) );

            // Right center
            this.map.addObject( "fx", new FX( Utils.merge( data, {
                spawn: {
                    x: obj.position.x + obj.width - ( obj.width / 4 ) - ( data.width / 2 ),
                    y: obj.position.y + obj.height - (data.height / 2 ),
                },
                vx: Utils.random( 0, 16 ),
                vy: -Utils.random( 0, obj.height / 2 ),
            }), this.map ) );
        }
    }
}