const Config = require( "./Config" );
const Loader = require( "./Loader" );
const Dialogue = require( "./Dialogue" );
const { Map } = require( "./Map" );



class GameBox {
    constructor ( player ) {
        this.player = player;
        this.step = 1;
        this.offset = {
            x: 0,
            y: 0,
        };
        this.camera = {
            x: 0,
            y: 0,
            width: this.player.width,
            height: this.player.height,
            resolution: this.player.data.game.resolution,
        };

        // Map
        this.map = new Map( Loader.cash( this.player.data.hero.spawn.map ), this.player.data.hero, this );

        // NPCs
        this.npcs = [];

        // Dialogues
        this.dialogue = new Dialogue();

        this.build();
        this.initMap();
    }


    build () {
        this.player.screen.appendChild( this.map.element );
        this.player.screen.appendChild( this.dialogue.element );
    }


    pause ( paused ) {
        if ( paused ) {
            this.map.hero.face( this.map.hero.dir );
            this.player.gameaudio.stopSound( this.map.data.id );

        } else {
            this.player.gameaudio.playSound( this.map.data.id );
        }
    }


    initMap () {
        this.update( this.map.hero.position );
        this.map.hero.applyOffset();
        this.player.gameaudio.addSound({
            id: this.map.data.id,
            src: this.map.data.sound,
            channel: "bgm",
        });
    }


/*******************************************************************************
* Rendering
Can all be handled in plugin GameBox
*******************************************************************************/
    blit () {}
    update () {}


/*******************************************************************************
* Helper methods
*******************************************************************************/
    getCollision ( poi, sprite ) {
        return {
            evt: this.map.checkEvt( poi, sprite ),
            map: this.map.checkMap( poi, sprite ),
            box: this.map.checkBox( poi, sprite ),
            obj: this.map.checkObj( poi, sprite ),
            tiles: this.map.checkTiles( poi, sprite ),
        };
    }


/*******************************************************************************
* GamePad Inputs
* Can all be handled in plugin GameBox
*******************************************************************************/
    pressD () {}
    releaseD () {}
    pressA () {}
    holdA () {}
    releaseA () {}
    releaseHoldA () {}
    pressB () {}
    holdB () {}
    releaseB () {}
    releaseHoldB () {}
}



module.exports = GameBox;
