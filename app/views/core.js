const config = require('../lib/config');
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

  function end (err) {
    if (err)
      req.flash('error', err);

    return res.render('core/claim-new.html', {
      code: code
    });
  }

  if (!code)
    return end();

  openbadger.getBadgeFromCode( { system: config('SYSTEM_SHORTNAME') }, code, function(err, data) {
    if (err && err.message.indexOf('already has badge') <= -1)
      // should probably send back to the summit page with an error message
      return end(err.message);

    var badge = data;

    if (!badge)
      return end('Invalid claim code');

    if (badge.claimed)
      return end('That claim code has already been used');

    return res.render('core/claim-start.html', {
      badge: badge,
      code: code
    });
  });
};

exports.processClaim = function processClaim (req, res, next) {
  var code = req.body.code;
  var recipientEmail = req.body.email;

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

  try {
    validator.check(recipientEmail, 'Please enter a valid email address.').isEmail();
  } catch (e) {
    return end(e.message);
  }

  openbadger.getBadgeFromCode( { system: config('SYSTEM_SHORTNAME') }, code, function(err, data) {
    if (err)
      return end(err.message);

    var badge = data;

    if (!badge)
      return end();

    openbadger.createBadgeInstance( { system: config('SYSTEM_SHORTNAME'), badge: badge.slug, email: recipientEmail }, code, function(err, instance) {
      if (err && err.code !== 409)
        return end(err.message);

      if (err) {
        badge.assertionUrl = err.details.assertionUrl;
      }
      else {
        badge.assertionUrl = instance.assertionUrl;
      }

      success(badge);
    });
  });
};

exports.showClaimed = function showClaimed (req, res, next) {
  var badgeSlug = req.query.badgeSlug;
  var recipientEmail = req.query.email;
  var assertionUrl = req.query.assertionUrl;

  openbadger.getBadge({ system: config('SYSTEM_SHORTNAME'), badge: badgeSlug }, function (err, badge) {
    if (err)
      return next(err);

    badge.assertionUrl = assertionUrl;

    return res.render('core/claim-store.html', {
      badge: badge,
      email: recipientEmail
    });
  });
}

exports.share = function share (req, res, next) {
  var recipientEmail = req.body.email || req.query.email;
  var badgeSlug = req.body.badgeSlug || req.query.badgeSlug;

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

  openbadger.getBadge( { system: config('SYSTEM_SHORTNAME'), badge: badgeSlug }, function(err, data) {
    if (err)
      return end(err.message);

    var badge = data;

    success(badge);
  })
};