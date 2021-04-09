const path = require( "path" );
const express = require( "express" );
const expressApp = express();
const http = require( "http" );
const httpPort = 8000;
let httpServer = null;



expressApp.use(express.static(path.join( process.cwd(), "public" ), {
    maxAge: 86400000,
}));



module.exports = {
    init () {
        httpServer = http.createServer( expressApp );
        httpServer.listen( httpPort );
        console.log( "Express server initialized" );
    }
};
