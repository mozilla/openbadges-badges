var config = require('./config');

export = module.exports = require('aestimia-client')({
  endpoint: config('AESTIMIA_ENDPOINT'),
  secret: config('AESTIMIA_SECRET')
});
