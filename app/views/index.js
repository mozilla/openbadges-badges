exports.errors = require('./errors');
exports.summit = require('./summit');
exports.claim = require('./claim');

exports.home = function home (req, res, next) {
  return res.render('home.html');
}