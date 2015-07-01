// Get dependancies
var _ = require('underscore'),
  vent = require('./vent'),
  Backbone = require('backbone'),
  $ = Backbone.$ = require('jquery/dist/jquery'),
  sd = require('sharify').data,
  puzzleChallengeTemplate = function () { return require('../templates/puzzleChallenge.jade').apply(null, arguments); },
  puzzlePieceCompleteTemplate = function () { return require('../templates/puzzlePieceComplete.jade').apply(null, arguments); },
  finalPuzzleTemplate = function () { return require('../templates/finalPuzzle.jade').apply(null, arguments); },
  puzzleTemplate = function () { return require('../templates/puzzle.jade').apply(null, arguments); };

var PuzzleChallenge = module.exports = {
  Views: {}
};

PuzzleChallenge.Views.Challenge = Backbone.View.extend({
  className: 'modal__box modal__puzzle-challenge',

  events: {
    'click .puzzle-piece': 'showQuestion',
    'click .submit-question': 'submitQuestion',
    'keyup .puzzle-input': 'checkAnswer'
  },

  initialize: function(options) {
    this.questions = options.questions.slice();
    this.totalQuestions = this.questions.length;
    this.progress = 1;
    this.currentAnswers = [];
    this.vent = vent;
  },

  render: function() {
    var template = puzzleTemplate({
      Challenges: this.questions
    });
    this.$el.empty().append(template);
    this.delegateEvents();
    return this;
  },

  showQuestion: function(ev) {
    var $piece = $(ev.currentTarget);
    var order = $piece.data('puzzleorder');
    var question = this.currentQuestion = this.questions[parseInt(order, 10) - 1];

    if($piece.hasClass('piece-answered')) return;

    var template = puzzleChallengeTemplate({
        question: question
      });
    this.$el.find('.puzzle-questions').empty().append(template);
  },

  checkAnswer: function() {
    var answer = $('.puzzle-input').val().toLowerCase();

    if(answer !== this.currentQuestion.answer[0].toLowerCase())
      return this.$el.find('.submit-question').attr('disabled', 'disabled');

    this.$el.find('.submit-question').removeAttr('disabled');
  },

  submitQuestion:  function(ev) {
    var order = this.currentQuestion.order;
    var piece = this.$el.find('.puzzle-piece')[order - 1];
    $(piece).attr('src', 'images/puzzle/0' + order + '02.png').addClass('piece-answered');
    this.currentAnswers.push(this.currentQuestion.answer);

    if(this.currentAnswers.length === this.totalQuestions)
      return this.renderPuzzle();

    this.$el.find('.puzzle-questions').empty().append(puzzlePieceCompleteTemplate());
  },

  renderPuzzle: function(){
    var self = this;
    this.$el.find('.puzzle__content').empty().append(finalPuzzleTemplate());
    $.getScript('js/canvasPuzzle.js').done(function() {
      var puzzle = new Puzzle('puzzleParent', {
        src: 'images/puzzle.jpg',
        screenSize: 'h640',
        backgroundColor: '#006666'
      });
      setTimeout(function() {
        puzzle.init();
        self.checkPuzzleSolved(puzzle);
      }, 1000);
    });
  },

  checkPuzzleSolved: function(puzzle) {
    var self = this;
    var interval = setInterval(function() {
      if(!puzzle.isSolved())
        return;
      clearInterval(interval);
      puzzle.unload();
      self.completed();
    }, 500);
  },

  completed: function() {
    var self = this;
    this.model.set('CompletedPuzzle', true);
    this.model.save().then(function() {
      self.vent.trigger('route:dashboard');
    });
  },

  animations: []
});