// Get dependancies
var _ = require('underscore'),
	vent = require('./vent'),
	Backbone = require('backbone'),
	$ = Backbone.$ = require('jquery/dist/jquery'),
	binaryChallengeTemplate = function () { return require('../templates/binaryChallenge.jade').apply(null, arguments); },
	binaryChallengeQuestionTemplate = function () { return require('../templates/binaryChallengeQuestion.jade').apply(null, arguments); };

require('../../../bower_components/jquery.texthighlighter/src/jquery.texthighlighter');

var BinaryChallenge = module.exports = {
	Views: {}
};

BinaryChallenge.Views.Challenge = Backbone.View.extend({
	className: 'modal__box modal__binary-challenge',

	events: {
		'click .binary__table__highlight-option': 'saveUserSelection',
		'click .binary__answers__word__input__remove': 'removeLastEntry',
		'keypress .binary__answers input': 'saveUserInput',
		'keyup .binary__final-answer': 'checkFinalAnswer',
		'click .btn--submit': 'renderPhaseTwo',
		'click .btn--submit--final': 'submitChallenge'
	},

	initialize: function(options) {
		this.vent = vent;
		this.answer = options.answer;
		this.finalAnswer = options.finalAnswer;
		this.question = options.question;
		this.hashLeft = options.hashLeft;
		this.hashRight = options.hashRight;
		this.hash = _.extend({}, options.hashLeft, options.hashRight);
		this.currentAnswer = '';
		this.fufilledQuestion = '';
    window.test = this;
	},

	render: function() {
		this.$el.empty().append(binaryChallengeTemplate({
			answers: this.setupViewData(this.answer),
			question: this.question,
			hashLeft: this.hashLeft,
			hashRight: this.hashRight
		}));
		this.initializeHighlighter();
		this.enableInput(0);
		this.delegateEvents();
		this.updateQuestionWithAnswer(this.currentAnswer);
		this.insertInput(this.fufilledQuestion);
		this.enableInput(this.fufilledQuestion.length);
		this.toggleRemoveInput(this.fufilledQuestion.length - 1);
		this.toggleSubmit(this.fufilledQuestion);
		this.$el.removeClass('modal__binary-challenge--final');
		return this;
	},

	renderPhaseTwo: function() {
		this.$el.addClass('modal__binary-challenge--final');
		this.$el.empty().append(binaryChallengeQuestionTemplate({
			answer: this.answer
		}));
	},

	setupViewData: function(answer) {
		var retArr = [],
			arr = answer.split(/[ ,]+/);
		arr.forEach(function(word){
			retArr.push(word.split(/(?!$)/));
		});
		return retArr;
	},

	initializeHighlighter: function() {
		if(this.highlighter)
			this.highlighter.destroy();
		$highlighterEl = this.$el.find('.binary__question__selectable');
		$highlighterEl.textHighlighter({
			onBeforeHighlight: $.proxy(this.canHighlight, this),
			onAfterHighlight: $.proxy(this.showPossibleAnswers, this)
		});
		this.highlighter = $highlighterEl.getHighlighter();
		this.highlighter.setColor('#99CCCC');
	},

	canHighlight: function(highlight) {
		if(highlight.startOffset !== 0)
			return false;
		return true;
	},

	showPossibleAnswers: function(el, highlightedText) {
		var results = this.getMatches(highlightedText);
		this.currentSelection = highlightedText;
		this.highlightQuestion(highlightedText, JSON.parse(this.highlighter.serializeHighlights()));
		this.highlightAnswers(results);
	},

	highlightQuestion: function(highlightedText, json) {
		this.highlighter.removeHighlights();
		json[0][1] = highlightedText;
		json[0][4] = highlightedText.length;
		this.highlighter.deserializeHighlights(JSON.stringify(json));
	},

	getMatches: function(highlightedText) {
		var	results = [];
		for(var key in this.hash) {
			var val = this.hash[key].toString();
			if(highlightedText.lastIndexOf(val, 0) !== -1){
				results.push(val);
			}
		}
		return results;
	},

	checkInputMatch: function(inputText) {
		var	question = this.$el.find('.binary__question__selectable').html();
		return question.lastIndexOf(inputText, 0) !== -1;
	},

	highlightAnswers: function(results) {
		var self = this;
		this.removeHighlightFromAnswers();
		_.each(results, function(result) {
			self.$el.find("[data-hashresult='" + result + "']")
				.addClass('binary__table__highlight-option');
		});
	},

	removeHighlightFromAnswers: function() {
		this.$el.find('.binary__table__highlight-option').removeClass('binary__table__highlight-option');
	},

	updateQuestionWithAnswer: function(answer) {
		// Return new question subtracting the answer from
		// the result. Return the answer into a dom element
		// that is not selectable. Prepend the dome element into
		// the remaining question.
		var $unselectableEl = $('<span></span>')
				.addClass('binary__question__unselectable')
				.append(answer),
			$selectableEl = $('<span></span>')
				.addClass('binary__question__selectable')
				.append(this.question.replace(answer, ''));

		this.$el.find('.binary__question').empty()
			.append($unselectableEl[0])
			.append($selectableEl[0]);

		this.initializeHighlighter();
	},

	insertInput: function(fufilledQuestion) {
		var count = 0,
			arr = fufilledQuestion.split(''),
			$inputs = this.$el.find('.binary__answers input').attr('disabled', 'disabled');
		$.each(arr, function(index, val) {
			count = index;
			$($inputs[index]).val(val);
		});
	},

	removeInput: function(index) {
		this.$el.find('.binary__answers input').attr('disabled', 'disabled');
		$(this.$el.find('.binary__answers input')[index]).val('');
	},

	enableInput: function(index) {
		$(this.$el.find('.binary__answers input')[index])
			.removeAttr('disabled').focus();
	},

	toggleRemoveInput: function(index) {
		this.$el.find('.binary__answers__word__input__remove').hide();
		$(this.$el.find('.binary__answers__word__input__remove')[index]).show();
	},

	toggleSubmit: function(fufilledQuestion) {
		var answer = this.answer.replace(/ /g, '');
		if(fufilledQuestion === answer)
			return this.$el.find('.btn--submit').removeAttr('disabled');

		this.$el.find('.btn--submit').attr('disabled', 'disabled');
	},

	removeLastEntry: function() {
		var letterToRemove = this.fufilledQuestion.substr(this.fufilledQuestion.length - 1, this.fufilledQuestion.length);
		this.fufilledQuestion = this.fufilledQuestion.substr(0, this.fufilledQuestion.length - 1);
		this.currentAnswer = this.currentAnswer.substr(0, this.currentAnswer.length - this.hash[letterToRemove].toString().length );
		this.updateQuestionWithAnswer(this.currentAnswer);
		this.removeInput(this.fufilledQuestion.length);
		this.enableInput(this.fufilledQuestion.length);
		this.toggleRemoveInput(this.fufilledQuestion.length - 1);
		this.removeHighlightFromAnswers();
		this.toggleSubmit(this.fufilledQuestion);
	},

	saveUserSelection: function (ev) {
		this.currentAnswer += $(ev.currentTarget).data('hashresult');
		this.fufilledQuestion += $(ev.currentTarget).data('hashkey');
		this.updateQuestionWithAnswer(this.currentAnswer);
		this.insertInput(this.fufilledQuestion);
		this.enableInput(this.fufilledQuestion.length);
		this.toggleRemoveInput(this.fufilledQuestion.length - 1);
		this.removeHighlightFromAnswers();
		this.toggleSubmit(this.fufilledQuestion);
	},

	saveUserInput: function(ev) {
		var inputVal = $(ev.currentTarget).val().toUpperCase(),
			reqResult = this.hash[inputVal];
		this.removeHighlightFromAnswers();
		if(reqResult && this.checkInputMatch(reqResult.toString())) {
			this.currentAnswer += reqResult;
			this.fufilledQuestion += inputVal;
			this.updateQuestionWithAnswer(this.currentAnswer);
			this.insertInput(this.fufilledQuestion);
			this.enableInput(this.fufilledQuestion.length);
			this.toggleRemoveInput(this.fufilledQuestion.length - 1);
			this.toggleSubmit(this.fufilledQuestion);
		}
	},

	checkFinalAnswer: function() {
		var answer = this.$el.find('.binary__final-answer').val().toLowerCase();
		if(answer !== this.finalAnswer.toLowerCase())
			return this.$el.find('.btn--submit--final').attr('disabled', 'disabled');

		this.model.set('Answers', answer);
		return this.$el.find('.btn--submit--final').removeAttr('disabled');
	},

	submitChallenge: function() {
		var self = this;
		this.$el.find('.btn--submit--final').attr('disabled', 'disabled');
		this.model.save().then(function() {
			self.vent.trigger('challenge:submit');
		});
	},

	animations: [
		{
			tweenFunction: 'allFrom',
			element: '.binary__table li',
			duration: 0.2,
			properties: { y: '-10',   opacity: 0, ease: 'Circ.easeInOut' },
			delay: 0.05
		}
	]
});

