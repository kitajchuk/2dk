class GameQuest {
    constructor ( gamebox ) {
        this.gamebox = gamebox;
        this.quests = {
            // [key string]: [value number]
        };
    }


    hitQuest ( quest, value ) {
        if ( !this.quests[ quest ] ) {
            this.quests[ quest ] = 0;
        }

        this.quests[ quest ] += value;

        console.log( this.quests );
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