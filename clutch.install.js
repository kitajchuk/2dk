const fs = require( "fs" );
const path = require( "path" );
const child_process = require( "child_process" );
const files = require( "./server/core/files" );
const root = __dirname;
const rootNodeModules = path.join( root, "node_modules" );
const rootClutch = path.join( root, ".clutch" );
const rootNotes = path.join( root, ".notes" );
const rootHobo = path.join( rootNodeModules, "properjs-hobo" );
// Leave this alone! You put your values in .clutch/config.json
// Netlify environment variables need to be set:
// PRISMIC_API_ACCESS
// PRISMIC_API_TOKEN
// PRISMIC_API_SECRET
const rootConfig = require( "./clutch.root" );



// Create sandbox
console.log( "[Clutch] Creating .clutch config..." );

if ( !fs.existsSync( rootClutch ) ) {
    child_process.execSync( `mkdir ${rootClutch}` );
    child_process.execSync( `touch ${path.join( rootClutch, "config.json" )}` );

    files.write( path.join( rootClutch, "config.json" ), rootConfig, true );
}



// Done!
console.log( "[Clutch] Install complete!" );
