// Get dependancies
var _ = require('underscore'),
	Backbone = require('backbone'),
	vent = require('./vent'),
	$ = Backbone.$ = require('jquery/dist/jquery'),
	sd = require('sharify').data,
	numberPatternChallengeTemplate = function () { return require('../templates/numberPatternChallenge.jade').apply(null, arguments); },
	numberPatternQAndA = function () { return require('../templates/numberPatternQAndA.jade').apply(null, arguments); };

var PatternChallenge = module.exports = {
	Views: {}
};

PatternChallenge.Views.Challenge = Backbone.View.extend({
	className: 'modal__box modal__number-pattern-challenge',

	events: {
		'keyup .q-and-a__answers input': 'canSubmit',
		'click .btn--submit': 'saveAnswer'
	},

	initialize: function(options) {
		this.questionsCopy = options.questions.slice();
		
		this.vent = vent;
	},

	render: function() {
		var template = numberPatternChallengeTemplate();
		this.questions = this.questionsCopy.slice();
		this.totalQuestions = this.questions.length;
		this.progress = 1;
		this.currentAnswers = [];
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
			template = numberPatternQAndA({
				question: randomQuestion,
				progress: this.progress,
				totalQuestions: this.totalQuestions
			});
		
		this.$el.find('.q-and-a').empty().append(template);
		return this;
	},

	canSubmit: function() {
		var unanswered = _.reject(this.$('.q-and-a__answers input'), function(input) {
			return $(input).val().length !== 0;
		});
		
		if(unanswered.length === 0)
			return this.$('.btn--submit').removeAttr('disabled');

		this.$('.btn--submit').attr('disabled', 'disabled');
	},

	saveAnswer: function(ev) {
		var answer = 0,
			self = this;
		
		_.each(this.$('.q-and-a__answers input'), function(input) { 
			answer = answer + parseInt($(input).val(), 10); 
		});

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

