import Utils from "../Utils";
import Config from "../Config";
import Sprite from "./Sprite";
import { TweenLite, Power2 } from "gsap";



/*******************************************************************************
* Companion NPC
* Have different behaviors for being "anchored" to a Hero
*******************************************************************************/
class Companion extends Sprite {
    constructor ( data, hero ) {
        super( data, hero.map );
        this.layer = "heroground";
        this.hero = hero;
        this.watchFPS = 24;
        this.watchFrame = 0;
        this.checkFrame = 0;
        this.watchDur = 1000;
    }


    visible () {
        return true;
    }


    destroy () {
        if ( this.tween ) {
            this.tween.kill();
            this.tween = null;
        }
    }


/*******************************************************************************
* Rendering
* Order is: blit, update, render
*******************************************************************************/
    blit ( elapsed ) {
        if ( !this.visible() ) {
            return;
        }

        if ( typeof this.previousElapsed === "undefined" ) {
            this.previousElapsed = elapsed;
        }

        if ( typeof this.watchElapsed === "undefined" ) {
            this.watchElapsed = elapsed;
        }

        // Companion type?
        if ( this.data.type === Config.npc.WALK ) {
            this.blitWalk();

        } else if ( this.data.type === Config.npc.FLOAT ) {
            this.blitFloat();
        }

        // Set watch cycle frame
        this.watchDiff = (elapsed - this.watchElapsed);
        this.checkFrame = Math.floor( (this.watchDiff / this.watchDur) * this.watchFPS );

        if ( this.watchDiff >= this.watchDur ) {
            this.watchElapsed = elapsed;
            this.watchFrame = 0;
            this.checkFrame = 0;
        }

        this.applyFrame( elapsed );
    }


    blitFloat () {
        this.position.z = -(this.map.data.tilesize * 2);

        if ( (this.hero.position.x + (this.hero.width / 2)) > (this.position.x + (this.width / 2)) ) {
            this.dir = "right";

        } else {
            this.dir = "left";
        }
    }


    blitWalk () {
        // Hero is NOT idle, so moving
        // Hero IS idle but companion is within a threshold distance...
        if ( (!this.hero.idle.x || !this.hero.idle.y) || (this.hero.idle.x && this.hero.idle.y && this.distance > (this.map.data.tilesize / 2)) ) {
            // Bounce condition is TRUE
            // Position Z is zero, so bounce a bit...
            if ( this.data.bounce && this.position.z === 0 ) {
                this.physics.vz = -8;
            }
        }

        if ( (this.hero.position.x + (this.hero.width / 2)) > (this.position.x + (this.width / 2)) ) {
            this.dir = "right";

        } else {
            this.dir = "left";
        }
    }


/*******************************************************************************
* Applications
*******************************************************************************/
    applyPosition () {
        if ( this.data.type === Config.npc.WALK ) {
            this.applyWalkPosition();

        } else if ( this.data.type === Config.npc.FLOAT ) {
            this.applyFloatPosition();
        }
    }


    applyFloatPosition () {
        const poi = {};
        const heroCenter = {
            x: this.hero.position.x + (this.hero.width / 2),
            y: this.hero.position.y + (this.hero.height / 2),
        };
        const selfCenter = {
            x: this.position.x + (this.width / 2),
            y: this.position.y + (this.height / 2),
        };

        if ( this.hero.dir === "right" && heroCenter.x > selfCenter.x ) {
            poi.x = heroCenter.x - this.width;
            poi.y = heroCenter.y;

        } else if ( this.hero.dir === "left" && heroCenter.x < selfCenter.x ) {
            poi.x = heroCenter.x;
            poi.y = heroCenter.y;

        } else if ( this.hero.dir === "up" && heroCenter.y < selfCenter.y ) {
            poi.x = heroCenter.x - (this.width / 2);
            poi.y = heroCenter.y + this.height;

        } else if ( this.hero.dir === "down" && heroCenter.y > selfCenter.y ) {
            poi.x = heroCenter.x - (this.width / 2);
            poi.y = heroCenter.y;
        }

        if ( !this.origin ) {
            this.origin = this.position;
            // console.log( `Companion spawn origin ${this.data.id} (${this.position.x}, ${this.position.y})` );
        }

        if ( (poi.x && poi.y) && (this.checkFrame !== this.watchFrame) ) {
            this.watchFrame = this.checkFrame;

            if ( this.tween ) {
                this.tween.kill();
            }

            const angle = Utils.getAngle( this.position, poi );
            const distance = Utils.getDistance( this.position, poi );
            const origin = {
                x: this.position.x,
                y: this.position.y,
            };
            const props = { dist: 0 };
            const duration = (!this.hero.idle.x && !this.hero.idle.y) ? 2.0 : 1.5;

            if ( distance > 1 ) {
                this.idle.x = false;
                this.idle.y = false;
                this.tween = TweenLite.to( props, duration, {
                    dist: distance,
                    ease: Power2.easeOut,
                    onUpdate: () => {
                        const dist = distance - (distance - props.dist);
                        const pos = Utils.translate( origin, angle, dist );

                        this.position.x = pos.x;
                        this.position.y = pos.y;
                    },
                    onComplete: () => {
                        this.tween = null;
                    }
                });

            } else {
                this.idle.x = true;
                this.idle.y = true;
            }
        }
    }


    applyWalkPosition () {
        const poi = {};

        if ( this.hero.dir === "right" && this.hero.position.x > this.position.x ) {
            poi.x = this.hero.position.x - (this.width / 2);
            poi.y = this.hero.footbox.y - (this.height - this.hero.footbox.height);

        } else if ( this.hero.dir === "left" && this.hero.position.x < this.position.x ) {
            poi.x = this.hero.position.x + this.hero.width - (this.width / 2);
            poi.y = this.hero.footbox.y - (this.height - this.hero.footbox.height);

        } else if ( this.hero.dir === "up" && this.hero.position.y < this.position.y ) {
            poi.x = this.hero.position.x + (this.hero.width / 2) - (this.width / 2);
            poi.y = this.hero.position.y + this.hero.height - (this.height / 2);

        } else if ( this.hero.dir === "down" && this.hero.position.y > this.position.y ) {
            poi.x = this.hero.position.x + (this.hero.width / 2) - (this.width / 2);
            poi.y = this.hero.position.y - (this.height / 2);
        }

        if ( !this.origin ) {
            this.origin = this.position;
            // console.log( `Spawn Origin ${this.data.id} (${this.position.x}, ${this.position.y})`, this );
        }

        if ( (poi.x && poi.y) && (this.checkFrame !== this.watchFrame) && (this.hero.verb !== Config.verbs.GRAB) ) {
            this.watchFrame = this.checkFrame;

            if ( this.tween ) {
                this.tween.kill();
            }

            const angle = Utils.getAngle( this.position, poi );
            const distance = Utils.getDistance( this.position, poi );
            const origin = {
                x: this.position.x,
                y: this.position.y,
            };
            const props = { dist: 0 };
            const duration = (!this.hero.idle.x && !this.hero.idle.y) ? 2.0 : 1.5;

            this.distance = distance;

            // Simple NPCs can operate with just FACE data
            // Checking for WALK data to shift sprite cycles while moving...
            if ( distance >= (this.map.data.tilesize / 4) && this.data.verbs[ Config.verbs.WALK ] ) {
                this.verb = Config.verbs.WALK;

            } else {
                this.verb = Config.verbs.FACE;
            }

            if ( distance >= 1 ) {
                this.idle.x = false;
                this.idle.y = false;

                this.tween = TweenLite.to( props, duration, {
                    dist: distance,
                    ease: Power2.easeOut,
                    onUpdate: () => {
                        const dist = distance - (distance - props.dist);
                        const pos = Utils.translate( origin, angle, dist );

                        this.position.x = pos.x;
                        this.position.y = pos.y;
                    },
                    onComplete: () => {
                        this.tween = null;
                    }
                });

            } else {
                this.idle.x = true;
                this.idle.y = true;
            }
        }
    }
}



export default Companion;
