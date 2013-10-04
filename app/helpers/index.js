exports.addMessages = require('./messages');

exports.addCsrfToken = function addCsrfToken (req, res, next) {
  res.locals.csrfToken = req.session._csrf;
  next();
};
