OpenBadges Badges
=================

Mozilla Open Badges issues Open Badges.

Usage
-----

	> node app

Configuration
-------------

OpenBadges Badges is optionally configured through three different systems (in order or preference):

 * command line arguments
 * a JSON configuration file
 * environment variables

These can be accessed within the app like so:

	var config = require('./lib/config');
	
	var port = config('PORT', 3000);
	var endpoint = config('API_ENDPOINT');

If a default value is given, it will be returned if not found elsewhere in the configuration. If it is not given, and no value is found, a `ReferenceError` will be thrown.

**Command line arguments**

Pass these in when starting the app, like so:

	> node app --port 3456 --apiEndpoint http://example.com/api

**JSON configuration**

If the app finds a `config.json` file in the root, it will use parameters in this file where possible.

	{
		"port": 3456
		"api": {
			"endpoint": "http://example.com/api"
		}
	}

**Environment variables**

Finally, configuration will be picked up from the environment. This is most easily done by writing a `config.env` file (or similar):

	export PORT=3456
	export API_ENDPOINT='http://example.com/api'

Then you can source the file like `. config.env`.

Environment
-----------

One way or another, the following configuration parameters should be set up: `OPENBADGER_URL`, `OPENBADGER_SECRET`, `MANDRILL_KEY`.

License
-------

This project is licensed under the Mozilla Public License, version 2.0. See the included `LICENSE` for more details.