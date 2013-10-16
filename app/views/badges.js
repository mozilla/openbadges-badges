const openbadger = require('../lib/openbadger');

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

    openbadger.getBadgeRecommendations( { id: id, limit: 12 }, function (err, data) {
      if (err)
        return next(err);

      var otherBadges = data.badges;

      return res.render('badges/badge.html', { badge: badge, otherBadges: otherBadges });
    });
  });
}
