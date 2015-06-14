// Get dependancies
var _ = require('underscore'),
	Backbone = require('backbone'),
	$ = Backbone.$ = require('jquery/dist/jquery'),
	vent = require('./vent'),
	dashboardTemplate = function () { return require('../templates/dashboard.jade').apply(null, arguments); };

require('../../../bower_components/greensock-js/src/uncompressed/TweenMax');

var Dashboard = module.exports = {
	Views: {}
};

var Base = Dashboard.Views.Base = Backbone.View.extend({
	className: 'page__view page__view--initial-state',

	events: {
		'click .show-badges': 'getBadges',
		'click .show-leaderboard': 'getLeaderboard',
		'click .modal__close': 'removeModal',
		'click .logo': 'showChallengeDescrip',
		'click .btn--start': 'startChallenge',
		'click .btn--resume': 'reloadDashboard'
	},

	initialize: function(options) {
		this.vent = vent;
		this.leaderboard = options.leaderboard;
		this.challenges = options.challenges;
		this.modalDescription = options.modalDescription;
		this.modalResult = options.modalResult;
		this.badges = options.badges;
		this.finisher = options.finisher;
		this.vent.on('challenge:submit', this.showChallengeResults, this);
	},
	
	render: function() {
		this.$el.empty().append(dashboardTemplate({
			thinkerType: this.model.getGraduateTypeName(),
			model: this.model.toJSON()
		}));
		this.$modal = this.$el.find('.modal');
		this.$overlay = this.$el.find('.overlay');
		this.timeline = new TimelineMax();
		return this;
	},

	getBadges: function () {
		this.insertModal(this.badges);
	},

	getLeaderboard: function () {
		this.insertModal(this.leaderboard);
	},

	showChallengeDescrip: function(ev) {
		if($(ev.currentTarget).parent().hasClass('challenge--completed')) return false;
		var challengeNum = $(ev.currentTarget).data('challenge'),
			challenge = this.currentChallenge = _.find(this.model.get('Challenges'), function(challenge) {
				return challengeNum === challenge.Order;  });
		
		this.modalDescription.model.set(challenge);
		this.insertModal(this.modalDescription);
	},

	showChallengeResult: function() {
		var self = this,
			challenge = _.find(this.model.get('Challenges'), function(challenge) { 
				return self.currentChallenge.ChallengeId === challenge.ChallengeId;  }),
			badge = _.find(this.model.get('Badges'), function(badge) { 
				return challenge.ChallengeId === badge.ChallengeId && badge.Obtained;  }),
			viewData = { badge: badge, challenge: challenge };

		this.modalResult.model.set(viewData);
		this.insertModal(this.modalResult);
		this.$('.modal__close').hide();
	},

	reloadDashboard: function() {
		var self = this;
		this.removeModal().then(function() {
			self.vent.trigger('notify', { type: 'info', message: 'Congratulations, we are updating your information...'  });
			self.vent.trigger('route:reloaddashboard');
		});
	},

	startChallenge: function() {
		var self = this,
			challenge = this.challenges[this.currentChallenge.Order - 1];

		challenge.model.set('ChallengeResultId', this.currentChallenge.ChallengeId);
		
		$.when(this.removeModal(), challenge.model.fetch({ data: { token: this.model.get('Token') }, processData: true })).then(function() {
			self.insertModal(challenge);
		});
	},

	showChallengeResults: function() {
		var self = this;
		$.when(this.removeModal(), this.model.fetch() ).then(function() {
			self.showChallengeResult();
		});
	},

	insertModal: function(modal) {
		this.activeModel = modal.render();
		this.$modal.find('.modal__content').empty().append(modal.el);
		this.setupAnimations(modal);
		this.showModal();
	},

	removeModal: function() {
		return this.hideModal().then($.proxy(this.activeModel.remove, this.activeModel));
	},

	setupAnimations: function(view) {
		this.timeline.clear();
		this.timeline.timeScale(1);
		this.timeline.add(new TweenMax.to(this.$overlay, 0.5, {  width: '100%', ease: 'Circ.easeOut' }));
		this.timeline.add(new TweenMax.to(this.$modal, 0.5, { left: '15px', ease: 'Circ.easeOut', delay: -0.25 }));
		$.each(view.animations, $.proxy(function (index, animation) {
			var tween = TweenMax[animation.tweenFunction](
				view.$el.find(animation.element),
				animation.duration,
				animation.properties,
				animation.delay
			);
			this.timeline.add(tween);
		}, this ));
		this.timeline.add(new TweenMax.to(this.$modal.find('.modal__box'), 0.5, { boxShadow: '15px 15px 3px rgba(0,0,0,0.4)', ease: 'Circ.easeOut' }));
		this.timeline.pause();
	},

	showModal: function() {
		var dfd = new $.Deferred();
		this.timeline.restart();
		this.timeline.eventCallback('onComplete', dfd.resolve);
		return dfd.promise();
	},

	hideModal: function() {
		var dfd = new $.Deferred();
		this.timeline.reverse();
		this.timeline.timeScale(2);
		this.timeline.eventCallback('onReverseComplete', dfd.resolve);
		return dfd.promise();
	},

	afterRender: function() {
		this.$('.btn--about').slideDown();
		if(this.model.get('NumChallengesCompleted') === 3)
			this.insertModal(this.finisher);
	},

	animations:  [
		{
			tweenFunction: 'to',
			element: '.curtain--bottom',
			duration: 0.5,
			properties: {  height: '470px' }
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
			duration: 0.5,
			properties: {  height: '500px', opacity: 1 }
		},
		{
			tweenFunction: 'allFrom',
			element: '.icon-modal',
			duration: 0.5,
			properties: { y: '-50', x: '-50',   opacity: 0, ease: 'Circ.easeInOut' },
			delay: 0.2	
		}
	],
});

Dashboard.Views.Engineering = Base.extend({});
	