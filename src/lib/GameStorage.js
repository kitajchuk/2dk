export default class GameStorage {
    static storageKey = "_2dk_game_storage";


    // Hero properties that are direct Sprite properties
    // Handled separately: map, quests etc...
    static heroProps = [
        "dir",
        "items",
        "position",
        "currency",
        "equipped",
        "status",
        "stats",
        "maxHealth",
        "health",
        "statusEffects",
        "enemiesKilled",
        "totalDeaths",
    ];


    constructor ( player ) {
        this.player = player;
        this.storage = {};
        this.mount();
    }


    mount () {
        const storage = localStorage.getItem( GameStorage.storageKey );

        if ( storage ) {
            this.storage = JSON.parse( storage );
        }
    }


    get ( key ) {
        return this.storage[ key ];
    }   


    set ( key, value ) {
        this.storage[ key ] = value;
    }


    save () {
        localStorage.setItem(
            GameStorage.storageKey,
            JSON.stringify( this.storage )
        );
    }


    reset () {
        this.storage = {};
        this.save();
    }


    persist ( gamebox ) {
        this.set( "map", `maps/${gamebox.map.data.id}.json` );
        this.set( "quests", gamebox.gamequest.completed );
        // TODO: companion...

        for ( const prop of GameStorage.heroProps ) {
            this.set( prop, gamebox.hero[ prop ] );
        }

        this.save();
    }
}