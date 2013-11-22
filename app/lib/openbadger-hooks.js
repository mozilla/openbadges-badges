const jwt = require('jwt-simple');
const util = require('util');
const mandrill = require('./email');
const helpers = require('../helpers');

const JWT_SECRET = process.env['OPENBADGER_SECRET'];

module.exports = function makeOpenbadgerHooks(openbadger) {
  function respondWithForbidden(res, reason) {
    return res.send(403, { status: 'forbidden', reason: reason });
  }

  function respondWithError(res, message) {
    return res.send(500, { status: 'error', error: message });
  }

  function auth(req, res, next) {
    const param = req.method === "GET" ? req.query : req.body;
    const token = param.auth;
    const email = param.email;

    const now = Date.now()/1000|0;
    var decodedToken, msg;
    if (!token)
      return respondWithForbidden(res, 'missing mandatory `auth` param');
    try {
      decodedToken = jwt.decode(token, JWT_SECRET);
    } catch(err) {
      return respondWithForbidden(res, 'error decoding JWT: ' + err.message);
    }
    if (decodedToken.prn !== email) {
      msg = '`prn` mismatch: given %s, expected %s';
      return respondWithForbidden(res, util.format(msg, decodedToken.prn, email));
    }

    if (!decodedToken.exp)
      return respondWithForbidden(res, 'Token must have exp (expiration) set');

    if (decodedToken.exp < now)
      return respondWithForbidden(res, 'Token has expired');

    return next();
  }

  return {
    define: function defineRoutes(app) {
      app.post('/notify/claim', auth, function(req, res, next) {
        var claimCode = req.body.claimCode;
        var email = req.body.email;

        if (req.body.isTesting)
          return res.send(200, { status: 'ok' });

        if (!claimCode)
          return respondWithError(res, 'No claimCode provided');

        claimCode = claimCode.trim();

        openbadger.getBadgeFromCode( { code: claimCode, email: email }, function (err, data) {
          if (err)
            return respondWithError(res, err.message);

          var badge = helpers.splitDescriptions(data.badge);

          openbadger.claim({ code: claimCode, learner: { email: email } }, function (err, data) {
            if (err)
              return respondWithError(res, err.message);

            mandrill.sendApplySuccess(badge, email);

            return res.send(200, { status: 'ok' });
          });
        });
      });

      app.post('/notify/award', auth, function(req, res, next) {
        return res.send(200, { status: 'ok' });
      });
    }
  };
}