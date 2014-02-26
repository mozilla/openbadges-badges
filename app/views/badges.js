const aestimia = require('../lib/aestimia');
const config = require('../lib/config');
const email = require('../lib/email');
const helpers = require('../helpers');
const openbadger = require('../lib/openbadger');
const badgekit = require('../lib/api');
var util = require('util');

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
    pathname: '/badges/' + badge.shortname
  });

  var application = new aestimia.Application({
    applicant: new aestimia.Applicant(email),
    badge: new aestimia.Badge(badge),
    callbackUrl: callbackUrl,
    criteriaUrl: criteriaUrl,
    description: description,
    evidence: [],
    meta: { badgeId: badge.id },
    url: criteriaUrl
  });

  aestimia.submit(application, callback);
}

exports.listAll = function (req, res, next) {
  badgekit.getBadges(function(err, data) {
    if (err) return next(err);

    data = helpers.splitProgramDescriptions(data);

    return res.render('badges/home.html', { badges : data });
  });
};

exports.single = function (req, res, next) {
  var id = req.params.badgeId;

  openbadger.getBadge( { id: id }, function (err, data) {
    if (err)
      return next(err);

    var badge = helpers.splitDescriptions(data.badge);

    openbadger.getProgram(config('PROGRAM_SHORTNAME'), function(err, data) {
      if (err)
        return next(err);

      data = helpers.splitProgramDescriptions(data, [badge.shortname]);

      var otherBadges = getRandomSubarray(data.badges, 4);

      return res.render('badges/badge.html', { badge: badge, otherBadges: otherBadges });
    });
  });
}

exports.apply = function apply(req, res, next) {
  var badgeId = req.body.badgeId;
  if (!badgeId)
    return res.send(400, 'Missing badgeId parameter');

  try {
    validator.check(req.body.description, 'Please enter a description').notEmpty();
    validator.check(req.body.email, 'Please enter a valid email address').isEmail();
  } catch (e) {
    return res.send(400, e.message);
  }

  openbadger.getBadge(badgeId, function(err, data) {
    if (err)
      return res.send(500, err);

    var badge = helpers.splitDescriptions(data.badge);

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
  openbadger.getBadge(submission.meta.badgeId, function (err, data) {
    if (err)
      return next(err);

    var badge = helpers.splitDescriptions(data.badge);
    var recipient = submission.learner;

    if (submission.accepted) {
      email.sendApplySuccess(badge, recipient);

      var query = {
        badge: badge.shortname,
        learner: {email: recipient}
      }

      openbadger.awardBadge(query, next);
    }
    else {
      email.sendApplyFailure(badge, recipient);
    }

    next();
  });
});
