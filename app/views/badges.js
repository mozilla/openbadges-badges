exports.listAll = function (req, res, next) {
  return res.send('Badges');
}

exports.single = function (req, res, next) {
  return res.send('Badge');
}
