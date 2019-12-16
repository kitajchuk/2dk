import * as core from "../core";



/**
 *
 * @public
 * @namespace intro
 * @description Performs the branded load-in screen sequence.
 *
 */
const intro = {
    init () {},


    teardown () {
        core.log( "Intro::Teardown" );

        core.dom.intro.removeClass( "is-active is-loading" );

        setTimeout(() => {
            core.dom.html.removeClass( "is-site-intro" );

        }, core.config.defaultDuration );

        setTimeout(() => {
            core.dom.intro.remove();

        }, core.config.defaultDuration * 2 );
    }
};


/******************************************************************************
 * Export
*******************************************************************************/
export default intro;
