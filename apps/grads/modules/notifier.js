var _ = require('underscore'),
	$ = require('jquery/dist/jquery'),
	vent = require('./vent'),
	sd = require('sharify').data;

require('../../../bower_components/toastr/toastr');

function showToast(params) {
	toastr[params.type](params.message);
}

module.exports = function(options) {
	var notifications = sd.notifier;

	_.extend(toastr.options, options);

	if(notifications) {
		for ( var prop in notifications ) {
			if(toastr[prop])
				toastr[prop](notifications[prop]);
		}
	}

	vent.on('notify', showToast);
};