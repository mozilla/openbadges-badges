const config = require('./config');

const KEY = config('MANDRILL_KEY');
const HOST = config('HOST');

const mandrill = require('node-mandrill')(KEY);
const url = require('url');

function defaultCallback(err, res) {
  if (err) {
    console.log(JSON.stringify(err));
  }
}

function createPushUrl(badge, email, assertionUrl) {
  return url.format({
    protocol: 'http',
    host: HOST,
    pathname: '/showClaimed',
    search: '?badgeSlug=' + encodeURIComponent(badge.slug) + '&assertionUrl=' + encodeURIComponent(assertionUrl) + '&email=' + encodeURIComponent(email)
  });
}

function createApplyUrl(badge) {
  return url.format({
    protocol: 'http',
    host: HOST,
    pathname: '/badges/' + encodeURIComponent(badge.slug)
  });
}

module.exports = {

  // Send email to notify user that their badge application was rejected
  sendApplyFailure: function sendApplyFailure(badge, email, callback) {
    callback = callback || defaultCallback;
    mandrill('messages/send-template', {
      template_name: 'obb-apply-failure',
      template_content: [],
      message: {
        to: [ { email: email } ],
        global_merge_vars: [
          { name: 'badgename', content: badge.name },
          { name: 'applyurl', content: createApplyUrl(badge) } ]
      }
    }, callback);
  },

  // Send email to notify user that their badge application was successful and that they were awarded a badge
  sendApplySuccess: function sendApplySuccess(badge, email, assertionUrl, callback) {
    callback = callback || defaultCallback;
    mandrill('messages/send-template', {
      template_name: 'obb-badge-earned',
      template_content: [],
      message: {
        to: [ { email: email } ],
        global_merge_vars: [
          { name: 'badgename', content: badge.name },
          { name: 'badgeimage', content: badge.imageUrl },
          { name: 'badgedesc', content: badge.earnerDescription },
          { name: 'pushurl', content: createPushUrl(badge, email, assertionUrl) } ]
      }
    }, callback);
  }
};
