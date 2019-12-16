import $ from "properjs-hobo";


/**
 *
 * @public
 * @namespace dom
 * @memberof core
 * @description Holds high-level cached Nodes.
 *
 */
const dom = {
    doc: $( document ),
    html: $( document.documentElement ),
    body: $( document.body ),
    main: $( ".js-main" ),
    header: $( ".js-header" ),
    footer: $( ".js-footer" ),
    navi: $( ".js-navi" ),
    naviLinks: $( ".js-navi-a" ),
    naviMobile: $( ".js-navi-mobile" ),
    intro: $( ".js-intro" ),
    introLoading: $( ".js-intro-loading" )
};



/******************************************************************************
 * Export
*******************************************************************************/
export default dom;
