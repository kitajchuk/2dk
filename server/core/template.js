const fs = require( "fs" );
const lager = require( "properjs-lager" );
const config = require( "../../clutch.config" );
const consolidate = require( "consolidate" );
const cache = {};



/**
 *
 * Fresh look at the `template/pages dir`.
 *
 */
const getPages = () => {
    return new Promise(( resolve, reject ) => {
        fs.readdir( config.template.pagesDir, ( error, files ) => {
            if ( error ) {
                reject( error );

            } else {
                cache.pages = files;

                resolve( files );
            }
        });
    });
};



/**
 *
 * Template adapter setup.
 *
 */
consolidate.requires[ config.template.module ] = require( `${config.template.module}` );



module.exports = {
    render: consolidate[ config.template.module ],
    consolidate: consolidate,
    getPages,
    cache
};
