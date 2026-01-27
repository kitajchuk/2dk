class GameQuest {
    constructor ( gamebox ) {
        this.gamebox = gamebox;
        this.quests = {
            // [key string]: [value number]
        };
        this.reset = [
            // [key string]
        ];
        this.completed = {
            // [key string]: [value boolean]
        };
    }


    completeQuest ( quest ) {
        this.completed[ quest ] = true;
        this.removeQuest( quest );
    }


    getCompleted ( quest ) {
        return this.completed[ quest ] ?? false;
    }


    hitQuest ( quest, value, reset ) {
        if ( this.completed[ quest ] ) {
            return;
        }

        if ( !this.quests[ quest ] ) {
            this.quests[ quest ] = 0;
        }

        if ( reset && !this.reset.includes( quest ) ) {
            this.reset.push( quest );
        }

        this.quests[ quest ] += value;
    }


    removeQuest ( quest ) {
        if ( this.quests[ quest ] ) {
            delete this.quests[ quest ];
        }

        if ( this.reset.includes( quest ) ) {
            this.reset.splice( this.reset.indexOf( quest ), 1 );
        }
    }


    // Call when a map changes
    resetQuests () {
        for ( let i = this.reset.length; i--; ) {
            this.removeQuest( this.reset[ i ] );
        }

        this.reset = [];
    }


    getQuest ( quest ) {
        if ( !this.quests[ quest ] ) {
            return 0;
        }

        return this.quests[ quest ];
    }


    checkQuest ( quest, value ) {
        if ( !this.quests[ quest ] ) {
            return 0;
        }

        return this.quests[ quest ] >= value;
    }
}



export default GameQuest;