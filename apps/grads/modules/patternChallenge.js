// Get dependancies
var _ = require('underscore'),
	vent = require('./vent'),
	Backbone = require('backbone'),
	$ = Backbone.$ = require('jquery/dist/jquery'),
	sd = require('sharify').data,
	patternChallengeTemplate = function () { return require('../templates/patternChallenge.jade').apply(null, arguments); },
	patternQAndA = function () { return require('../templates/patternQAndA.jade').apply(null, arguments); };

var PatternChallenge = module.exports = {
	Views: {}
};

PatternChallenge.Views.Challenge = Backbone.View.extend({
	className: 'modal__box modal__pattern-challenge',

	events: {
		'click .q-and-a__answer': 'highlightSelection',
		'click .btn--submit': 'saveAnswer'
	},

	initialize: function(options) {
		this.questions = options.questions.slice();
		this.totalQuestions = this.questions.length;
		this.progress = 1;
		this.currentAnswers = [];
		this.vent = vent;
	},

	render: function() {
		var template = patternChallengeTemplate();
		this.$el.empty().append(template);
		this.delegateEvents();
		this.renderRandomQuestion();
		return this;
	},

	getRandomQuestion: function() {
		var index =  Math.floor(Math.random() * this.questions.length),
			question = this.questions[index];
		
		this.questions.splice(index, 1);
		
		return question;
	},

	renderRandomQuestion: function() {
		var randomQuestion = this.currentQuestion = this.getRandomQuestion(),
			template = patternQAndA({
				question: randomQuestion,
				progress: this.progress,
				totalQuestions: this.totalQuestions
			});
		this.$el.find('.q-and-a').empty().append(template);
	},

	highlightSelection: function(ev) {
		this.$el.find('.q-and-a__answer').removeClass('q-and-a__answer--active');
		this.currentSelection = $(ev.currentTarget)
			.addClass('q-and-a__answer--active')
			.data('answer');
		this.$el.find('.btn--submit').removeAttr('disabled');
	},

	saveAnswer: function(ev) {
		var answer = this.currentSelection,
			self = this;

		if(answer === this.currentQuestion.correct)
			this.currentAnswers.push(answer);

		if(this.questions.length === 0) {
			this.model.set('Answers', this.currentAnswers.join(','));
			return this.model.save().then(function() {
				self.vent.trigger('challenge:submit');	
			});
		}

		this.progress = this.progress + 1;
		this.renderRandomQuestion();
	},

	animations: []
});

