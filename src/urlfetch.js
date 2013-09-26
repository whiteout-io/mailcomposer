if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function(require) {
    'use strict';

    var shims = require("node-shims"),
        http = (typeof module === 'undefined' && !module.exports) ? shims.http : require("http"),
        https = (typeof module === 'undefined' && !module.exports) ? shims.https : require("https"),
        urllib = (typeof module === 'undefined' && !module.exports) ? shims.url : require("url"),
        Stream = (typeof module === 'undefined' && !module.exports) ? shims.Stream : require('stream').Stream;

    /**
     * <p>Open a stream to a specified URL</p>
     *
     * @memberOf urlfetch
     * @param {String} url URL to open
     * @param {Object} [options] Optional options object
     * @param {String} [options.userAgent="mailcomposer"] User Agent for the request
     * @return {Stream} Stream for the URL contents
     */

    function openUrlStream(url, options) {
        options = options || {};
        var urlparts = urllib.parse(url),
            urloptions = {
                host: urlparts.hostname,
                port: urlparts.port || (urlparts.protocol == "https:" ? 443 : 80),
                path: urlparts.path || urlparts.pathname,
                method: "GET",
                headers: {
                    "User-Agent": options.userAgent || "mailcomposer"
                },
                agent: false
            },
            client = (urlparts.protocol == "https:" ? https : http),
            stream = new Stream(),
            request;

        stream.resume = function() {};

        if (urlparts.auth) {
            urloptions.auth = urlparts.auth;
        }

        request = client.request(urloptions, function(response) {
            if ((response.statusCode || 0).toString().charAt(0) != "2") {
                stream.emit("error", "Invalid status code " + (response.statusCode || 0));
                return;
            }

            response.on('error', function(err) {
                stream.emit("error", err);
            });

            response.on('data', function(chunk) {
                stream.emit("data", chunk);
            });

            response.on('end', function(chunk) {
                if (chunk) {
                    stream.emit("data", chunk);
                }
                stream.emit("end");
            });
        });
        request.end();

        request.on('error', function(err) {
            stream.emit("error", err);
        });

        return stream;
    }

    return openUrlStream;
});