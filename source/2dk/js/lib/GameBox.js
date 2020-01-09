const Utils = require( "./Utils" );
const Config = require( "./Config" );
const Loader = require( "./Loader" );
const GameSFX = require( "./GameSFX" );
const Dialogue = require( "./Dialogue" );
const { Map } = require( "./Map" );
const { Hero, NPC } = require( "./Sprite" );



class GameBox {
    constructor ( player ) {
        this.loader = new Loader();
        this.player = player;
        this.step = Config.values.step;
        this.transform = {
            x: 0,
            y: 0
        };

        // Teardown stuff
        this.npcs = [];

        // Dialogue box
        this.dialogue = new Dialogue( this );

        // SFX
        this.gamesfx = new GameSFX( this );

        // Hero
        this.heroRef = this.player.data.hero;
        this.heroPick = this.player.data.heroes[ this.heroRef.sprite ];
        this.heroData = Utils.merge( this.heroPick, this.heroRef );
        this.hero = new Hero( this.heroData, this );

        // Map
        this.loader.loadJson( this.hero.data.spawn.map ).then(( data ) => {
            this.map = new Map( data, this );
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

            this.hero.load().then(() => {
                this.hero.init();
                this.map.load().then(() => {
                    this.build();
                    this.initMap();
                });
            });
        });
    }

    initMap () {
        this.transform = this.update( this.hero.offset );
        this.map.init( this.transform );
        this.gamesfx.addSound({
            id: this.map.data.id,
            src: this.map.data.sound,
            props: {
                loop: true,
            },
        });
        this.map.data.objects.forEach(( data ) => {
            const npcRef = data;
            const npcPick = this.player.data.objects.find(( obj ) => {
                return (obj.id === data.id);
            });
            const npcData = Utils.merge( npcPick, npcRef );
            const npc = new NPC( npcData, this );

            npc.load().then(() => {
                npc.init();
                this.npcs.push( npc );
            });
        });
    }


    payload ( payload ) {
        if ( payload.dialogue ) {
            this.dialogue.play( payload.dialogue ).then(() => {
                console.log( "dialogue resolved with A" );

            }).catch(() => {
                console.log( "dialogue rejected with B" );
            });
        }
    }


    teardown () {
        this.npcs.forEach(( npc ) => {
            npc.destroy();
            npc = null;
        });
        this.npcs = [];
    }


    build () {
        this.screen = document.createElement( "div" );
        this.screen.className = `_2dk__screen`;

        if ( this.player.data.game.fullscreen ) {
            this.screen.style.width = "100%";
            this.screen.style.height = "100%";

        } else {
            this.screen.style.width = `${this.player.width}px`;
            this.screen.style.height = `${this.player.height}px`;
        }

        this.screen.appendChild( this.map.element );
        this.screen.appendChild( this.dialogue.element );
        this.player.element.appendChild( this.screen );
    }


    pause ( paused ) {
        if ( paused ) {
            this.hero.face( this.hero.dir );
            this.gamesfx.stopSound( this.map.data.id );

        } else {
            this.gamesfx.playSound( this.map.data.id );
        }

        this.npcs.forEach(( npc ) => {
            npc.pause( paused );
        });
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


    pressD ( dir ) {}


    pressA () {}


    pressB () {}


    releaseD ( dir ) {}


    releaseA () {}


    longReleaseA () {}


    releaseB () {}


    longReleaseB () {}
}



module.exports = GameBox;
