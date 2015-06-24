'use strict';
var restify = require('restify');

module.exports = function(getDataSource) {
    return function(req, res, next) {
        var dataSource = getDataSource(req, res);
        var obs,
            paths,
            jsong,
            callParms = {};

        // probably this should be sanity check function?
        if (Object.keys(req.query).length === 0) {
            return next(new restify.InternalError('Request not supported'));
        }
        if (!req.query.method) {
            return next(new restify.InternalError('No query method provided'));
        }
        if (!dataSource[req.query.method]) {
            return next(new restify.InternalError('Data source does not implement the requested method'));
        }
        if (req.query.method === 'set') {
            try {
                jsong = JSON.parse(req.query.jsong);
            }
            catch(e) {
                return next(new restify.InternalError('Unable to parse jsong query string parameter as JSON'));
            }
            obs = dataSource.set(jsong);
        } else if (req.query.method === 'call') {
            ["arguments", "callPath", "paths", "pathSuffixes"].forEach(function(parameter) {
                try {
                    callParms[parameter] = JSON.parse(req.query[parameter]);
                }
                catch(e) {
                    return next(new restify.InternalError('Unable to parse ' + parameter + ' query string parameter as JSON'));
                }                   
            });
         
            obs = dataSource.call(callParms.callPath, callParms.arguments, callParms.pathSuffixes, callParms.paths);
        } else if (req.query.method === 'get') {
            try {
                paths = JSON.parse(req.query.paths);
            }
            catch(e) {
                return next(new restify.InternalError('Unable to parse jsong query string parameter as JSON'));
            }
            obs = dataSource.get(paths);
        }
        obs.
            subscribe(
            function(jsong) {
                req.log.debug({data: jsong});
                res.send(200, jsong);
                return next();
            }, 
            function(err) {
                return next(new restify.InternalError(err));
            });
    };
};
