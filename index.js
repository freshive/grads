// Specify our dependancies
var c = require('./config'),
	express = require('express'),
	path = require('path'),
	app = express();



// Setup our application server
app.use(express.favicon());
app.use(express.compress());
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());

// Setup our environment
if ('development' == c.NODE_ENV) {
    app.use(express.errorHandler());
    app.use(require('connect-livereload')({ port: c.LIVERELOAD_PORT }));
}

// Mount our paths
app.use(express.static(path.resolve(__dirname, './public')));

// Mount our apps
app.use(require('./apps/grads'));

// Finally start the server... VROOM!
app.set('domain', c.WEBSITE_URL);
app.listen(c.WEBSITE_PORT, function() {
  console.log('VROOM VROOM engine started at ' + c.WEBSITE_URL + c.WEBSITE_PORT);
  if(process.send) process.send('listening');
});

-----
// Specify our dependancies
var c = require('./config'),
  express = require('express'),
  path = require('path'),
  app = express();



// Setup our application server
app.use(express.favicon());
app.use(express.compress());
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());

// Setup our environment
if ('development' == c.NODE_ENV) {
    //app.use(express.errorHandler());
    //app.use(require('connect-livereload')({ port: c.LIVERELOAD_PORT }));
}

// Mount our paths
app.use('/grads2015/', express.static(path.resolve(__dirname, './public')));

// Mount our apps
app.use('/grads2015/', require('./apps/grads'));

// Finally start the server... VROOM!
app.set('domain', 'https://fnbsocialmedia.co.za/Grads2015/');
app.listen(process.env.PORT, function() {
  console.log('VROOM VROOM engine started at ' + process.env.PORT + process.env.PORT);
  if(process.send) process.send('listening');
});





