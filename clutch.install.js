const fs = require( "fs" );
const path = require( "path" );
const child_process = require( "child_process" );
const files = require( "./server/core/files" );
const root = __dirname;
const rootNodeModules = path.join( root, "node_modules" );
const rootPackageLock = path.join( root, "package-lock.json" );
const rootClutch = path.join( root, ".clutch" );
const rootNotes = path.join( root, ".notes" );
const rootHobo = path.join( rootNodeModules, "properjs-hobo" );
// Leave this alone! You put your values in .clutch/config.json
// Netlify environment variables need to be set:
// PRISMIC_API_ACCESS
// PRISMIC_API_TOKEN
// PRISMIC_API_SECRET
const rootConfig = require( "./clutch.root" );



// Fresh `node_modules`
console.log( "[Clutch] Installing node_modules..." );

child_process.execSync( "npm i" );



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


// Hobo.js build
console.log( "[Clutch] Building properjs-hobo..." );

child_process.execSync( `npm run bootstrap:hobo` );


// 6.0 done
console.log( "[Clutch] Install complete!" );
