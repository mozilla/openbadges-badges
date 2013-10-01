var test = require('tap').test;

test('Can we make an instance of the client?', function (t) {
  var c = require('..');
  t.ok(c);
  t.end();
});
