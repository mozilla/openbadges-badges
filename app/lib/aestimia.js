var config = require('./config');

exports = module.exports = require('aestimia-client')({
  endpoint: config('AESTIMIA_ENDPOINT'),
  secret: config('AESTIMIA_SECRET')
});
