# falcor-restify
Server plugin for falcor-restify

## Usage
Minimalistic example

```
'use strict';

var falcorResitfy = require('falcor-restify');
var Router = require('falcor-router');

var router = new Router(
    // Your router setup
);

server.get('/model.json', falcorRestify(function (req, res, next) {
    return router;
}));
```
