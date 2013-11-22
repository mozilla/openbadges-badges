if (process.env.NEW_RELIC_HOME) {
  require('newrelic');
}

const config = require('./lib/config');
const express = require('express');
const flash = require('connect-flash');
const helpers = require('./helpers');
const middleware = require('./middleware');
const nunjucks = require('nunjucks');
const path = require('path');
const views = require('./views');
const urlUtil = require('url');

const app = express();
const env = new nunjucks.Environment(new nunjucks.FileSystemLoader(path.join(__dirname, 'templates')), {autoescape: true});
env.express(app);
env.addFilter('addQueryString', function(url, kwargs) {
  url = urlUtil.parse(url, true); // true means to parse query string
  url.query = url.query || {};

  Object.keys(kwargs).forEach(function (key) {
    if (kwargs[key] !== '' && key !== '__keywords')
      url.query[key] = kwargs[key];
  });

  delete url.search; // or format will ignore .query
  return new nunjucks.runtime.SafeString(urlUtil.format(url));
});

// Bootstrap the app for reversible routing, and other niceties
require('../lib/router.js')(app);

var staticDir = path.join(__dirname, '/static');
var staticRoot = '/static';

var foundationDir = path.join(__dirname, '../bower_components/foundation');
var foundationRoot = '/foundation';

app.use(function (req, res, next) {
  res.locals.static = function static (staticPath) {
    return path.join(app.mountPoint, staticRoot, staticPath);
  }

  res.locals.foundation = function foundation (foundationPath) {
    return path.join(app.mountPoint, foundationRoot, foundationPath);
  }
  next();
});


app.use(express.compress());
app.use(express.bodyParser());
app.use(middleware.session());
app.use(middleware.csrf({ whitelist: ['/aestimia'] }));
app.use(middleware.sass());
app.use(flash());

app.use(helpers.addCsrfToken);
app.use(helpers.addMessages);

app.use(staticRoot, express.static(staticDir));
app.use(foundationRoot, express.static(foundationDir));

app.get('/', 'home', middleware.redirect('badges', 302));
app.get('/summit', 'summit', views.summit);
app.get('/claim', 'claim', views.claim);
app.post('/claim', 'claim.action', views.processClaim);
app.get('/share', 'claim.share', views.share);
app.get('/badges', 'badges', views.badges.listAll);
app.get('/badges/:badgeId', 'badge', views.badges.single);
app.post('/badges/:badgeId', 'badge.apply', views.badges.apply);
app.use('/aestimia', views.badges.aestimia);

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