const querystring = require('querystring');
const url = require('url');
const _ = require('underscore');

function extractMessageData (req) {
  var messages = {};
  var fields = {};

  if (_.isFunction(req.flash)) {
    _.each(req.flash(), function(list, type) {
      list = _.map(list, function(msg) {
        if (msg instanceof Error)
          msg = _.extend({value: msg.message}, _.pick(msg, _.keys(msg)));

        if (!_.isObject(msg))
          msg = {value: ''+msg};

        if (type === 'modal') {
          if (!_.isArray(msg.buttons) && !_.isObject(msg.buttons))
            msg.buttons = [];

          if (_.isArray(msg.buttons) && !msg.buttons.length)
            msg.buttons.push('Close');
        }

        if (_.isArray(msg.buttons)) {
          _.each(msg.buttons, function(button, key) {
            if (!_.isObject(button))
              button = {label: ''+button};
            msg.buttons[key] = button;
          });
        } else if (_.isObject(msg.buttons)) {
          msg.buttons = _.map(msg.buttons, function(value, key) {
            value = value || {};

            if (!_.isObject(value))
              value = {type: value};

            return _.defaults(value, {
              label: '' + key
            });
          });
        }

        if (!msg.fields && msg.field)
          msg.fields = [msg.field];

        if (msg.fields) {
          var fieldBase = {
            message: msg.value,
            state: type.replace(/^field-/, '')
          };

          if (_.isArray(msg.fields)) {
            _.each(msg.fields, function(field) {
              fields[field] = fieldBase;
            });
          } else if (_.isObject(msg.fields)) {
            _.each(msg.fields, function(field, meta) {
              if (_.isString(meta))
                meta = {message: meta};

              fields[field] = _.defaults(meta || {}, fieldBase);
            });
          }
        }

        return msg;
      });
      if (type !== 'field-error')
        messages[type] = list;
    });
  }

  return {
    messages: messages,
    fields: fields
  };
}

exports = module.exports = function addMessages (req, res, next) {
  var render = res.render.bind(res);

  res.render = function (view, options, callback) {
    // support callback function as second arg
    if (_.isFunction(options)) {
      callback = options;
      options = {};
    }

    if (!_.isObject(options))
      options = {};

    var messageData = extractMessageData(req);

    options._messages = messageData.messages;
    options._fields = messageData.fields;

    return render(view, options, callback);
  }

  next();
}