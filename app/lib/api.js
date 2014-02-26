var config = require('./config');

exports = module.exports = require('badgekit-issue-client')(
  config('BADGEKIT_API')
);
