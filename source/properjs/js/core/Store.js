import log from "./log";


// Singleton
let _instance = null;
let _initialized = false;

// Session Storage
let _cache = {};
const _access = "clutch-cache";
const _session = window.sessionStorage;


/**
 *
 * @public
 * @class Store
 * @param {object} options The Store settings
 * @classdesc Handles how data / content is cached and stored for webapp.
 *
 */
class Store {
    constructor ( options ) {
        if ( !_instance ) {
            _instance = this;

            this._opts = options;
            this._init();
        }

        return _instance;
    }


    /**
     *
     * @private
     * @instance
     * @method _init
     * @memberof Store
     * @description One time Store initialization
     *
     */
    _init () {
        if ( _initialized ) {
            return;
        }

        _initialized = true;

        this.flush();

        log( "Store::Initialized" );
    }


    /**
     *
     * @public
     * @instance
     * @method flush
     * @memberof Store
     * @description Manually flush the Local Storage cache
     *
     */
    flush () {
        // New empty cache
        _cache = {};

        // Store the new cache object
        this.save();
    }


    /**
     *
     * @public
     * @instance
     * @method save
     * @memberof Store
     * @description Perform the actual synchronous write to Local Storage
     *
     */
    save () {
        if ( !this._opts.enableStorage || !Store.isStorageSupported ) {
            log( "Store::Disabled" );
            return;
        }

        _session.setItem( _access, JSON.stringify( _cache ) );
    }


    /**
     *
     * @public
     * @instance
     * @method slug
     * @param {string} uri The string to slugify
     * @memberof Store
     * @description Slug a uri string
     * @returns {string}
     *
     */
    slug ( uri ) {
        uri = uri.replace( /^\/|\/$/g, "" ).replace( /\/|\?|&|=|\s/g, "-" ).toLowerCase();

        return uri;
    }


    /**
     *
     * @public
     * @instance
     * @method set
     * @param {string} id The index key
     * @param {mixed} val The value to store
     * @memberof Store
     * @description Set a key's value in the cache
     *
     */
    set ( id, val ) {
        id = this.slug( id );

        _cache[ id ] = val;

        this.save();
    }


    /**
     *
     * @public
     * @instance
     * @method get
     * @param {string} id The index key
     * @memberof Store
     * @description Get a key's value from the cache
     * @returns {mixed}
     *
     */
    get ( id ) {
        id = (id && this.slug( id ));

        return (id ? this.getValue( _cache[ id ] ) : _cache);
    }


    /**
     *
     * @public
     * @instance
     * @method getValue
     * @param {mixed} val The accessed value
     * @memberof Store
     * @description Get a value so cache is non-mutable from outside
     * @returns {mixed}
     *
     */
    getValue ( val ) {
        const ret = val;

        return ret;
    }


    /**
     *
     * @public
     * @instance
     * @method remove
     * @param {string} id The index key
     * @memberof Store
     * @description Remove a key/val pair from the cache
     *
     */
    remove ( id ) {
        delete _cache[ id ];
    }
}



/**
 *
 * @public
 * @static
 * @member isStorageSupported
 * @memberof Store
 * @description Boolean to test local/session storage support
 *
 */
Store.isStorageSupported = (function () {
    let ret = true;

    try {
        _session.setItem( "clutch-test", 1 );
        _session.removeItem( "clutch-test" );

    } catch ( err ) {
        ret = false;
    }

    return ret;
})();



/******************************************************************************
 * Export
*******************************************************************************/
export default Store;
