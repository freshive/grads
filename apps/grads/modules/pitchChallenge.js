// Get dependancies
var _ = require('underscore'),
	Backbone = require('backbone'),
	vent = require('./vent'),
	$ = Backbone.$ = require('jquery/dist/jquery'),
	sd = require('sharify').data,
	sd = sd.FACEBOOK_APP ? sd.FACEBOOK_APP : sd,
	pitchChallengeTemplate = function () { return require('../templates/pitchChallenge.jade').apply(null, arguments); },
	pitchLikesTemplate = function () { return require('../templates/pitchLikes.jade').apply(null, arguments); };

var PitchChallenge = module.exports = {
	Views: {}
};

PitchChallenge.Views.Challenge = Backbone.View.extend({
	className: 'modal__box modal__pitch-challenge',

	events: {
		'keyup .pitch__input': 'checkinputStatus',
		'click .btn--submit': 'saveMessage',
		'click .btn--finish': 'submitMessage',
		'click .btn--try-again': 'resetChallenge'
	},

	initialize: function(options) {
		this.maxLength = 300;
		this.getLikesInterval = 3000;
		this.numLikes = 10;
		this.pitchTestNum = this.returnRandomNumber(options.pitchData.length);
		this.pitchTest = options.pitchData[this.pitchTestNum];
		this.vent = vent;
		this.facebookApi = options.facebookApi;
		this.graduate = options.graduate;
		this.currentLikes = 0;
		this.postParams = {
			link: sd.URL,
			picture: sd.IMAGE,
			name: sd.NAME,
			description: sd.DESCRIPTION
		};
		this.streamPerms = options.streamPerms;
    this.view = this;
	},

	returnRandomNumber: function(end) {
		return Math.floor((Math.random() * end));
	},

	render: function(reset) {
		var self = this;

		this.hasPosted().then(function () {
			var template = self.model.get('Answers') ?
				pitchLikesTemplate() :
				pitchChallengeTemplate(self.pitchTest);

			self.$el.empty().append(template);
			self.pollFacebookLikes();
			self.delegateEvents();
		});

		return this;

	},

	wordHasBeenUsed: function(inputText) {
		var self = this;
		inputText = inputText.toLowerCase();
		$.each(this.pitchTest.words, function(index, word) {
			word = word.toLowerCase();
			if(inputText.indexOf(word) !== -1)
				return $(self.$el.find('.pitch__words li').get(index)).addClass('pitch__words__word--active');
			$(self.$el.find('.pitch__words li').get(index)).removeClass('pitch__words__word--active');
		});
	},

	canPost: function(inputText) {
		var activeWords = this.$el.find('.pitch__words__word--active');
		if(activeWords.length === this.pitchTest.words.length
			&& inputText.length <= this.maxLength)
			return this.$el.find('.btn--submit').removeAttr('disabled');

		this.$el.find('.btn--submit').attr('disabled', 'disabled');
	},

	checkinputStatus: function(ev) {
		var inputText = $(ev.currentTarget).val();
		this.wordHasBeenUsed(inputText);
		this.canPost(inputText);
	},

	getFacebookStreamPerms: function() {
		return this.facebookApi.login(this.streamPerms);
	},

	postMessageToFb: function(inputText) {
		this.postParams.message = inputText;
		return this.facebookApi.post('/me/feed', this.postParams);
	},

	getNumLikesFromFb: function(id) {
		return this.facebookApi.get(id);
	},

	updateLikes: function(message) {
		var $numlikes = this.$el.find('#numlikes');


		if(message && message.likes) {

			if(this.currentLikes !== message.likes.data.length) {
				this.currentLikes = message.likes.data.length;
				this.vent.trigger('notify', { type: 'info', message: 'Wahoo. You received a Facebook like.'  });
				$numlikes.html(message.likes.data.length);
			}

			return message.likes.data.length;

		}

		$numlikes.html(0);
	},

	pollFacebookLikes: function() {
		var self = this;
			fbId = this.model.get('Answers');
		if(fbId)
			this.interval = setInterval(function() {
				self.getNumLikesFromFb(fbId)
					.then($.proxy(self.updateLikes, self))
					.then($.proxy(self.canSubmit, self));
			}, this.getLikesInterval);
	},

	saveMessage: function(ev) {
		var inputText = this.$el.find('.pitch__input').val(),
			self = this;

		self.vent.trigger('notify', { type: 'info', message: 'Posting your message to Facebook.'  });
		return this.getFacebookStreamPerms(this.streamPerms)
			.then(function() { return self.postMessageToFb(inputText); })
			.then(function(message) {
				self.vent.trigger('notify', { type: 'info', message: 'Posting was successful.'  });
				self.model.set('Answers', message.id);
				self.render();
			})
			.fail(function(err) {
				console.log(err);
			});
	},

	resetChallenge: function () {
		clearInterval(this.interval);
		this.model.unset('Answers');
		this.$el.empty().append(pitchChallengeTemplate(this.pitchTest));
	},

	hasPosted: function () {
		var q = 'https://graph.facebook.com/v2.0/fql?q={"stream":"select post_id FROM stream where source_id=me() and app_id =' + sd.ID +'"}&access_token=' + this.graduate.get('Token'),
			self = this;
		return $.get(q).then(function (obj) {
			if(obj.data.length > 0 && obj.data[0].fql_result_set[0]) {
				self.model.set('Answers', obj.data[0].fql_result_set[0].post_id);
			}

		});
	},

	canSubmit: function (num) {
		if(num >= this.numLikes) {
			this.$('.btn--finish').removeAttr('disabled');
		}
	},

	submitMessage: function() {
		var self = this;
		return this.model.save().then(function() {
			self.vent.trigger('challenge:submit');
		});
	},

	remove: function () {
		clearInterval(this.interval);
		Backbone.View.prototype.remove.call(this);
	},

	animations: []
});

