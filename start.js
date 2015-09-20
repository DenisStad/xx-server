var fs = require('fs');

exports = module.exports = function(App) {

  function serveView(req, res, next) {
    if (res.view) {
      if (res.view.indexOf('.html') === res.view.length - 5) {
        fs.readFile(res.view, 'utf8', function(err, contents) {
          if (err) return next(err);
          res.send(contents);
        });
      } else {
        res.render(res.view, res.responseData);
      }
    } else {
      next({ status: 404, message: 'page not found' });
    }
  }
  App.router.use(function(req, res, next) {
    if (res.headersSent) {
      return;
    }
    if (res.responseData) {
      res.format({
        text: function() {
          res.send(res.responseData);
        },
        json: function() {
          res.json(res.responseData);
        },
        html: function() {
          serveView(req, res, next);
        }
      });
      return;
    }

    if (res.statusCode === 204) {
      res.end();
      return;
    }

    serveView(req, res, next);
  });

  App.router.use(function(err, req, res, next) {
    res.statusCode = err.status || 500;
    var error = {};
    error.status = res.statusCode;
    error.code = err.code || error.status;
    error.message = err.message;
    if (!error.message) error.message = 'An unknown error occured';
    if (!App.environment.isProduction()) {
      error.stack = err.stack ? err.stack : new Error(err.message).stack;
    }
    for (var i in err) {
      error[i] = err[i];
    }

    res.format({
      text: function() {
        res.send(err.message);
      },
      json: function() {
        res.json(error);
      },
      html: function() {
        if (res.view) {
          res.render(res.view);
        } else {
          res.json(error);
        }
      }
    });
  });

  App.server.listen(3000);
};
