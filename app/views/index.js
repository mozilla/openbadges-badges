exports.errors = require('./errors');
exports.summit = require('./summit');

exports.home = function home (req, res, next) {
  return res.render('home.html');
}