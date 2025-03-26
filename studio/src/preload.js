process.once( "loaded", () => {
    // Setup global 2dk package for renderers
    global.studio = { Editor: require( "./client/js/Editor" ) };
});
