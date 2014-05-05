const jws = require('jws');
const util = require('util');
const crypto = require('crypto');
const mandrill = require('./email');
const helpers = require('../helpers');
const config = require('./config');
const JWT_SECRET = config('BADGEKIT_API_WEBHOOK_SECRET');

function sha256(body) {
  return crypto.createHash('sha256').update(body).digest('hex')
}

module.exports = function makeOpenbadgerHooks(openbadger) {
  function respondWithForbidden(res, reason) {
    return res.send(403, { status: 'forbidden', reason: reason });
  }

  function respondWithError(res, message) {
    return res.send(500, { status: 'error', error: message });
  }

  function auth(req, res, next) {
    const param = req.body;
    var token = req.headers.authorization;
    token = token.slice(token.indexOf('"')+1, -1);
    const email = param.email;

    if (!jws.verify(token, JWT_SECRET)) {
      msg = 'verification of jws failed';
      return respondWithForbidden(res, msg);
    }

    const now = Date.now()/1000|0;
    var decodedToken, msg;
    if (!token)
      return respondWithForbidden(res, 'missing mandatory `authorization` header');
    try {
      decodedToken = jws.decode(token);
    } catch(err) {
      return respondWithForbidden(res, 'error decoding JWT: ' + err.message);
    }

    if (decodedToken.payload.body.hash !== sha256(JSON.stringify(req.body))) {
      return respondWithForbidden(res, 'request body hash does not match token hash');
    }

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
      app.post('/webhook', [auth, function (req, res, next) {
        switch (req.body.action) {
          case 'award':
            return awardHook(req, res, next);
          case 'claim':
            return claimHook(req, res, next);
          case 'review':
            return reviewHook(req, res, next);
        }
      }]);
    }
  };
}