"use strict";



const config = require( "../../clutch.config" );
const prismicDOM = require( "prismic-dom" );



/**
 *
 * Template Context {object}.
 *
 */
class ContextObject {
    constructor ( page ) {
        this.site = null;
        this.navi = null;
        this.page = page;
        this.error = null;
        this.timestamp = config.timestamp;
        this.item = null;
        this.items = null;
        this.stylesheet = config.static.css;
        this.javascript = config.static.js;
        this.config = config;
        this.env = process.env.NODE_ENV;

        if ( config.api.adapter === "prismic" ) {
            this.dom = prismicDOM;
        }
    }

    set ( prop, value ) {
        if ( typeof prop === "object" ) {
            for ( let i in prop ) {
                this[ i ] = prop[ i ];
            }

        } else {
            this[ prop ] = value;
        }
    }

    get ( prop ) {
        return this[ prop ];
    }

    getTemplate () {
        return `pages/${this.page}.html`;
    }

    getPageTitle () {
        const site = this.get( "site" );
        const item = this.get( "item" );
        let title = null;
        let isRich = null;

        if ( config.onepager ) {
            title = site.data.title;

        } else if ( item ) {
            isRich = !(typeof item.data.title === "string");
            title = `${isRich ? prismicDOM.RichText.asText( item.data.title ) : item.data.title} — ${site.data.title}`;

        } else {
            title = site.data.title;
        }

        return title;
    }

    getPageDescription () {
        const site = this.get( "site" );
        const item = this.get( "item" );
        let desc = null;

        // Homepage
        if ( item && (item.uid === config.homepage) || !item ) {
            desc = site.data.description;
        }

        return desc;
    }

    getUrl ( doc ) {
        const query = require( "../core/query" );
        const type = config.generate.mappings[ doc.type ] || doc.type;
        const resolvedUrl = doc.uid === config.homepage ? "/" : ((type === "page") ? `/${doc.uid}/` : `/${type}/${doc.uid}/`);

        return resolvedUrl;
    }

    getMediaAspect ( media ) {
        return `${media.height / media.width * 100}%`;
    }
}



module.exports = ContextObject;
