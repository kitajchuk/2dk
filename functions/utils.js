const isDev = (process.env.NETLIFY_DEV === 'true');
const utils = {
    headers ( method ) {
        return {
            "Access-Control-Allow-Headers": "Authorization, Content-Type",
            "Access-Control-Allow-Origin": isDev
                ? "http://localhost:8001"
                : "https://2dk.kitajchuk.com",
            "Access-Control-Allow-Methods": method,
        };
    }
};

module.exports = utils;