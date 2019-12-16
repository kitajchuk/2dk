import dom from "./dom";


let homepage = "home";


if ( dom.naviLinks.length ) {
    homepage = dom.naviLinks.first().data().uid;
}



/**
 *
 * @public
 * @namespace config
 * @memberof core
 * @description Stores app-wide config values.
 *
 */
const config = {
    homepage,
    defaultDuration: 500,
    lazyImageSelector: ".js-lazy-image",
    mobileImageSelector: ".js-lazy-image[data-mobile]",
    lazyImageAttr: "data-img-src",
    imageLoaderAttr: "data-imageloader"
};



/******************************************************************************
 * Export
*******************************************************************************/
export default config;
