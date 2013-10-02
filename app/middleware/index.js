exports.redirect = function (target, params, status) {
  if (typeof params === 'number') {
    status = params;
    params = {};
  }

  return function (req, res, next) {
    try {
      var url = res.locals.url(target, params);
    } catch (e) {
      var url = target;
    }

    return res.redirect(status || 302, url);
  }
}