const config = require( "../../clutch.config" );



module.exports = require( `../adapters/${config.api.adapter}` );
