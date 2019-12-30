const fs = require( "fs" );
const fse = require( "fs-extra" );


const isFile = function ( file, cb ) {
    let ret = null;

    if ( cb ) {
        fs.exists( file, function ( exists ) {
            cb( exists );
        });

    } else {
        ret = fs.existsSync( file );
    }

    return ret;
};

const readDir = function ( dir, cb ) {
    let ret = null;

    if ( cb ) {
        fs.readdir( dir, function ( err, files ) {
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

const makeDir = function ( dir, cb ) {
    let ret = null;

    if ( cb ) {
        fs.mkdir( dir, function ( err ) {
            if ( !err ) {
                cb();
            }
        });

    } else {
        ret = fs.mkdirSync( dir );
    }

    return ret;
};

const readFile = function ( file, cb ) {
    let ret = null;

    if ( cb ) {
        fs.readFile( file, "utf8", function ( err, data ) {
            if ( !err ) {
                cb( data );
            }
        });

    } else {
        ret = String( fs.readFileSync( file ) );
    }

    return ret;
};

const readJson = function ( file, cb ) {
    let ret = null;

    if ( cb ) {
        readFile( file, function ( data ) {
            cb( JSON.parse( String( data ) ) );
        });

    } else {
        ret = JSON.parse( readFile( file ) );
    }

    return ret;
};

const writeFile = function ( file, cont, cb ) {
    if ( cb ) {
        fs.writeFile( file, cont, "utf8", function ( err ) {
            if ( !err ) {
                cb();
            }
        });

    } else {
        fs.writeFileSync( file, cont );
    }
};

const writeJson = function ( file, json, cb ) {
    writeFile( file, JSON.stringify( json, null, 4 ), cb );
};

const removeFile = function ( file, cb ) {
    if ( cb ) {
        fs.unlink( file, function ( err ) {
            if ( !err ) {
                cb();
            }
        });

    } else {
        fs.unlinkSync( file );
    }
};

const removeDir = function ( dir, cb ) {
    if ( cb ) {
        fse.remove( dir, function ( err ) {
            if ( !err ) {
                cb();
            }
        });

    } else {
        fse.removeSync( dir );
    }
};

const copyObj = function ( obj ) {
    return JSON.parse( JSON.stringify( obj ) );
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
    copyObj
};
