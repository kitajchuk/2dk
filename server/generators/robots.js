"use strict";



/**
 *
 * Robots.txt generator for Prismic
 *
 * http://www.robotstxt.org
 *
 * Every generator must have a common `generate` method
 *
 * Different Headless CMS require slightly different approaches here.
 * Any means necessary is A-OK as long as the data resolves to the ORM format.
 *
 *
 */
const path = require( "path" );
const config = require( "../../clutch.config" );
const lager = require( "properjs-lager" );
const botsText = `
# Clutch Robots Txt

User-agent: AdsBot-Google
Disallow: /api/
@content

User-agent: AdsBot-Google-Mobile
Disallow: /api/
@content

User-agent: AdsBot-Google-Mobile-Apps
Disallow: /api/
@content

User-agent: *
Disallow: /api/
@content

Sitemap: ${config.url}/sitemap.xml
`;



const createRobots = () => {
    return new Promise(( resolve, reject ) => {
        const rules = [];

        for ( let type in config.generate.robots ) {
            if ( config.generate.robots.hasOwnProperty( type ) ) {
                if ( config.generate.robots[ type ] === false ) {
                    rules.push( `Disallow: /${type}/` );
                }
            }
        }

        const finalTXT = botsText.replace( /\@content/g, rules.join( "\n" ) );

        resolve( finalTXT );
    });
};



module.exports = {
    generate () {
        return new Promise(( resolve, reject ) => {
            createRobots().then( resolve ).catch( reject );
        });
    }
};
