const config = require( "../clutch.config" );
const router = require( "./core/router" );
const socket = require( "./core/socket" );
const path = require( "path" );
const fs = require( "fs" );



router.init();
socket.init();
