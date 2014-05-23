var express = require('express'),
	routes = require('./routes'),
	path = require('path'),
	config = require('./config'),
	async = require('async'),
	gpio = require('pi-gpio'),
	app = express();

app.configure(function(){
	app.set('port', process.env.PORT || 3000);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.favicon(__dirname + '/public/favicon.ico'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.static(path.join(__dirname, 'public')));
});

var auth = express.basicAuth('', process.env.PASSWORD);

app.get('/', auth, routes.index);

function delayPinWrite(pin, value, callback) {
	setTimeout(function() {
		gpio.write(pin, value, callback);
	}, config.RELAY_TIMEOUT);
}

app.get("/api/ping", auth, function(req, res) {
	res.json("pong");
});

app.get("/api/garage/open", function(req, res) {
	if (req.param('password') == process.env.PASSWORD) {
		async.series([
			function(callback) {
				// Open pin for output
				gpio.open(config.RIGHT_GARAGE_PIN, "output", callback);
			},
			function(callback) {
				// Turn the relay on
				gpio.write(config.RIGHT_GARAGE_PIN, config.RELAY_ON, callback);
			},
			function(callback) {
				// Turn the relay off after delay to simulate button press
				delayPinWrite(config.RIGHT_GARAGE_PIN, config.RELAY_OFF, callback);
			},
			function(err, results) {
				setTimeout(function() {
					// Close pin from further writing
					gpio.close(config.RIGHT_GARAGE_PIN);
					// Return json
					res.json("ok");
				}, config.RELAY_TIMEOUT);
			}
		]);
	} else  {
		res.json('incorrect password :O');
	}
});

app.post("/api/garage/right", auth, function(req, res) {
	async.series([
		function(callback) {
			// Open pin for output
			gpio.open(config.RIGHT_GARAGE_PIN, "output", callback);
		},
		function(callback) {
			// Turn the relay on
			gpio.write(config.RIGHT_GARAGE_PIN, config.RELAY_ON, callback);
		},
		function(callback) {
			// Turn the relay off after delay to simulate button press
			delayPinWrite(config.RIGHT_GARAGE_PIN, config.RELAY_OFF, callback);
		},
		function(err, results) {
			setTimeout(function() {
				// Close pin from further writing
				gpio.close(config.RIGHT_GARAGE_PIN);
				// Return json
				res.json("ok");
			}, config.RELAY_TIMEOUT);
		}
	]);
});

app.listen(app.get('port'));
