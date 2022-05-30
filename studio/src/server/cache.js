// Store
const cache = {};


/**
 *
 * @public
 * @global
 * @class Cache
 * @classdesc Client side caching mechanism.
 * @author kitajchuk
 * @singleton
 *
 */
class Cache {
    /**
     *
     * @global
     * @static
     * @method slugify
     * @description Clean and slug-format a cache value's key.
     * @param {string} str The key to format
     * @memberof Cache
     * @author kitajchuk
     * @returns {string}
     *
     */
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

    /**
     *
     * @public
     * @instance
     * @method set
     * @description Set a value for a key in the cache.
     * @param {string} key The key to set for
     * @param {mixed} val The value to be stored
     * @memberof Cache
     * @author kitajchuk
     *
     */
    set ( key, val ) {
        cache[ this.key ][ Cache.slugify( key ) ] = val;
    }

    /**
     *
     * @public
     * @instance
     * @method get
     * @description Get a value for a key from the cache.
     * @param {string} key The key to retrieve for
     * @returns {mixed}
     * @memberof Cache
     * @author kitajchuk
     *
     */
    get ( key ) {
        return ( key ? cache[ this.key ][ Cache.slugify( key ) ] : cache[ this.key ] );
    }

    /**
     *
     * @public
     * @instance
     * @method remove
     * @description Permanently delete a key->value pair from the cache store.
     * @param {string} key The key to delete for
     * @memberof Cache
     * @author kitajchuk
     *
     */
    remove ( key ) {
        delete cache[ this.key ][ Cache.slugify( key ) ];
    }

    /**
     *
     * @public
     * @instance
     * @method clear
     * @description Permanently reset the cache store to an empty index.
     * @memberof Cache
     * @author kitajchuk
     *
     */
    clear () {
        cache[ this.key ] = {};
    }
}



// Expose
module.exports = Cache;
