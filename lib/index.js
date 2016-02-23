'use strict';
var restify = require('restify');

module.exports = function(getDataSource) {
    return function falcorHandler(req, res, next) {
        var dataSource = getDataSource(req, res);
        var obs,
            paths,
            jsong,
            callParms = {};

        // probably this should be sanity check function?
        if (Object.keys(req.params).length === 0) {
            return next(new restify.InternalError('Request not supported'));
        }
        if (!req.params.method) {
            return next(new restify.InternalError('No query method provided'));
        }
        if (!dataSource[req.params.method]) {
            return next(new restify.InternalError('Data source does not implement the requested method'));
        }
        if (req.params.method === 'set') {
            try {
                jsong = JSON.parse(req.params.jsonGraph);
            }
            catch(e) {
                return next(new restify.InternalError('Unable to parse jsonGraph query string parameter as JSON'));
            }
            obs = dataSource.set(jsong);
        } else if (req.params.method === 'call') {
            ["arguments", "callPath", "paths", "pathSuffixes"].forEach(function(parameter) {
                try {
                    callParms[parameter] = JSON.parse(req.params[parameter]);
                }
                catch(e) {
                    return next(new restify.InternalError('Unable to parse ' + parameter + ' query string parameter as JSON'));
                }
            });

            obs = dataSource.call(callParms.callPath, callParms.arguments, callParms.pathSuffixes, callParms.paths);
        } else if (req.params.method === 'get') {
            try {
                paths = JSON.parse(req.params.paths);
            }
            catch(e) {
                return next(new restify.InternalError('Unable to parse paths query string parameter as JSON'));
            }
            obs = dataSource.get(paths);
        }
        obs.
            subscribe(
            function(jsonGraph) {
                req.log.debug({data: jsonGraph});
                res.send(200, jsonGraph);
                return next();
            },
            function(err) {
                return next(new restify.InternalError(err));
            });
    };
};
