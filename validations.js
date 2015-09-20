exports = module.exports = function(App) {

  var Validator = new require('jsonschema').Validator;
  var v = new Validator();
  v.types.number = function(instance) {
    return !isNaN(instance);
  };
  v.types.integer = function(instance) {
    if (typeof instance === 'string') {
      if (isNaN(instance)) { return false; }
      return parseFloat(instance) % 1 === 0;
    }
    return (typeof instance == 'number') && instance % 1 === 0;
  };
  v.types.string = function testString (instance) {
    return typeof instance == 'string' && instance.length > 0;
  };
  App.router.describe = function(validation) {
    var fn = function(req, res, next) {
      var body = req.query;
      if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
        body = req.body;
      }

      var result = v.validate(body, validation);
      if (!result.valid) {
        /*
        [ { property: 'instance.componentElementType',
          message: 'requires property "name"',
          schema: { required: [Object], type: 'object', properties: [Object]  },
          instance: {},
          name: 'required',
          argument: 'name',
          stack: 'instance.componentElementType requires property "name"' },
          { property: 'instance.componentElementType',
            message: 'requires property "data"',
            schema: { required: [Object], type: 'object', properties: [Object]  },
            instance: {},
            name: 'required',
            argument: 'data',
            stack: 'instance.componentElementType requires property "data"' } ]
            */

        var errors = {};
        for (var i in result.errors) {
          if (result.errors[i].name === 'required') {
            var path = result.errors[i].argument;
            errors[path] = [path + " is missing"];
          } else if (result.errors[i].name === 'type') {
            var path = result.errors[i].property.split('.').pop();
            errors[path] = [path + ' is not a valid ' + result.errors[i].schema.type];
          } else {
            var path = result.errors[i].property.split('.').pop();
            errors[path] = [result.errors[i].message];
          }
        }
        next({ status: 422, message: 'Invalid parameters', errors: errors });
      } else {
        next();
      }
    };
    fn['validation'] = validation;
    return fn;
  };
};
