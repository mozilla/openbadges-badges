function splitDescriptions(badge) {
  if (badge) {
    var descriptions = badge.description.split('*', 2);

    badge.shortDescription = descriptions[0];
    badge.description = descriptions[1] || descriptions[0];
  }

  return badge;
}

function splitProgramDescriptions(data, excludeShortnames) {
  excludeShortnames = excludeShortnames || [];
  if (data && data.program) {
    data.badges = [];
    for (var shortname in data.program.earnableBadges) {
      if (excludeShortnames.indexOf(shortname) < 0) {
        var badge = splitDescriptions(data.program.earnableBadges[shortname]);
        badge.id = badge.shortname;
        data.badges.push(badge);
      }
    }
  }

  return data;
}

exports.addMessages = require('./messages');

exports.addCsrfToken = function addCsrfToken (req, res, next) {
  res.locals.csrfToken = req.session._csrf;
  next();
};

exports.splitDescriptions = splitDescriptions;
exports.splitProgramDescriptions = splitProgramDescriptions;
