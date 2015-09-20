var http = require('http');
var express = require('express');
var responseTime = require('response-time');
//var serveStatic = require('serve-static');
var bodyParser = require('body-parser');
//var methodOverride = require('method-override');

exports = module.exports = function(App) {

  var router = express();
  App.express = express;

  router.set('json spaces', 2);
  router.set('views', './');

  router.use(responseTime());
  //router.use(serveStatic('public'));

  router.use(
    bodyParser.json(),
    bodyParser.urlencoded({
      extended: true
    })
    //methodOverride('_method')
  );

  App.router = router;
  App.server = http.createServer(router);

  App.router.use(function(req, res, next) {
    res.setView = function(view) {
      res.view = view;
    };
    res.setData = function(data) {
      res.responseData = data;
    };
    next();
  });

  var routerStack = [];
  App.router.push = function(route, it) {
    var current = App.router;
    App.router = App.express.Router();
    App.router.describe = current.describe;
    App.router.push = current.push;
    App.router.pop = current.pop;
    routerStack.push(current);
    current.use(route, App.router);
    if (it) {
      it();
      App.router.pop();
    }
  };
  App.router.pop = function() {
    var last = routerStack.pop();
    App.router = last;
  };

};
