const fs = require( "fs" );
const jwt = require( "jsonwebtoken" );
const path = require( "path" );
const crypto = require( "crypto" );
const sessDir = path.join( __dirname, "sessions" );

if ( !fs.existsSync( sessDir ) ) {
    fs.mkdirSync( sessDir );
}

const session = {
    genuid () {
        const uid = ("2dk" + String( Date.now() * Math.random() ).replace( /\D/g, "" ));
        return crypto
            .createHmac( "sha256", process.env.SESSION_SECRET )
            .update( uid )
            .digest( "hex" );
    },

    create () {
        return new Promise(( resolve, reject ) => {
            const sessId = session.genuid();
            const sessFile = path.join( sessDir, sessId );

            fs.writeFileSync( sessFile, sessId );

            jwt.sign( { sessId }, process.env.SESSION_SECRET, ( error, token ) => {
                if ( !error ) {
                    resolve( token );

                } else {
                    reject( error );
                }
            });
        });
    },

    verify ( token ) {
        return new Promise(( resolve, reject ) => {
            jwt.verify( token, process.env.SESSION_SECRET, ( error, decoded ) => {
                const sessFile = path.join( sessDir, decoded.sessId );

                if ( !error && fs.existsSync( sessFile ) ) {
                    resolve();

                } else {
                    reject( error );
                }
            });
        });
    }
};

module.exports = session;