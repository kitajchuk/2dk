const path = require( "path" );
const chokidar = require( "chokidar" );
const lager = require( "properjs-lager" );


module.exports = {
    init ( mainWindow ) {
        const styles = path.join( __dirname, "../../public/css" );
        const watcher = chokidar.watch( styles );
        
        watcher.on( "change", ( path ) => {
            lager.info( `CSS file ${path} has been updated` );
            mainWindow.webContents.send( "watch-reloadcss", null );
        });

        return this;
    },
};