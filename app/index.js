if (process.env.NEW_RELIC_HOME) {
  require('newrelic');
}

const config = require('./lib/config');
const express = require('express');
const middleware = require('./middleware');
const nunjucks = require('nunjucks');
const path = require('path');
const views = require('./views');

const app = express();
const env = new nunjucks.Environment(new nunjucks.FileSystemLoader(path.join(__dirname, 'templates')), {autoescape: true});
env.express(app);

// Bootstrap the app for reversible routing, and other niceties
require('../lib/router.js')(app);

var staticDir = path.join(__dirname, '/static');
var staticRoot = '/static';

app.use(express.compress());
app.use(express.bodyParser());
app.use(staticRoot, express.static(staticDir));

app.use(function (req, res, next) {
  res.locals.static = function static (staticPath) {
    return path.join(app.mountPoint, staticRoot, staticPath);
  }
  next();
});

app.get('/', 'home', middleware.redirect('summit'));
app.get('/summit', 'summit', views.summit);
app.get('/claim', 'claim', views.claim);
app.post('/claim', 'claim.action', views.processClaim);

app.get('*', views.errors.notFound);
app.use(views.errors.error);

if (!module.parent) {
  var port = config('PORT', 3000);

  app.listen(port, function(err) {
    if (err) throw err;
    console.log("Listening on port " + port + ".");
  });
} else {
  module.exports = http.createServer(app);
}