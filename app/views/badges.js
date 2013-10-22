const aestimia = require('../lib/aestimia');
const config = require('../lib/config');
const email = require('../lib/email');
const openbadger = require('../lib/openbadger');
const url = require('url');
const validator = require('validator');

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
  openbadger.getBadges(function (err, data) {
    if (err)
      return next(err);

    return res.render('badges/home.html', data);
  });
}

exports.single = function (req, res, next) {
  var id = req.params.badgeId;

  openbadger.getBadge( { id: id }, function (err, data) {
    if (err)
      return next(err);

    var badge = data.badge;

    openbadger.getBadgeRecommendations( { id: id, limit: 4 }, function (err, data) {
      if (err)
        return next(err);

      var otherBadges = data.badges;

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

    var badge = data.badge;

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

    var badge = data.badge;
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
