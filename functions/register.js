// Docs on event and context https://www.netlify.com/docs/functions/#the-handler-method
// process.env.NETLIFY_DEV = 'true'
// process.env.SESSION_SECRET
exports.handler = async ( event, context ) => {
    /*
    event {
        "path": "Path parameter",
        "httpMethod": "Incoming request’s method name"
        "headers": {Incoming request headers}
        "queryStringParameters": {query string parameters }
        "body": "A JSON string of the request payload."
        "isBase64Encoded": "A boolean flag to indicate if the applicable request payload is Base64-encode"
    }
    */

    const utils = require( "./utils" );
    const session = require( "./session" );

    return new Promise(( resolve, reject ) => {
        const body = JSON.parse( event.body );

        /*
        body {
            "token": "String JWT",
            "player": "2dk Player data",
        }
        */
        // console.log( "register", body );

        session.verify( body.token )
            .then(() => {
                resolve({
                    statusCode: 200,
                    headers: utils.headers( "POST" ),
                    body: JSON.stringify( {} ),
                });

            }).catch(( error ) => {
                reject( error );
            });
    });
};
