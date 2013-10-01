exports = module.exports = {
  notFound: function (req, res, next) {
    return res.render('errors/not-found.html');
  },
  error: function (err, req, res, next) {
    return res.render('errors/error.html');
  }
}