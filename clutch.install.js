const fs = require( "fs" );
const path = require( "path" );
const child_process = require( "child_process" );
const files = require( "./server/core/files" );
const root = __dirname;
const rootNodeModules = path.join( root, "node_modules" );
const rootClutch = path.join( root, ".clutch" );
const rootNotes = path.join( root, ".notes" );
const rootHobo = path.join( rootNodeModules, "properjs-hobo" );
const rootStudio = path.join( root, "studio" );
// Leave this alone! You put your values in .clutch/config.json
// Netlify environment variables need to be set:
// PRISMIC_API_ACCESS
// PRISMIC_API_TOKEN
// PRISMIC_API_SECRET
const rootConfig = require( "./clutch.root" );



// Fresh `node_modules`
console.log( "[Clutch] Installing node_modules..." );

child_process.execSync( "npm i" );



// 6.0 server install
console.log( "[Clutch] Installing studio node_modules..." );

child_process.execSync( `cd ${rootStudio} && npm i` );



// Create sandbox
console.log( "[Clutch] Creating .clutch directory..." );

if ( !fs.existsSync( rootClutch ) ) {
    child_process.execSync( `mkdir ${rootClutch}` );
    child_process.execSync( `touch ${path.join( rootClutch, "config.json" )}` );

    files.write( path.join( rootClutch, "config.json" ), rootConfig, true );
}



// Create notes
console.log( "[Clutch] Creating .notes file for dev..." );

if ( !fs.existsSync( rootNotes ) ) {
    child_process.execSync( `touch ${rootNotes}` );
}



// 6.0 done
console.log( "[Clutch] Install complete!" );
