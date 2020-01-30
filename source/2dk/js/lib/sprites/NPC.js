const Utils = require( "../Utils" );
const Sprite = require( "./Sprite" );



/*******************************************************************************
* NPC Sprite
* Shifting states...
* AI logics?
*******************************************************************************/
class NPC extends Sprite {
    constructor ( data, map ) {
        super( data, map );
        this.states = Utils.copy( this.data.states );
        this.dialogue = null;
        this.shift();
    }


    shift () {
        if ( this.states.length ) {
            this.state = this.states.shift();
            this.dir = this.state.dir;
            this.verb = this.state.verb;
        }
    }


    payload () {
        if ( this.data.payload.dialogue && !this.dialogue ) {
            this.dialogue = this.gamebox.dialogue.play( this.data.payload.dialogue );
            this.dialogue.then(() => {
                this.handleDialogue();

            }).catch(() => {
                this.handleDialogue();
            });
        }
    }


    handleDialogue () {
        console.log( "Dialogue complete" );
        this.dialogue = null;
        this.dir = this.state.dir;
        this.verb = this.state.verb;
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

        if ( this.state.action.verb && this.data.verbs[ this.state.action.verb ] ) {
            this.verb = this.state.action.verb;
            this.dir = (this.state.action.dir || this.state.dir);
        }

        if ( this.state.action.shift ) {
            this.shift();
        }
    }
}



module.exports = NPC;
