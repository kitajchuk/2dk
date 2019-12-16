"use strict";



/**
 *
 * Sitemap generator for Prismic
 *
 * https://www.sitemaps.org/protocol.html
 *
 * Every generator must have a common `generate` method
 *
 * Different Headless CMS require slightly different approaches here.
 * Any means necessary is A-OK as long as the data resolves to the ORM format.
 *
 *
 */
const config = require( "../../clutch.config" );
const lager = require( "properjs-lager" );
const query = require( "../core/query" );
const xmlDoc = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
    @content
</urlset>`;
const xmlNode = `<url>
    <loc>@loc</loc>
    <changefreq>@changefreq</changefreq>
    <priority>@priority</priority>
    <lastmod>@lastmod</lastmod>
</url>`;



const getLastmod = ( timestamp ) => {
    const date = new Date( timestamp );
    const mm = date.getMonth() + 1; // getMonth() is zero-based
    const dd = date.getDate();

    return [
        date.getFullYear(),
        (mm > 9 ? "" : "0") + mm,
        (dd > 9 ? "" : "0") + dd

    ].join( "-" );
};
const createSitemap = () => {
    return new Promise(( resolve, reject ) => {
        query.getDocs().then(( docs ) => {
            const nodes = [];
            const pushNode = ( loc, timestamp ) => {
                nodes.push(
                    xmlNode
                        .replace( "@loc", loc )
                        .replace( "@changefreq", "daily" )
                        .replace( "@priority", "0.75" )
                        .replace( "@lastmod", getLastmod( timestamp || Date.now() ) )
                );
            };
            let homepage = docs.page.find(( doc ) => {
                return (doc.uid === config.homepage);
            });

            if ( !homepage ) {
                homepage = {
                    uid: config.homepage,
                    type: "page",
                    last_publication_date: Date.now()
                };

                docs.page.unshift( homepage );
            }

            // One-pager OR Static adapter
            if ( config.onepager || config.api.adapter === "static" ) {
                query.cache.navi.items.forEach(( navi ) => {
                    if ( config.generate.sitemap[ navi.uid ] !== false ) {
                        let loc = `${config.url}`;

                        if ( !config.generate.mappings[ navi.uid ] || config.generate.mappings[ navi.uid ] !== "/" ) {
                            loc = `${loc}${navi.slug}`;
                        }

                        pushNode( loc, homepage.last_publication_date );
                    }
                });

            // Standard
            } else {
                for ( let i in docs ) {
                    docs[ i ].forEach(( doc ) => {
                        if ( config.generate.sitemap[ doc.type ] !== false ) {
                            let loc = `${config.url}`;

                            // Clutch lets pages be special
                            // e.g /page/foobar => /foobar
                            if ( doc.type !== "page" ) {
                                loc = `${loc}/${config.generate.mappings[ doc.type ] || doc.type}`;
                            }

                            if ( doc.uid !== config.homepage ) {
                                loc = `${loc}/${doc.uid}/`;
                            }

                            pushNode( loc, doc.last_publication_date );
                        }
                    });
                }
            }

            const finalXML = xmlDoc.replace( "@content", nodes.join( "\n" ) );

            resolve( finalXML );
        });
    });
};



module.exports = {
    generate () {
        return new Promise(( resolve, reject ) => {
            createSitemap().then( resolve ).catch( reject );
        });
    }
};
