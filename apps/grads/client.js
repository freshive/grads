// Specify our dependancies
var Backbone = require('backbone'),
	$ = Backbone.$ = require('jquery/dist/jquery'),
	sd = require('sharify').data,
	FbPromise = require('../../bower_components/jquery.fbpromise/jquery.fbpromise'),
	Preloader = require('./modules/preloader'),
	ViewManager = require('./modules/viewManager'),
	Router = require('./router'),
	Graduate = require('./modules/graduate'),
	// Testing
	graduateData = require('./test/test_data/graduate-desktop');

require('./modules/nprogress')();

require('./modules/notifier')({
	positionClass: 'toast-bottom-left', 
	showMethod: 'slideDown',
	timeOut: '5000',
	closeButton: true
});

// Initialize out application
module.exports.init = function() {
	
	var preloader = new Preloader(),
		facebookApi = window.fb = new FbPromise({
			appId: sd.FACEBOOK_APP.ID
		});

	$.when(preloader.show() ,facebookApi.init())
		.then($.proxy(preloader.hide, preloader))
		.then(function() {
			var g = new Graduate.Model();
			FB.Canvas.setSize({height: 800});
			new Router({
				viewManager: new ViewManager({
					$viewHolder: $('.page')
				}),
				facebookApi: facebookApi,
				graduate: g
			});
			Backbone.history.start({
				pushState: false
			});
		});
};