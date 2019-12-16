const config = require( "./clutch.config" );
const router = require( "./server/core/router" );
const stasis = require( `./server/generators/static` );
const lager = require( "properjs-lager" );
const clean = Number( process.env.CLUTCH_CLEAN );

router.init().then(() => {
    if ( clean ) {
        stasis.clean( config ).then(() => {
            lager.cache( "[Clutch] Static files have been cleaned." );
            process.exit( 0 );
        });

    } else {
        stasis.generate( config ).then(() => {
            lager.cache( "[Clutch] Static files have been created." );
            process.exit( 0 );
        });
    }
});
