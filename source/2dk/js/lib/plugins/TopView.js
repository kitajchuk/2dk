const Utils = require( "../Utils" );
const Config = require( "../Config" );
const Loader = require( "../Loader" );
const GameBox = require( "../GameBox" );
const { Map } = require( "../Map" );
const Tween = require( "properjs-tween" );
const Easing = require( "properjs-easing" );



class TopView extends GameBox {
    constructor ( player ) {
        super( player );

        // Map switch
        this.map_ = null;
        this.cam_ = null;

        // Interactions
        this.interact = {
            // tile: {
            //     group,
            //     coord,
            //     throw?,
            // }
            tile: null,
            push: 0,
        };
        this.debounce = 1024;
        this.locked = false;
    }


/*******************************************************************************
* Rendering
* Order is: blit, update, render
*******************************************************************************/
    blit ( elapsed ) {
        // blit map
        // blits hero & companion...
        this.map.blit( elapsed );

        // blit map_?
        if ( this.map_ ) {
            // blits hero_
            this.map_.blit( elapsed );
        }

        // update hero
        this.map.hero.update();

        // update gamebox (camera)
        this.update();

        // update map
        this.map.update();

        // render map
        // renders hero
        // currently all canvas rendering happens here...
        this.map.render( this.camera );

        // render map_?
        if ( this.map_ ) {
            // renders hero_
            this.map_.render( this.cam_ );
        }
    }


    update ( pos ) {
        const x = ( this.map.hero.position.x - ((this.camera.width / 2) - (this.map.hero.width / 2)) );
        const y = ( this.map.hero.position.y - ((this.camera.height / 2) - (this.map.hero.height / 2)) );
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

        this.offset = offset;
        this.camera.x = Math.abs( offset.x );
        this.camera.y = Math.abs( offset.y );
    }


/*******************************************************************************
* GamePad Inputs
*******************************************************************************/
    pressD ( dir ) {
        const poi = this.map.hero.getNextPoiByDir( dir );

        this.handleCollision( poi, dir );
    }


    releaseD () {
        if ( this.locked ) {
            return;
        }

        if ( this.interact.push ) {
            this.interact.push = 0;
        }

        if ( this.interact.tile ) {
            this.map.hero.cycle( this.map.hero.verb, this.map.hero.dir );

        } else {
            this.map.hero.face( this.map.hero.dir );
        }
    }


    pressA () {
        const poi = this.map.hero.getNextPoiByDir( this.map.hero.dir, 1 );
        const collision = this.getCollision( poi, this.map.hero );

        if ( collision.obj ) {
            this.handleObjAct( poi, this.map.hero.dir, collision.obj );
        }

        if ( collision.tiles ) {
            if ( collision.tiles.action.length && collision.tiles.action[ 0 ].act && !this.interact.tile ) {
                this.handleTileAct( poi, this.map.hero.dir, collision.tiles.action[ 0 ] );
            }
        }
    }


    holdA () {
        console.log( "A Hold" );
    }


    releaseA () {
        this.dialogue.check( true, false );

        this.handleReleaseA();
    }


    releaseHoldA () {
        this.handleReleaseA();
    }


    handleReleaseA () {
        if ( this.map.hero.verb === Config.verbs.GRAB ) {
            this.map.hero.face( this.map.hero.dir );
        }

        if ( this.map.hero.verb === Config.verbs.LIFT ) {
            if ( this.interact.tile.throw ) {
                this.handleThrow();

            } else {
                this.interact.tile.throw = true;
            }

        } else {
            this.interact.tile = null;
        }
    }


    pressB () {
        const poi = this.map.hero.getNextPoiByDir( this.map.hero.dir, 1 );
        const collision = this.getCollision( poi, this.map.hero );

        if ( collision.tiles ) {
            if ( collision.tiles.attack.length ) {
                collision.tiles.attack.forEach(( tile ) => {
                    if ( tile.hit ) {
                        this.handleTileHit( poi, this.map.hero.dir, tile );
                    }
                });
            }
        }
    }


    holdB () {
        console.log( "B Hold" );
    }


    releaseB () {
        this.dialogue.check( false, true );
    }


    releaseHoldB () {
        console.log( "B Hold Release" );
    }


/*******************************************************************************
* Handlers...
*******************************************************************************/
    handleCollision ( poi, dir ) {
        const collision = this.getCollision( poi, this.map.hero );

        if ( this.locked ) {
            return;
        }

        if ( collision.evt ) {
            if ( collision.evt.type === Config.events.BOUNDARY && collision.box ) {
                this.handleEvtBoundary( poi, dir, collision.evt );
                return;
            }
        }

        if ( collision.obj ) {
            this.handleObj( poi, dir );
            return;
        }

        if ( collision.map ) {
            // Tile will allow leaping from it's edge, like a ledge...
            if ( collision.tiles && collision.tiles.action.length && collision.tiles.action[ 0 ].jump && (collision.tiles.action[ 0 ].collides.width > (collision.tiles.action[ 0 ].tilebox.width / 2) || collision.tiles.action[ 0 ].collides.height > (collision.tiles.action[ 0 ].tilebox.height / 2)) ) {
                this.handleTileJump(  poi, dir, collision.tiles.action[ 0 ] );

            } else {
                this.handleMap( poi, dir );
                return;
            }
        }

        if ( collision.box ) {
            this.handleBox( poi, dir );
            return;
        }

        if ( this.map.hero.verb === Config.verbs.GRAB ) {
            if ( dir === Config.opposites[ this.map.hero.dir ] ) {
                this.handleLift( poi, dir );
            }

            return;
        }

        if ( collision.tiles ) {
            this.handleTiles(  poi, dir, collision.tiles );

            // Tile is behaves like a WALL, or Object you cannot walk on
            if ( collision.tiles.action.length && collision.tiles.action[ 0 ].stop ) {
                this.handleTileStop( poi, dir, collision.tiles.action[ 0 ] );
                return;
            }

        } else if ( this.map.hero.physics.maxacc !== this.map.hero.physics.controlmaxacc && this.map.hero.verb !== Config.verbs.LIFT ) {
            this.map.hero.physics.maxacc = this.map.hero.physics.controlmaxacc;
        }

        // Apply position
        this.map.hero.applyPosition( poi, dir );

        // Applly offset
        this.map.hero.applyOffset();

        // Apply the sprite animation cycle
        this.map.hero.applyCycle();
    }


    handlePushable ( poi, dir ) {
        this.interact.push++;

        if ( (this.map.hero.verb !== Config.verbs.LIFT) && (this.interact.push > this.map.data.tilesize) ) {
            this.map.hero.cycle( Config.verbs.PUSH, dir );

        } else {
            this.map.hero.cycle( this.map.hero.verb, dir );
        }
    }


    handleMap ( poi, dir ) {
        this.handlePushable( poi, dir );
    }


    handleObj ( poi, dir ) {
        this.handlePushable( poi, dir );
    }


    handleTileStop (  poi, dir, tile ) {
        this.handlePushable( poi, dir );
    }


    handleBox ( poi, dir ) {
        this.map.hero.cycle( this.map.hero.verb, dir );
    }


    handleEvtBoundary (  poi, dir, evt ) {
        this.switchMap( evt );
    }


    handleLift ( poi, dir ) {
        this.locked = true;
        this.map.hero.cycle( Config.verbs.PULL, dir );
        setTimeout(() => {
            const activeTiles = this.map.getActiveTiles( this.interact.tile.group );
            const tileCel = activeTiles.getTile();

            this.player.gameaudio.hitSound( "pickup" );
            this.map.spliceActiveTile( this.interact.tile.group, this.interact.tile.coord );
            this.interact.tile.companion = this.map.hero.addCompanion({
                companion: "activetile",
                float: true,
                width: this.map.gridsize,
                height: this.map.gridsize,
                spawn: {
                    x: 0,
                    y: 0,
                    z: -(this.map.hero.height - (this.map.gridsize * 0.75)),
                    dir: "down",
                },
                image: this.map.data.image,
                hitbox: {
                    x: 0,
                    y: 0,
                    width: this.map.gridsize,
                    height: this.map.gridsize,
                },
                verbs: {
                    face: {
                        down: {
                            offsetX: tileCel[ 0 ],
                            offsetY: tileCel[ 1 ],
                        }
                    }
                },
            });
            this.map.hero.cycle( Config.verbs.LIFT, this.map.hero.dir );
            this.map.hero.physics.maxacc = this.map.hero.physics.controlmaxacc / 2;
            this.locked = false;

        }, Config.values.debounceDur );
    }


    handleThrow () {
        this.map.hero.face( this.map.hero.dir );
        this.player.gameaudio.hitSound( "throw" );
        this.map.hero.physics.maxacc = this.map.hero.physics.controlmaxacc;
        this.map.hero.throwCompanion( this.interact.tile.companion ).then(() => {
            this.player.gameaudio.hitSound( "smash" );
            this.interact.tile = null;
        });
    }


    handleTiles ( poi, dir, tiles ) {
        tiles.passive.forEach(( tile ) => {
            // Stairs are hard, you have to take it slow...
            if ( tile.group === Config.tiles.STAIRS ) {
                this.map.hero.physics.maxacc = this.map.hero.physics.controlmaxacc / 2;

            // Grass is thick, it will slow you down a bit...
            } else if ( tile.group === Config.tiles.GRASS ) {
                this.map.hero.physics.maxacc = this.map.hero.physics.controlmaxacc / 1.5;
            }
        });
    }


    handleObjAct ( poi, dir, obj ) {
        if ( obj.canInteract( dir ) ) {
            obj.doInteract( dir );
        }
    }


    handleTileJump ( poi, dir, tile ) {
        if ( dir === tile.tile.data.action.require.dir ) {
            this.locked = true;

            console.log( tile );

            const vertical = (dir === "up" || dir === "down");
            const collider = {
                x: vertical ? tile.tilebox.x : (dir === "left" ? (tile.tilebox.x - (tile.tilebox.width * 1)) : (tile.tilebox.x + (tile.tilebox.width * 1))),
                y: vertical ? (dir === "up" ? (tile.tilebox.y - (tile.tilebox.height * 2)) : (tile.tilebox.y + (tile.tilebox.height * 2))) : tile.tilebox.y,
                width: tile.tilebox.width,
                height: tile.tilebox.height,
            };

            this.map.setCollider( collider );

            // Render shadow to the new landing position
            // Animate hero to the new landing position
            // Unlock the game...
        }
    }


    handleTileAct ( poi, dir, tile ) {
        const activeTiles = this.map.getActiveTiles( tile.group );

        if ( tile.tile.canInteract() ) {
            this.interact.tile = tile;

            if ( tile.tile.data.action.verb === Config.verbs.LIFT ) {
                this.map.hero.cycle( Config.verbs.GRAB, this.map.hero.dir );
            }
        }
    }


    handleTileHit ( poi, dir, tile ) {
        if ( tile.tile.canAttack() ) {
            tile.tile.attack( tile.coord );
        }
    }


/*******************************************************************************
* Map Switching
*******************************************************************************/
    switchTween ( obj, css ) {
        return new Promise(( resolve ) => {
            const _update = ( t ) => {
                if ( obj.position ) {
                    obj.position.x = (css.axis === "x" ? t : obj.position.x);
                    obj.position.y = (css.axis === "y" ? t : obj.position.y);
                    obj.applyOffset();
                }

                // Only a Map has a Hero
                if ( obj.hero ) {
                    const transform = Utils.getTransform( obj.element );

                    obj.element.style.webkitTransform = `translate3d(
                        ${css.axis === "x" ? t : transform.x}px,
                        ${css.axis === "y" ? t : transform.y}px,
                        0
                    )`;
                }
            };

            return new Tween({
                ease: Easing.swing,
                duration: Config.values.boundaryAnimDur,
                from: css.from,
                to: css.to,
                update: ( t ) => {
                    _update( t );
                },
                complete: ( t ) => {
                    _update( t );
                    resolve();
                }
            });
        });
    }


    switchMap ( evt ) {
        // Pause the Player so no game buttons dispatch
        // Pausing triggers the GameBox to call this.map.hero.face( this.map.hero.dir )
        this.player.pause();

        // Dupe the Hero
        const mapData = Loader.cash( evt.map );
        const heroData = Utils.copy( this.map.hero.data );

        // Create new Map / Camera
        this.map_ = new Map( mapData, heroData, this );
        this.cam_ = Utils.copy( this.camera );

        // Update this.map_.hero
        this.map_.hero.face( this.map.hero.dir );
        this.map_.hero.idle = this.map.hero.idle;

        // Will be the animation values for rendering...
        const _css = {
            map: null,
            map_: null,
            hero: null,
            hero_: null,
        };

        // Stage new Map / new Hero for animation
        if ( this.map.hero.dir === "down" ) {
            // Presets
            this.cam_.y = 0;
            this.map_.offset = {
                x: this.map.offset.x,
                y: 0,
            };
            this.map_.element.style.webkitTransform = `translate3d(
                0,
                ${this.camera.height}px,
                0
            )`;
            this.map_.hero.position = {
                x: this.map.hero.position.x,
                y: -this.map_.hero.height,
                z: 0,
            };

            // Animation values
            _css.map_ = {
                axis: "y",
                from: this.camera.height,
                to: 0,
            };
            _css.map = {
                axis: "y",
                from: 0,
                to: -this.camera.height,
            };
            _css.hero_ = {
                axis: "y",
                from: -this.map_.hero.height,
                to: 0,
            };
            _css.hero = {
                axis: "y",
                from: this.map.hero.position.y,
                to: this.map.hero.position.y + this.map.hero.height,
            };

        } else if ( this.map.hero.dir === "up" ) {
            // Presets
            this.cam_.y = this.map_.height - this.camera.height;
            this.map_.offset = {
                x: this.map.offset.x,
                y: -(this.map_.height - this.camera.height),
            };
            this.map_.element.style.webkitTransform = `translate3d(
                0,
                ${-this.camera.height}px,
                0
            )`;
            this.map_.hero.position = {
                x: this.map.hero.position.x,
                y: this.map_.height,
                z: 0,
            };

            // Animation values
            _css.map_ = {
                axis: "y",
                from: -this.camera.height,
                to: 0,
            };
            _css.map = {
                axis: "y",
                from: 0,
                to: this.camera.height,
            };
            _css.hero_ = {
                axis: "y",
                from: this.map_.height,
                to: this.map_.height - this.map_.hero.height,
            };
            _css.hero = {
                axis: "y",
                from: this.map.hero.position.y,
                to: this.map.hero.position.y - this.map.hero.height,
            };

        } else if ( this.map.hero.dir === "right" ) {
            // Presets
            this.cam_.x = 0;
            this.map_.offset = {
                x: 0,
                y: this.map.offset.y,
            };
            this.map_.element.style.webkitTransform = `translate3d(
                ${this.camera.width}px,
                0,
                0
            )`;
            this.map_.hero.position = {
                x: -this.map_.hero.width,
                y: this.map.hero.position.y,
                z: 0,
            };

            // Animation values
            _css.map_ = {
                axis: "x",
                from: this.camera.width,
                to: 0,
            };
            _css.map = {
                axis: "x",
                from: 0,
                to: -this.camera.width,
            };
            _css.hero_ = {
                axis: "x",
                from: -this.map_.hero.width,
                to: 0,
            };
            _css.hero = {
                axis: "x",
                from: this.map.hero.position.x,
                to: this.map.hero.position.x + this.map.hero.width,
            };

        } else if ( this.map.hero.dir === "left" ) {
            // Presets
            this.cam_.x = this.map_.width - this.camera.width;
            this.map_.offset = {
                x: -(this.map_.width - this.camera.width),
                y: this.map.offset.y,
            };
            this.map_.element.style.webkitTransform = `translate3d(
                ${-this.camera.width}px,
                0,
                0
            )`;
            this.map_.hero.position = {
                x: this.map_.width,
                y: this.map.hero.position.y,
                z: 0,
            };

            // Animation values
            _css.map_ = {
                axis: "x",
                from: -this.camera.width,
                to: 0,
            };
            _css.map = {
                axis: "x",
                from: 0,
                to: this.camera.width,
            };
            _css.hero_ = {
                axis: "x",
                from: this.map_.width,
                to: this.map_.width - this.map_.hero.width,
            };
            _css.hero = {
                axis: "x",
                from: this.map.hero.position.x,
                to: this.map.hero.position.x - this.map.hero.width,
            };
        }

        // Inject the new Map element into the DOM
        this.player.screen.appendChild( this.map_.element );

        // Animate Maps and Hero and resolve all tweens for clean-up
        Promise.all([
            // New Map, New Hero
            this.switchTween( this.map_, _css.map_ ),
            this.switchTween( this.map_.hero, _css.hero_ ),

            // Old Map, Old Hero
            this.switchTween( this.map, _css.map ),
            this.switchTween( this.map.hero, _css.hero ),

        ]).then(() => {
            setTimeout(() => {
                // Set new Hero with props (backfill relevant attributes)

                // Destroy old Map / Set new Map
                this.map.destroy();
                this.map = this.map_;
                this.map_ = null;
                this.cam_ = null;

                // Initialize
                this.initMap();

                // Resume game blit cycle...
                this.player.resume();

            }, Config.values.debounceDur );
        });
    }
}



module.exports = TopView;
