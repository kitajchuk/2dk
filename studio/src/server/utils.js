const fs = require( "fs" );



const isFile = ( file, cb ) => {
    let ret = null;

    if ( cb ) {
        fs.exists( file, ( exists ) => {
            cb( exists );
        });

    } else {
        ret = fs.existsSync( file );
    }

    return ret;
};



const readDir = ( dir, cb ) => {
    let ret = null;

    if ( cb ) {
        fs.readdir( dir, ( err, files ) => {
            if ( !err ) {
                const reals = [];

                for ( let i = files.length; i--; ) {
                    if ( !/^\./.test( files[ i ] ) ) {
                        reals.push( files[ i ] );
                    }
                }

                cb( reals );

            } else {
                cb( [] );
            }
        });

    } else {
        ret = fs.readdirSync( dir );
    }

    return ret;
};



const makeDir = ( dir, cb ) => {
    let ret = null;

    if ( cb ) {
        fs.mkdir( dir, ( err ) => {
            if ( !err ) {
                cb();
            }
        });

    } else {
        ret = fs.mkdirSync( dir );
    }

    return ret;
};



const readFile = ( file, cb ) => {
    let ret = null;

    if ( cb ) {
        fs.readFile( file, "utf8", ( err, data ) => {
            if ( !err ) {
                cb( String( data ) );
            }
        });

    } else {
        ret = String( fs.readFileSync( file ) );
    }

    return ret;
};



const readJson = ( file, cb ) => {
    let ret = null;

    if ( cb ) {
        readFile( file, ( data ) => {
            cb( JSON.parse( String( data ) ) );
        });

    } else {
        ret = JSON.parse( readFile( file ) );
    }

    return ret;
};



const writeFile = ( file, cont, cb ) => {
    if ( cb ) {
        fs.writeFile( file, cont, "utf8", ( err ) => {
            if ( !err ) {
                cb();
            }
        });

    } else {
        fs.writeFileSync( file, cont );
    }
};



const writeJson = ( file, json, cb ) => {
    writeFile( file, JSON.stringify( json, null, 4 ), cb );
};



const removeFile = ( file, cb ) => {
    if ( cb ) {
        fs.unlink( file, ( err ) => {
            if ( !err ) {
                cb();
            }
        });

    } else {
        fs.unlinkSync( file );
    }
};



const copyFile = ( file, dest, cb ) => {
    if ( cb ) {
        fs.copyFile( file, dest, ( err ) => {
            if ( !err ) {
                cb();
            }
        });

    } else {
        fs.copyFileSync( file, dest );
    }
};



const removeDir = ( dir, cb ) => {
    if ( cb ) {
        fs.rm( dir, { recursive: true, force: true }, ( err ) => {
            if ( !err ) {
                cb();
            }
        });

    } else {
        fs.rmSync( dir, { recursive: true, force: true } );
    }
};


module.exports = {
    isFile,
    readDir,
    makeDir,
    readJson,
    readFile,
    writeJson,
    writeFile,
    removeFile,
    removeDir,
    copyFile,
};
