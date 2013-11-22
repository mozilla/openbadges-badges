const email = require('../lib/email');
const openbadger = require('../lib/openbadger');
const helpers = require('../helpers');
const url = require('url');
const validator = require('validator');

exports.home = function home (req, res, next) {
  openbadger.getBadges(function (err, data) {
    return res.render('core/home.html', data);
  });
}

exports.claim = function claim (req, res, next) {
  var code = (req.query.code||'').trim();
  var email = req.query.email;

  function end (err) {
    if (err)
      req.flash('error', err);

    return res.render('core/claim-new.html', {
      code: code
    });
  }

  if (email) {
    return exports.processClaim(req,res,next);
  }

  if (!code)
    return end();

  openbadger.getBadgeFromCode( { code: code, email: '' }, function(err, data) {
    if (err && err.message.indexOf('already has badge') <= -1)
      // should probably send back to the summit page with an error message
      return end(err.message);

    var badge = helpers.splitDescriptions(data.badge);

    if (!badge)
      return end('Invalid claim code');

    return res.render('core/claim-start.html', {
      badge: badge,
      code: code
    });
  });
};

exports.processClaim = function processClaim (req, res, next) {
  var code = req.body.code || req.query.code;
  var recipientEmail = req.body.email || req.query.email;
  var shortname = req.body.shortname || req.query.shortname;

  var redirect = url.format({
    pathname: res.locals.url('claim'),
    query: {code: code}
  });

  function end (err) {
    if (err)
      req.flash('error', err);
    return res.redirect(redirect);
  }

  function success(badge) {
    res.render('core/claim-store.html', {
      badge: badge,
      email: recipientEmail
    });
  }

  function handleAlreadyClaimed(shortname, recipientEmail) {
    openbadger.getUserBadge( { id: shortname, email: recipientEmail }, function(err, data) {
      if (err)
        return end(err.message);

      var badge = helpers.splitDescriptions(data.badge);

      success(badge);
    })
  }

  try {
    validator.check(recipientEmail, 'Please enter a valid email address.').isEmail();
  } catch (e) {
    return end(e.message);
  }

  if (code) {
    openbadger.getBadgeFromCode( { code: code, email: recipientEmail }, function(err, data) {
      if (err)
        return end(err.message);

      var badge = helpers.splitDescriptions(data.badge);

      if (!badge)
        return end();

      openbadger.claim( { code: code, learner: { email: recipientEmail } }, function(err, data) {
        if (err && err.message.indexOf('already has badge') <= -1)
          return end(err.message);

        if (err) {
          handleAlreadyClaimed(badge.shortname, recipientEmail);
        }
        else {
          email.sendApplySuccess(badge, recipientEmail);

          badge.assertionUrl = data.url;
          success(badge);
        }
      });
    });
  }
  else {
    handleAlreadyClaimed(shortname, recipientEmail);
  }
};

exports.share = function share (req, res, next) {
  var recipientEmail = req.body.email || req.query.email;
  var shortname = req.body.shortname || req.query.shortname;

  var redirect = url.format({
    pathname: res.locals.url('claim'),
  });

  function end (err) {
    if (err)
      req.flash('error', err);
    return res.redirect(redirect);
  }

  function success(badge) {
    res.render('core/claim-share.html', {
      badge: badge,
      email: recipientEmail
    });
  }

  openbadger.getUserBadge( { id: shortname, email: recipientEmail }, function(err, data) {
    if (err)
      return end(err.message);

    var badge = helpers.splitDescriptions(data.badge);

    success(badge);
  })
};