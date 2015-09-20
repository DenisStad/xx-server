## Install

```
npm install --save xx-server
```

*Note* This is a core package of xerxes, so usually you don't have to install it manually

## Usage

In your `app.js`, put `App.load('server/setup');` somewhere at the top. Optionally, but recommended, you can also include `App.load('server/validations');` right after the setup (more on that below).

The server uses express, so you're probably already familiar with the syntax. It is exposed through `App.router`.

```
App.router.post('/users', function(req, res, next) {
  if (!req.body.email) {
    return next({ status: 422, code: 12345, errors: { email: [ 'email is missing' ] } });
  }
  res.setData({ user: { email: req.body.email } });
  next();
});
```

After you've defined the routes you have to start the server with `App.load('server/start');` This will add a default error handler and 404 handler, so it's important to keep it at the end.

## Conventions

One important difference to express is that you shouldn't directly end the request when you're done (with `res.json(...)` for example). Instead, you set the responseData of the response with `res.setData({...})` and let the server figure the rest out by passing it further with `next()`. This way, other modules can still modify the response when they want to, which is an important key concept of xerxes. 

There are also a few recommendations on the json data you return. When you for example return a user object, you should set the responseData to something like `{ user: { email: "email@example.com" } }` instead of `{ email: "email@example.com" }`. For endpoints that return lists, you would return `{ users: [ {...} ], meta: { page: 1, total: 300 } }`. Error message should have the format as in the example above.

## Nested routes

Let's say you have a module that creates CRUD endpoints on `/comments` (when doing `App.load('comments/endpoints');`), but you want them to be in `/posts/:post_id/comments` instead. Instead of modifying the comments module, you can simply do this:

```
App.router.push('/posts/:post_id', function() {
  App.load('comments/endpoints');
});
```

## Validations

If you load `server/validations`, you'll be able to define what the data that gets passed to the endpoints looks like, by defining it through a json schema. Here is an example:

```
App.router.post('/users', App.router.describe({
  description: "Create a new *user*",
  properties: {
    email: { type: 'string' },
    info: {
      type: 'object',
      properties: { name: { type: 'string' }, birthyear: { type: 'integer' } }
      required: [ 'name' ]
    }
  }
  required: [ 'email', 'info' ]
}), function(req, res, next) {
  ...
});
```

You can read more about json schema [here](http://json-schema.org/example1.html). This will not only give you validations, but there is the `xx-docs` package which generates an API documentation from these validations.

## Rendering views

Although xerxes is primarily built to create APIs, it's also possible to specify a view with `res.setView('index.html')`. If the HTTP request accepts html, the server will respond with that html file, but if it's for example `application/json` then it will send the responseData as json.
You can as well use a template engine. For example if you have ejs installed, you can do `res.setView('index.ejs');`. The data that you pass to `res.setData` will be used as template variables (locals).
