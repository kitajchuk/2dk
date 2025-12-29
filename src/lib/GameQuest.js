class GameQuest {
    constructor ( gamebox ) {
        this.gamebox = gamebox;
        this.quests = {
            // [key string]: [value number]
        };
        this.completed = {
            // [key string]: [value boolean]
        };
    }


    hitQuest ( quest, value ) {
        if ( this.completed[ quest ] ) {
            return;
        }

        if ( !this.quests[ quest ] ) {
            this.quests[ quest ] = 0;
        }

        this.quests[ quest ] += value;
    }


    completeQuest ( quest ) {
        this.completed[ quest ] = true;
        
        if ( this.quests[ quest ] ) {
            delete this.quests[ quest ];
        }
    }


    getQuest ( quest ) {
        if ( !this.quests[ quest ] ) {
            return 0;
        }

        return this.quests[ quest ];
    }


    getCompleted ( quest ) {
        return this.completed[ quest ] ?? false;
    }


    checkQuest ( quest, value ) {
        if ( !this.quests[ quest ] ) {
            return 0;
        }

        return this.quests[ quest ] >= value;
    }
}



export default GameQuest;