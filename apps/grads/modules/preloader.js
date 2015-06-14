// Specify our dependancies
var $  = require('jquery/dist/jquery');

// Self initialized dependencies
require('../../../bower_components/greensock-js/src/uncompressed/TweenMax');

var Preloader = function() {
	this.$el = $('.loading');
	this.timeline = new TimelineLite(); 
	this.timeline.add(TweenMax.to(this.$el, 1, { 
		ease: Circ.easeInOut,
		css: {
			x: '320px',
			opacity: 1
		}
	}));

	this.timeline.pause();
};

Preloader.prototype.addMessage = function(message) {
	this.$el.find('.loading__text').empty().append(message);
};

Preloader.prototype.show = function(message) {
	var dfd = new $.Deferred(),
		self = this;

	if (message)
		this.addMessage(message);

	this.timeline.restart();
	this.timeline.eventCallback('onComplete', function() {
		self.$el.addClass('loading--animation');
		dfd.resolve();
	});

	return dfd.promise();
};

Preloader.prototype.hide = function() {
	var dfd = new $.Deferred();

	this.$el.removeClass('loading--animation');

	this.timeline.reverse();
	this.timeline.eventCallback('onReverseComplete', dfd.resolve);

	return dfd.promise();
};

module.exports = Preloader;
