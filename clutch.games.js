const config = require( "./clutch.config" );
const lager = require( "properjs-lager" );
const path = require( "path" );
const files = require( "./server/core/files" );
const gamesPath = path.join( __dirname, "studio", "games.json" );
const dataPath = path.join( __dirname, "static", "api", "data.json" );



files.read( gamesPath ).then(( gamesJson ) => {
    files.read( dataPath ).then(( dataJson ) => {
        dataJson.results.find(( doc ) => {
            return (doc.uid === config.homepage);

        }).games = gamesJson;

        files.write( dataPath, dataJson ).then(() => {
            lager.cache( "Save games JSON" );
        });
    });
});
