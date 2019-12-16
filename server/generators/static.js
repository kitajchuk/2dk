"use strict";



/**
 *
 * Static site generator for Prismic
 *
 * Every generator must have a common `generate` method
 *
 * Different Headless CMS require slightly different approaches here.
 * Any means necessary is A-OK as long as the data resolves to the ORM format.
 *
 *
 */
const lager = require( "properjs-lager" );
const fs = require( "fs" );
const request = require( "request-promise" );
const xml2js = require( "xml2js" );
const htmlMin = require( "html-minifier" );
const files = require( "../core/files" );
const config = require( "../../clutch.config" );
const sitemap = require( `./sitemap` );
const robots = require( `./robots` );
const baseUrl = `http://localhost:${config.express.port}`;
const baseUrlBrowserSync = `http://localhost:${config.browser.port}`;
const saveLoc = config.template.staticDir;
let buildConfig = null;


// Save a rendered template file
const saveFile = ( obj ) => {
    return new Promise(( resolve, reject ) => {
        let regex = new RegExp( `^${buildConfig.url}\/{0,1}|\/$`, "g" );
        let place = saveLoc;
        let slug = obj.url.loc[ 0 ].replace( regex, "" );
        const uris = slug ? slug.split( "/" ) : [];
        const _saveFile = () => {
            files.writeStr( place, obj.html ).then(() => {
                lager.cache( `[Clutch] Linking static link ${place}` );

                resolve();

            }).catch( reject );
        };

        uris.forEach(( uri ) => {
            place = `${place}/${uri}`;

            if ( !fs.existsSync( place ) ) {
                fs.mkdirSync( place );

                lager.cache( `[Clutch] Linking static link ${place}` );
            }
        });

        place = `${place}/index.html`;
        regex = new RegExp( baseUrlBrowserSync, "gm" );

        obj.html = String( obj.html ).replace( regex, (buildConfig.env.sandbox ? "" : buildConfig.url) );
        obj.html = htmlMin.minify( obj.html, config.static.minify.html );

        if ( !obj.json.error ) {
            const placeJson = place.replace( /\.html$/, ".json" );

            files.write( placeJson, obj.json ).then(() => {
                lager.cache( `[Clutch] Linking static link ${placeJson}` );

                _saveFile();
            });

        } else {
            _saveFile();
        }
    });
};



// Clean, or DELETE, static HTML files
const cleanStatic = ( json ) => {
    return new Promise(( resolve, reject ) => {
        json.urlset.url.forEach(( url ) => {
            let regex = new RegExp( `^${buildConfig.url}\/{0,1}|\/$`, "g" );
            const slug = url.loc[ 0 ].replace( regex, "" );
            const slugHtml = slug ? `${slug}/index.html` : "index.html";
            const slugJson = slug ? `${slug}/index.json` : "index.json";
            const uris = slugHtml.split( "/" );
            const urisJson = slugJson.split( "/" );
            const files = {
                robots: `${saveLoc}/robots.txt`,
                sitemap: `${saveLoc}/sitemap.xml`
            };
            const unlinkF = () => {
                const link = `${saveLoc}/${uris.join( "/" )}`;
                const linkJson = `${saveLoc}/${urisJson.join( "/" )}`;

                if ( fs.existsSync( link ) ) {
                    regex = /\.html$/;

                    if ( regex.test( link ) ) {
                        fs.unlinkSync( link );

                        lager.error( `[Clutch] Un-Linking static link ${link}` );

                        if ( fs.existsSync( linkJson ) && (linkJson !== `${saveLoc}/`) ) {
                            fs.unlinkSync( linkJson );

                            lager.error( `[Clutch] Un-Linking static link ${linkJson}` );
                        }

                    } else {
                        // Make sure the `folder` is empty...
                        const files = fs.readdirSync( link );

                        if ( !files.length ) {
                            fs.rmdirSync( link );

                            lager.error( `[Clutch] Un-Linking static link ${link}` );
                        }
                    }

                    uris.pop();

                    if ( uris.length ) {
                        unlinkF();

                    } else {
                        resolve();
                    }
                }
            };

            if ( fs.existsSync( files.robots ) ) {
                fs.unlinkSync( files.robots );

                lager.error( `[Clutch] Un-Linking static link ${files.robots}` );
            }

            if ( fs.existsSync( files.sitemap ) ) {
                fs.unlinkSync( files.sitemap );

                lager.error( `[Clutch] Un-Linking static link ${files.sitemap}` );
            }

            unlinkF();
        });

        resolve();
    });
};



// Request a sitemap location
const requestLoc = ( url ) => {
    return new Promise(( resolve, reject ) => {
        request({
            url: url.loc[ 0 ].replace( buildConfig.url, baseUrl ),
            method: "GET"

        }).then(( html ) => {
            resolve( html );

        }).catch( reject );
    });
};



// Request a sitemap location for API
const requestApi = ( url ) => {
    return new Promise(( resolve, reject ) => {
        const api = url.loc[ 0 ].replace( buildConfig.url, baseUrl );

        request({
            url: api,
            method: "GET",
            qs: {
                format: "json"
            }

        }).then(( json ) => {
            resolve( json );

        }).catch(( error ) => {
            resolve({
                error: true
            });
        });
    });
};



// Process XML
const processXml = ( xml ) => {
    return new Promise(( resolve, reject ) => {
        xml2js.parseString( xml, ( error, result ) => {
            if ( error ) {
                reject( error );

            } else {
                resolve( result );
            }
        });
    });
};



// Query all documents
const createSite = ( options ) => {
    return new Promise(( resolve, reject ) => {
        sitemap.generate().then(( xml ) => {
            processXml( xml ).then(( xmlJson ) => {
                cleanStatic( xmlJson ).then(() => {
                    if ( options.create ) {
                        let saved = 0;

                        robots.generate().then(( txt ) => {
                            const fileRobots = `${saveLoc}/robots.txt`;
                            const fileSitemap = `${saveLoc}/sitemap.xml`;

                            // Robots.txt
                            files.writeStr( fileRobots, txt, true );
                            lager.cache( `[Clutch] Linking static link ${fileRobots}` );

                            // Sitemap.xml
                            files.writeStr( fileSitemap, xml.replace( baseUrl, buildConfig.url ), true );
                            lager.cache( `[Clutch] Linking static link ${fileSitemap}` );

                            xmlJson.urlset.url.forEach(( url ) => {
                                requestApi( url ).then(( apiJson ) => {
                                    requestLoc( url ).then(( html ) => {
                                        saveFile( {html, url, json: apiJson} ).then(() => {
                                            saved++;

                                            if ( saved === xmlJson.urlset.url.length ) {
                                                resolve();
                                            }

                                        }).catch( reject );

                                    }).catch( reject );

                                }).catch( reject );
                            });
                        });

                    } else {
                        resolve();
                    }

                }).catch( reject );

            }).catch( reject );
        });
    });
};



module.exports = {
    generate ( conf ) {
        buildConfig = conf;

        return new Promise(( resolve, reject ) => {
            createSite( {create: true} ).then( resolve ).catch(( error ) => {
                lager.error( error );
            });
        });
    },


    clean ( conf ) {
        buildConfig = conf;

        return new Promise(( resolve, reject ) => {
            createSite( {clean: true} ).then( resolve ).catch(( error ) => {
                lager.error( error );
            });
        });
    }
};
