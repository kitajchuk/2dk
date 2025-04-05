// Store
const cache = {};



class Cache {
    static slugify ( str ) {
        return str.toString().toLowerCase().trim()
            // Replace & with "and"
            .replace( /&/g, "-and-" )

            // Replace spaces, non-word characters and dashes with a single dash (-)
            .replace( /[\s\W-]+/g, "-" )

            // Replace leading trailing slashes with an empty string - nothing
            .replace( /^[-]+|[-]+$/g, "" );
    }

    constructor () {
        this.key = Symbol();
        this.clear();
    }

    set ( key, val ) {
        cache[ this.key ][ Cache.slugify( key ) ] = val;
    }

    get ( key ) {
        return ( key ? cache[ this.key ][ Cache.slugify( key ) ] : cache[ this.key ] );
    }

    remove ( key ) {
        delete cache[ this.key ][ Cache.slugify( key ) ];
    }

    clear () {
        cache[ this.key ] = {};
    }
}



// Expose
module.exports = Cache;
