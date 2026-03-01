import NPC from "./NPC";
import Config from "../Config";
import Sprite from "./Sprite";
import Spring from "../Spring";



/*******************************************************************************
* Pushed Tile
* Since we already made NPCs pushable the easiest way to handle pushable
* ActiveTiles is to just turn them into pushable NPCs on the fly...
* This also works nicely with how collision is handled in the TopView plugin
* since we can spawn the NPC on the frame the checks for the tile are handled
* and then the NPC collision takes precedence over the tile collision and when
* the NPC is pushed the tile is spliced from the map and the NPC remains.
*
* Admittedly I don't totally love this and it would be cleaner to have a more
* narrow class here since a pushed tile doesn't need ANY of the other robust
* NPC functionality...but like I said it ends up working quite nicely...
*******************************************************************************/
export class PushedTile extends NPC {
    constructor ( tile, map ) {
        const action = tile.instance.canInteract( Config.verbs.PUSH );
        const mapId = tile.instance.getQuestId( tile.coord );
        const data = {
            id: tile.instance.data.group,
            name: tile.instance.data.group,
            image: map.data.image,
            spawn: {
                x: tile.tilebox.x,
                y: tile.tilebox.y,
            },
            width: tile.tilebox.width,
            height: tile.tilebox.height,
            hitbox: {
                x: 0,
                y: 0,
                width: tile.tilebox.width,
                height: tile.tilebox.height,
            },
            verbs: {
                face: {
                    down: {
                        offsetX: tile.instance.data.offsetX,
                        offsetY: tile.instance.data.offsetY,
                    },
                },
            },
            action: {
                verb: Config.verbs.PUSH,
                sound: action?.sound ?? "",
            },
            states: [
                {
                    verb: Config.verbs.FACE,
                    dir: "down",
                },
            ],
        };
        super( data, map, mapId );
    }
}



/*******************************************************************************
* Lifted Tile
* There can be only one at a time
*******************************************************************************/
export class LiftedTile extends Sprite {
    constructor ( spawn, activeTiles, map, hero ) {
        const tile = activeTiles.getTile();
        const data = {
            width: map.data.tilesize,
            height: map.data.tilesize,
            image: map.data.image,
            spawn,
            hitbox: {
                x: 0,
                y: 0,
                width: map.data.tilesize,
                height: map.data.tilesize,
            },
            verbs: {
                face: {
                    down: {
                        offsetX: tile[ 0 ],
                        offsetY: tile[ 1 ],
                    },
                },
            },
        };
        super( data, map );
        this.hero = hero;
        this.onscreen = true;
        this.activeTiles = activeTiles;
    }


    destroy () {
        const attackAction = this.activeTiles.canAttack();

        if ( attackAction?.drops ) {
            this.gamebox.itemDrop( attackAction.drops, this.position, {
                layer: this.layer,
            });
        }

        if ( attackAction?.sound ) {
            // Don't use hero sound channel for lifted tile sounds
            this.player.gameaudio.hitSound( attackAction.sound );
        }
        
        this.map.mapFX.smokeObject( this, attackAction?.fx, {
            layer: this.layer,
        });
        this.gamebox.interact.tile = null;

        // Kills THIS sprite
        this.hero.liftedTile = null;
        
        if ( this.spring ) {
            this.spring.destroy();
        }
    }


    blit ( elapsed ) {
        if ( !this.spring ) {
            return;
        }

        if ( this.spring.isResting ) {
            this.destroy();
            return;
        }

        const { collision, isMapCollision } = this.gamebox.checkElevationCollision( this.position, this, {
            npc: this.gamebox.checkNPC( this.position, this ),
            enemy: this.gamebox.checkEnemy( this.position, this ),
            camera: this.gamebox.checkCamera( this.position, this ),
        });

        if ( isMapCollision || collision.npc || collision.enemy || collision.camera ) {
            if ( collision.enemy && !collision.enemy.isHitOrStill() ) {
                collision.enemy.hit( this.hero.getStat( "power" ) );
            }

            this.destroy();
            return;

        }
        
        this.spring.blit( elapsed );
    }


    applyPosition () {
        if ( !this.throwing ) {
            this.gamebox.checkElevationCollision( this.position, this );
            this.position = {
                x: this.hero.position.x + ( this.hero.width / 2 ) - ( this.width / 2 ),
                y: this.hero.hitbox.y - this.height,
                z: 0,
            };
            return;
        }

        this.position = this.getNextPoi();
    }


    throw () {
        this.hero.face( this.hero.dir );
        this.player.gameaudio.heroSound( Config.verbs.THROW );
        this.hero.physics.maxv = this.hero.physics.controlmaxv;
        this.throwing = true;

        let throwX;
        let throwY;
        const dist = this.map.data.tilesize * 2;

        switch ( this.hero.dir ) {
            case "left":
                throwX = this.position.x - dist - this.width;
                throwY = this.hero.footbox.y - ( this.height - this.hero.footbox.height );
                break;
            case "right":
                throwX = this.position.x + dist + this.width;
                throwY = this.hero.footbox.y - ( this.height - this.hero.footbox.height );
                break;
            case "up":
                throwX = this.position.x;
                throwY = this.position.y - dist - this.height;
                break;
            case "down":
                throwX = this.position.x;
                throwY = this.hero.footbox.y + dist;
                break;
        }

        this.spring = new Spring( 
            this.player,
            this.position.x,
            this.position.y,
            60,
            3.5
        );
        this.spring.poi = {
            x: throwX,
            y: throwY,
        };
        this.spring.bind( this );
    }
}