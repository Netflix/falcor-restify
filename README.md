# falcor-restify

Restify Middleware for Hosting Falcor Data Sources.

## Usage

Minimalistic example

```
'use strict';

var bunyan = require('bunyan');
var restifyMiddleware = require('falcor-restify');
var restify = require('restify');
var falcor = require('falcor');
var rx = require('rx');
var Router = require('falcor-router');

var LOG = bunyan.createLogger({
    name: 'demo',
    level: bunyan.DEBUG,
    src: true
});

var client = restify.createJsonClient({
    url: 'http://api-global.netflix.com/',
    log: LOG.child({
        component: 'server',
        level: bunyan.INFO,
        serializers: bunyan.stdSerializers
    }),
    version: '*'
});

var server = restify.createServer({
    log: LOG.child({
        component: 'server',
        level: bunyan.INFO,
        streams: [{
            // This ensures that if we get a WARN or above all debug records
            // related to that request are spewed to stderr - makes it nice
            // filter out debug messages in prod, but still dump on user
            // errors so you can debug problems
            level: bunyan.DEBUG,
            type: 'raw',
            stream: new restify.bunyan.RequestCaptureStream({
                level: bunyan.WARN,
                maxRecords: 100,
                maxRequestIds: 1000,
                stream: process.stderr
            })
        }],
        serializers: bunyan.stdSerializers
    })
});

server.use(restify.requestLogger());
server.use(restify.queryParser());

server.on('after', restify.auditLogger({
    log: LOG.child({
        component: 'audit'
    })
}));

server.on('uncaughtException', function (req, res, route, err) {
    req.log.error(err, 'got uncaught exception');
});

// Create a JSON Graph object using a Falcor Model
server.get('/model.json', restifyMiddleware(function (req, res, next) {
    return new falcor.Model({
        cache: {
            greeting: "Hello World"
        }
    });
}));

server.listen(8080, function() {
  LOG.info('%s listening at %s', server.name, server.url);
});
```

