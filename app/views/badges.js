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
  var badgeSlug = req.body.badgeSlug;
  if (!badgeSlug)
    return res.send(400, 'Missing badgeSlug parameter');

  try {
    validator.check(req.body.description, 'Please enter a description').notEmpty();
    validator.check(req.body.email, 'Please enter a valid email address').isEmail();
  } catch (e) {
    return res.send(400, e.message);
  }

  var application = {
    learner: req.body.email,
    evidence: [{ reflection: req.body.description }]
  };

  var context = { system: config('SYSTEM_SHORTNAME'), badge: badgeSlug, application: application };

  openbadger.addApplication(context, function (err, application) {
    if (err)
      return res.send(500, err);

    return res.send(200, 'Thanks for applying for this badge. A notification will be sent to you upon review of the badge application.');
  });
};

