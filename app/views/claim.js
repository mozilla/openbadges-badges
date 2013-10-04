const openbadger = require('../lib/openbadger');
const validator = require('validator');

exports.home = function (req, res, next) {
  var code = req.query.code;

  openbadger.getBadgeFromCode( { code: code, email: '' }, function(err, data) {
    if (err && err.message.indexOf('already has badge') <= -1)
      // should probably send back to the summit page with an error message
      return res.send(500, err.message );

    var badge = data.badge;

    if (!badge)
      return res.send(404);

    return res.render('claim/home.html', { badge: badge, code: code });
  });
};

exports.post = function(req, res, next) {
  var code = req.body.code;
  var recipientEmail = req.body.email;

  try {
    validator.check(recipientEmail, 'Please enter a valid email address.').isEmail();
  } catch (e) {
    return res.send(500, e.message);
  }

  openbadger.getBadgeFromCode( { code: code, email: recipientEmail }, function(err, data) {
    if (err)
      return res.send(500, err.message );

    var badge = data.badge;

    if (!badge)
      return res.send(404);

    openbadger.claim( { code: code, learner: { email: recipientEmail } }, function(err, data) {
      if (err)
        return res.send(500, err.message );

      console.log(JSON.stringify(data));
      badge.assertionUrl = data.url;

      res.render('send-to-backpack/home.html', { badge: badge, email: recipientEmail });
    });
  });
};