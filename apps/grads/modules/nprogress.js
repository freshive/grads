var $ = require('jquery/dist/jquery'),
	vent = require('./vent');
require('../../../bower_components/nprogress/nprogress');

module.exports = function(options) {
	$(document).ajaxStart(NProgress.inc);
  	$(document).ajaxStop(NProgress.done);
 	$(document).ajaxError(NProgress.done);
 	vent.on('progress:start', NProgress.inc, NProgress);
 	vent.on('progress:done', NProgress.done, NProgress);
};