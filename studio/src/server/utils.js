const fs = require( "fs" );
const fsp = require( "fs" ).promises;



/******************************************************************************
 * ASYNC (Promise)
*******************************************************************************/
const readDir = async ( dir ) => {
    const files = await fsp.readdir( dir );
    return files.filter( ( file ) => !/^\./.test( file ) );
};

const readJson = async ( file ) => {
    const data = await fsp.readFile( file, "utf8" );
    return JSON.parse( String( data ) );
};



/******************************************************************************
 * SYNC / CALLBACK
*******************************************************************************/
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
