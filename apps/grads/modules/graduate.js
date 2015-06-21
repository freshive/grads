// Get dependancies
var _ = require('underscore'),
	Backbone = require('backbone'),
	$ = Backbone.$ = require('jquery/dist/jquery'),
	vent = require('./vent'),
	sd = require('sharify').data,
	startTemplate = function () { return require('../templates/start.jade').apply(null, arguments); },
	profileTemplate = function () { return require('../templates/profile.jade').apply(null, arguments); },
	thinkerTypeTemplate = function () { return require('../templates/thinkertype.jade').apply(null, arguments);	},
	badgesTemplate = function () { return require('../templates/badges.jade').apply(null, arguments); },
	finisherTemplate = function () { return require('../templates/finisher.jade').apply(null, arguments); },
	pageTemplates = {
		intro: function () { return require('../templates/intro.jade').apply(null, arguments); },
		about: function () { return require('../templates/about.jade').apply(null, arguments); },
		math: function () { return require('../templates/math.jade').apply(null, arguments); },
		commerce: function () { return require('../templates/commerce.jade').apply(null, arguments); },
		others: function () { return require('../templates/others.jade').apply(null, arguments); }
	};

var Graduate = module.exports = {
	Views: {}
};

Graduate.Model = Backbone.Model.extend({
	idAttribute: 'Token',

	urlRoot: sd.API_URL + 'graduates',

	initialize: function() {
		window.grad = this;
		this.listenTo(this, 'change:Firstname', this.showProfileBar, this);
		this.listenTo(this, 'change:TotalPoints', this.showProfileBar, this);
	},

	defaults: {
		Id: 0,
		ThinkerType: 0
	},

	isLoggedIn: function() {
		return this.get('Id') !== 0;
	},

	showProfileBar: function() {
		new Graduate.Views.Profile({
			model: this
		});
	},

	getGraduateTypeName: function() {
		switch(this.get('ThinkerType')) {
		case 1:
			return 'Engineer';
		case 2:
			return 'Commerce';
		case 3:
			return 'Computer science';
		case 4:
			return 'Actuarial & Quants';
		default:
			return 'commerce';
		}
	}
});

Graduate.Views.Start = Backbone.View.extend({
	className: 'page__view page__view--initial-state',

	initialize: function(options) {
		this.vent = vent;
		this.facebookApi = options.facebookApi;
	},

	render: function() {
		this.$el.empty().append(startTemplate());
		return this;
	},

	events: {
		'click .js-fetch-user': 'determineUserPath'
	},

	animations:  [
		{
			tweenFunction: 'from',
			element: '.logo',
			duration: 1,
			properties: { y: '-50', x: '-50',   opacity: 0, ease: 'Circ.easeInOut', delay: -0.5 },
		},
		{
			tweenFunction: 'to',
			element: '.logo__shadow--bottom',
			duration: 2,
			properties: {  height: '520px', opacity: 1 }
		}
	],

	determineUserPath: function() {
		var self = this;
		this.vent.trigger('notify', { type: 'info', message: 'Hold Tight. We are working with Facebook to verify your information.'  });
		return this.getUserFromFacebook()
			.then($.proxy(this.getUserFromServer, this))
			.then($.proxy(this.navigateUser, this))
			.fail(function(err) { console.log(err); self.vent.trigger('notify', { type: 'info', message: 'Graduate not found. Please register first.'  }); });
	},

	getUserFromFacebook: function() {
		return fb.getLoginStatus({ scope: 'email' });
	},

	getUserFromServer: function(data) {
		this.model.set('Token', data.authResponse.accessToken);
		return this.model.fetch({ reset: true });
	},

	navigateUser: function() {
		if(this.model.get('ThinkerType') === 0)
			return this.vent.trigger('route:thinkertype');

		this.vent.trigger('route:intro');
	}

});

Graduate.Views.Profile = Backbone.View.extend({
	el: '.user-status-bar',

	initialize: function() {
		this.render();
	},

	render: function() {
		this.$el.empty().append(profileTemplate({
			model: this.model.toJSON()
		}));
		this.$el.find('.graduate-overview-bar').fadeIn();
		return this;
	},

	toggleAboutBtn: function() {
		this.$el.find('.btn--about').toggle();
	},
});

Graduate.Views.Page = Backbone.View.extend({
	className: 'page__view page__view--initial-state',

	initialize: function(options) {
		this.page = options.page;
		this.animations = options.animations || this.animations;
		this.thinkertype = options.thinkertype;
	},

	render: function() {
		this.$el.empty().append(pageTemplates[this.page]({ thinkertype: this.thinkertype }));
		return this;
	},

	afterRender: function() {
		this.$('.btn--about').slideDown();
	},

	animations:  [
		{
			tweenFunction: 'allFrom',
			element: '.logo',
			duration: 1,
			properties: { y: '-50', x: '-50',   opacity: 0, ease: 'Circ.easeInOut', delay: -0.5 },
			delay: 0.5
		},
		{
			tweenFunction: 'to',
			element: '.logo__shadow--bottom',
			duration: 2,
			properties: {  height: '520px', opacity: 1 }
		}
	]
});

Graduate.Views.ThinkerType = Backbone.View.extend({
	className: 'page__view page__view--initial-state',

	events: {
		'click .graduate-thinkertype': 'setGraduateThinkerType'
	},

	animations:  [
		{
			tweenFunction: 'to',
			element: '.curtain--bottom',
			duration: 0.5,
			properties: {  height: '390px' }
		},
		{
			tweenFunction: 'allFrom',
			element: '.logos__animation',
			duration: 0.5,
			properties: { y: '-50', x: '-50',   opacity: 0, ease: 'Circ.easeInOut' },
			delay: 0.5
		},
		{
			tweenFunction: 'allTo',
			element: '.logo__shadow--bottom',
			duration: 2,
			properties: {  height: '420px', opacity: 1 }
		}
	],

	initialize: function() {
		this.vent = vent;
	},

	render: function() {
		this.$el.empty().append(thinkerTypeTemplate());
		return this;
	},

	setGraduateThinkerType: function (ev) {
		var thinkertype = $(ev.currentTarget).data('thinkertype');
		this.model.set('ThinkerType', thinkertype);
		this.model.save().then($.proxy(this.model.fetch, this.model)).then($.proxy(this.navigateUser, this));
	},

	navigateUser: function () {
		this.vent.trigger('route:intro');
	}
});

Graduate.Views.Badges = Backbone.View.extend({
	className: 'modal__box modal__badges',

	render: function() {
		this.$el.empty().append(badgesTemplate({
			collection: _.where(this.model.get('Badges'), { Obtained: true })
		}));
		return this;
	},

	animations: [
		{
			tweenFunction: 'allTo',
			element: '.leaderboard__list li',
			duration: 0.25,
			properties: { x: '0',   opacity: 1, ease: 'Circ.easeInOut' },
			delay: 0.25
		}
	]
});

Graduate.Views.Finisher = Backbone.View.extend({
	className: 'modal__box modal__binary-challenge modal__description-challenge',

	render: function() {
		this.$el.empty().append(finisherTemplate( this.model.toJSON() ));
		return this;
	},

	animations: []
});