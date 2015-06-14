// Specify our dependancies
var express = require('express'),
	c = require('../../config'),
	sharify = require('sharify');

// Inject some constant data into sharify
sharify.data = {
    API_URL: c.API_URL,
    JS_EXT: 'production' == c.NODE_ENV ? '.min.js' : '.js',
    CSS_EXT: 'production' == c.NODE_ENV ? '.min.css' : '.css',
    FACEBOOK_APP: c.FACEBOOK_APP
};

// Configure our application
var app = module.exports = express();
app.use(sharify);
app.use(express.bodyParser());

// Setup our view engine
app.set('views', __dirname);
app.set('view engine', 'jade');

// Setup our routes for our application
app.get('/', function (req, res) {
	res.render('index');
});

app.post('/', function (req, res) {
	res.render('index');
});