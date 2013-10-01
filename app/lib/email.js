const config = require('./config');

const KEY = config('MANDRILL_KEY');

const mandrill = require('node-mandrill')(KEY);
const url = require('url');

function defaultCallback(err, res) {
  if (err) {
    console.log(JSON.stringify(err));
  }
}

exports = module.exports = {
  
};