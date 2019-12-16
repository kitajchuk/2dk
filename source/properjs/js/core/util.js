/**
 *
 * @public
 * @module util
 * @description Houses app-wide utility methods.
 *
 */
import $ from "properjs-hobo";
import ImageLoader from "properjs-imageloader";
import dom from "./dom";
import config from "./config";
import detect from "./detect";



const translate3d = function ( el, x, y, z ) {
    el.style[ detect.getPrefixed( "transform" ) ] = `translate3d( ${x}, ${y}, ${z} )`;
};



const rectsCollide = ( rect1, rect2 ) => {
    let ret = false;

    if ( rect1.x < rect2.x + rect2.width && rect1.x + rect1.width > rect2.x && rect1.y < rect2.y + rect2.height && rect1.height + rect1.y > rect2.y ) {
        // collision detected!
        ret = true;
    }

    return ret;
};



const isElementVisible = function ( el ) {
    const viewport = {
        x: 0,
        y: 0,
        width: window.innerWidth,
        height: window.innerHeight
    };


    return el ? rectsCollide( viewport, el.getBoundingClientRect() ) : false;
};



const getElementsInView = function ( nodes ) {
    const ret = $( [] );

    nodes.forEach(( node ) => {
        if ( isElementVisible( node ) ) {
            ret.push( node );
        }
    });

    return ret;
};
const getElementMostInView = function ( nodes ) {
    nodes = getElementsInView( nodes );

    let ret = $( [] );
    const offset = dom.header[ 0 ].getBoundingClientRect().height;

    nodes.forEach(( node, i ) => {
        const bounds = node.getBoundingClientRect();

        if ( bounds.y <= offset ) {
            ret = nodes.eq( i );
        }
    });

    return ret;
};



const loadImages = function ( images, handler ) {
    // Normalize the handler
    handler = (handler || isElementVisible);

    // Normalize the images
    images = (images || $( config.lazyImageSelector ));

    // Hook here to determine image variant sizes to load ?
    // images.forEach(( image, i ) => {
    //     const data = images.eq( i ).data();
    //
    //     // data-img-size="[width, height]"
    //     if ( data.imgSize ) {
    //         image.className += ` image--${data.imgSize[ 0 ] > data.imgSize[ 1 ] ? "wide" : "tall"}`;
    //     }
    // });

    return new ImageLoader({
        elements: images,
        property: config.lazyImageAttr,
        executor: handler
    });
};



const noop = function () {
    return true;
};



/******************************************************************************
 * Export
*******************************************************************************/
export {
    noop,
    loadImages,
    translate3d,
    rectsCollide,
    isElementVisible,
    getElementsInView,
    getElementMostInView
};
