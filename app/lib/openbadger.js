var config = require('./config');

exports = module.exports = require('badgekit-api-client')(
  config('OPENBADGER_URL'),
  config('OPENBADGER_SECRET')
);

