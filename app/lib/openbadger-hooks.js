const jwt = require('jwt-simple');
const util = require('util');
const mandrill = require('./email');
const helpers = require('../helpers');
const config = require('./config');
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

  function reviewHook(req, res, next) {
    const approved = req.body.approved;
    const application = req.body.application;
    const badge = application.badge;

    function finish(err) {
      if (err && err.code !== 409)
        return next(err);

      application.processed = new Date();
      openbadger.updateApplication({ system: config('SYSTEM_SHORTNAME'), badge: badge.slug, application: application }, function (err) {
        return res.send(200, 'Success');
      });
    }

    var recipient = application.learner;

    if (approved) {
      var query = {
        system: config('SYSTEM_SHORTNAME'),
        badge: badge.slug,
        email: recipient
      }

      return openbadger.createBadgeInstance(query, finish);
    }
    else {
      mandrill.sendApplyFailure(badge, recipient);
      return finish();
    }
  }

  function claimHook(req, res, next) {
    return res.send(200, { status: 'ok' });
  }

  function awardHook(req, res, next) {
    const badge = req.body.badge;
    const recipient = req.body.email;
    const assertionUrl = req.body.assertionUrl;

    mandrill.sendApplySuccess(badge, recipient, assertionUrl);

    return res.send(200, { status: 'ok' });
  }

  return {
    define: function defineRoutes(app) {
      app.post('/webhook', auth, function (req, res, next) {
        switch (req.body.action) {
          case 'award':
            return awardHook(req, res, next);
          case 'claim':
            return claimHook(req, res, next);
          case 'review':
            return reviewHook(req, res, next);
        }
      });
    }
  };
}