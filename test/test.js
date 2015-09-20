var xerxes = require('xerxes');
var App = xerxes();

var request = require('supertest');
var should = require('should')


//App.load('../validations');


describe('server', function() {

  App.load('../setup');
  App.load('../validations');

  // GET
  App.router.get('/user', function(req, res, next) {
    res.setData({ user: { email: 'email@example.com', name: 'Test user' } });
    next();
  });
  it('responds with json', function(done) {
    request(App.server)
      .get('/user')
      .set('Accept', 'application/json')
      .expect(200, { user: { email: 'email@example.com', name: 'Test user' } })
      .end(function(err, res) {
        if (err) return done(err);
        done();
      });
  });

  // POST data
  App.router.post('/user', function(req, res, next) {
    res.setData(req.body);
    next();
  });
  it('let\'s me post data', function(done) {
    request(App.server)
      .post('/user')
      .send({ user: { email: 'email@example.com' }, password: 'password' })
      .set('Accept', 'application/json')
      .expect(200, { user: { email: 'email@example.com' }, password: 'password' })
      .end(function(err, res) {
        if (err) return done(err);
        done();
      });
  });

  // Nested style 1
  App.router.push('/nested1', function() {
    App.router.get('/user', function(req, res, next) {
      res.setData({ user: { email: 'email@example.com', name: 'Test user' } });
      next();
    });
  });
  it('has nested routes, style 1', function(done) {
    request(App.server)
      .get('/nested1/user')
      .set('Accept', 'application/json')
      .expect(200, { user: { email: 'email@example.com', name: 'Test user' } })
      .end(function(err, res) {
        if (err) return done(err);
        done();
      });
  });

  // Nested style 2
  App.router.push('/nested2');
  App.router.get('/user', function(req, res, next) {
    res.setData({ user: { email: 'email@example.com', name: 'Test user' } });
    next();
  });
  App.router.pop();
  it('has nested routes, style 2', function(done) {
    request(App.server)
      .get('/nested2/user')
      .set('Accept', 'application/json')
      .expect(200, { user: { email: 'email@example.com', name: 'Test user' } })
      .end(function(err, res) {
        if (err) return done(err);
        done();
      });
  });

  // Modify requests
  App.router.get('/modified', function(req, res, next) {
    res.setData({ modified: false })
    next();
  });
  App.router.get('/modified', function(req, res, next) {
    res.setData({ modified: true })
    next();
  });
  it('let\'s me modify requests', function(done) {
    request(App.server)
      .get('/modified')
      .set('Accept', 'application/json')
      .expect(200, { modified: true })
      .end(function(err, res) {
        if (err) return done(err);
        done();
      });
  });

  // Validations
  App.router.post('/valid', App.router.describe({
    description: 'Test the validity of the request with a json schema',
    properties: {
      attr1: { type: 'string' },
      attr2: { type: 'string' },
      attr3: { type: 'integer' },
    },
    required: [ 'attr1']
  }), function(req, res, next) {
    res.setData({ successful: true })
    next();
  });
  it('doesn\'t let me post invalid data', function(done) {
    request(App.server)
      .post('/valid')
      .send({
        attr2: "",
        attr3: 4.3
      })
      .set('Accept', 'application/json')
      .expect(422)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.status.should.equal(422);
        res.body.code.should.equal(422);
        res.body.message.should.equal('Invalid parameters');
        res.body.errors.attr1[0].should.equal('attr1 is missing');
        res.body.errors.attr2[0].should.equal('attr2 is not a valid string');
        res.body.errors.attr3[0].should.equal('attr3 is not a valid integer');
        request(App.server)
          .post('/valid')
          .send({
            attr1: "a",
            attr3: 4
          })
          .set('Accept', 'application/json')
          .expect(200)
          .end(function(err, res) {
            if (err) return done(err);
            res.body.successful.should.equal(true);
            done();
          });
      });
  });

  App.load('../start');



  //TODO
  //response time
  //url encoded
  //views
});
