const aestimia = require('../lib/aestimia');
const config = require('../lib/config');
const email = require('../lib/email');
const helpers = require('../helpers');
const openbadger = require('../lib/openbadger');
const url = require('url');
const validator = require('validator');

function getRandomSubarray(arr, size) {
  var shuffled = arr.slice(0), i = arr.length, temp, index;
  while (i--) {
    index = Math.floor(i * Math.random());
    temp = shuffled[index];
    shuffled[index] = shuffled[i];
    shuffled[i] = temp;
  }
  return shuffled.slice(0, size);
}

function submitApplication(badge, email, description, callback) {
  badge.rubric = new aestimia.Rubric(badge.rubric);
  if (!badge.categories) badge.categories = [];
  badge.categories.push('openbadges');

  var callbackUrl = url.format({
    protocol: 'http',
    host: config('HOST'),
    pathname: '/aestimia'
  });

  var criteriaUrl = url.format({
    protocol: 'http',
    host: config('HOST'),
    pathname: '/badges/' + badge.slug
  });

  var application = new aestimia.Application({
    applicant: new aestimia.Applicant(email),
    badge: new aestimia.Badge(badge),
    callbackUrl: callbackUrl,
    criteriaUrl: criteriaUrl,
    description: description,
    evidence: [],
    meta: { badgeSlug: badge.slug },
    url: criteriaUrl
  });

  aestimia.submit(application, callback);
}

exports.listAll = function (req, res, next) {
  openbadger.getBadges({ system: config('SYSTEM_SHORTNAME') }, function(err, badges) {
    if (err)
      return next(err);

    return res.render('badges/home.html', { badges: badges });
  });
}

exports.single = function (req, res, next) {
  var badgeSlug = req.params.badgeSlug;

  openbadger.getBadge( { system: config('SYSTEM_SHORTNAME'), badge: badgeSlug }, function (err, badge) {
    if (err)
      return next(err);

    openbadger.getBadges({ system: config('SYSTEM_SHORTNAME') }, function(err, badges) {
      if (err)
        return next(err);

      var otherBadges = getRandomSubarray(badges, 4);

      return res.render('badges/badge.html', { badge: badge, otherBadges: otherBadges });
    });
  });
}

exports.apply = function apply(req, res, next) {
  console.log('blah');
  var badgeSlug = req.body.badgeSlug;
  if (!badgeSlug)
    return res.send(400, 'Missing badgeSlug parameter');

  try {
    validator.check(req.body.description, 'Please enter a description').notEmpty();
    validator.check(req.body.email, 'Please enter a valid email address').isEmail();
  } catch (e) {
    return res.send(400, e.message);
  }

  openbadger.getBadge({ system: config('SYSTEM_SHORTNAME'), badge: badgeSlug }, function(err, badge) {
    if (err)
      return res.send(500, err);

    submitApplication(badge, req.body.email, req.body.description, function (err) {
      if (err)
        return res.send(500, err);

      //TODO: send email to reviewer
      return res.send(200, '');
    });
  });
  // form data in req.body.email and req.body.description
  return res.send(200, 'Thanks for applying for this badge. A notification will be sent to you upon review of the badge application.');
};

exports.aestimia = aestimia.endpoint(function(submission, next) {
  openbadger.getBadge({ system: config('SYSTEM_SHORTNAME'), badge: submission.meta.badgeSlug }, function (err, badge) {
    if (err)
      return next(err);

    var recipient = submission.learner;

    if (submission.accepted) {
      email.sendApplySuccess(badge, recipient);

      var query = {
        system: config('SYSTEM_SHORTNAME'),
        badge: badge.slug,
        email: recipient
      }

      openbadger.createBadgeInstance(query, next);
    }
    else {
      email.sendApplyFailure(badge, recipient);
    }

    next();
  });
});
