// Specify our dependancies
var $  = require('jquery/dist/jquery');
require('../../../bower_components/greensock-js/src/uncompressed/TweenMax');

var ViewManager = module.exports = function(options) {
	options = options || {};
	this.$viewHolder = options.$viewHolder;
	this.timeline = new TimelineMax();
};

ViewManager.prototype.switchView = function(view) {
	var self = this;
	this.nextView = view;
	view.timeline = this.timeline;
	view.render();

	if(this.currentView)
		return this.reverseViewAnimation()
			.then($.proxy(this.currentView.remove, this.currentView))
			.then($.proxy(this.setupView, this))
			.then($.proxy(this.startViewAnimation, this));

	this.setupView();
	return this.startViewAnimation();
};

ViewManager.prototype.setupView = function () {
	var view = this.currentView  = this.nextView,
		$curtains = view.$el.find('.curtain');

	this.timeline.clear();
	this.timeline.timeScale(1);
	this.timeline.add(TweenMax.to($curtains, 0.5, { height: '435px' }));
	this.timeline.add(TweenMax.to($curtains, 0.5, { rotation: -10 }));
	this.timeline.add(TweenMax.to(view.$el, 0.25, { top: '37px', delay: -1 }));
	this.timeline.add(TweenMax.to(view.$el.find('.page__view__content'), 0.25, { top: 0, opacity: 1 }));
	$.each(view.animations, $.proxy(function (index, animation) {
		var tween = TweenMax[animation.tweenFunction](
			view.$el.find(animation.element),
			animation.duration,
			animation.properties,
			animation.delay
		);
		this.timeline.add(tween);
	}, this ));

	this.$viewHolder.prepend(view.el);
	this.timeline.pause();
	view.$el.removeClass('page__view--initial-state');
};

ViewManager.prototype.startViewAnimation = function() {
	var dfd = new $.Deferred();
	this.timeline.restart();
	this.timeline.eventCallback('onComplete', dfd.resolve);
	return dfd.promise();
};

ViewManager.prototype.reverseViewAnimation = function() {
	var dfd = new $.Deferred();
	this.timeline.reverse();
	this.timeline.timeScale(2);
	this.timeline.eventCallback('onReverseComplete', dfd.resolve);
	return dfd.promise();
};