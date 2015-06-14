/*jshint expr: true*/
/*jshint multistr: true*/

var benv = require('benv'),
	sinon = require('sinon'),
	resolve = require('path').resolve,
	_ = require('underscore'),
	ChallengeResult = require('../modules/challengeResult'),
	patternData = require('../data/patternData');

describe('Pattern Challenge View', function () {
	
	var PatternChallenge, view;

	before(function(done){
		benv.setup(function() {
			benv.render(resolve(__dirname, '../index.jade'), 
				{
					
					sd: {},
					sharify: { script: function() {  } }

				}, function() {

					benv.expose({ 
						$: require('jquery')
					});
					PatternChallenge = benv.requireWithJadeify(
						'../modules/patternChallenge.js',
						['patternChallengeTemplate', 'patternQAndA']
					);
					done();
			});
		});
	});

	after(function() {
		benv.teardown();
	});

	beforeEach(function() {
		view = new PatternChallenge.Views.Challenge({
			model: new ChallengeResult.Model({ ChallengeResultId: 1234 }),
			questions: patternData
		});
	});

	afterEach(function() {
		view.remove();
	});

	it('#initialize', function() {
		view.render();
		view.questions.length.should.be.greaterThan(1);
		view.totalQuestions.should.equal(view.questions.length + 1);
		view.progress.should.equal(1);
		view.currentAnswers.length.should.equal(0);
	});

	it('#render', function() {
		view.render();
		(typeof view.$el.find('.modal__content__heading--pattern')).should.be.defined;
	});

	it('#getRandomQuestion', function() {
		var orgLength = patternData.length,
			question;
		view.questions.length.should.equal(orgLength);
		question = view.getRandomQuestion();
		view.questions.length.should.equal(orgLength - 1);
	});

	it('#renderRandomQuestion', function() {
		view.render().renderRandomQuestion();
		view.$el.find('.q-and-a__answer').length.should.equal(_.size(view.currentQuestion.answers));
		view.$el.find('.questions-progress').html().should.equal('1');
		view.$el.find('.questions-left').html().should.equal(view.totalQuestions.toString());
	});

	it('#highlightsSelection', function() {
		var $answer;
		view.render();
		view.$el.find('.btn--submit').attr('disabled').should.equal('disabled');
		$answer = view.$el.find('.q-and-a__answer').first().trigger('click');
		$answer.hasClass('q-and-a__answer--active').should.equal(true);
		(typeof view.$el.find('.btn--submit').attr('disabled')).should.equal('undefined');
	});

	it('#saveAnswer', function() {
		var dfd = new $.Deferred();
			modelStub = sinon.stub(view.model, 'save').returns(dfd.promise());
		
		view.render();
		
		dfd.resolve();
		
		view.$el.find('.q-and-a__answer').first().trigger('click');
		view.$el.find('.btn--submit').trigger('click');
		
		view.currentAnswers[0].should.equal(view.currentSelection);
		
		_.each(view.questions, function(question) {
			view.currentAnswers.push(question.answers.A);	
		});
		
		view.$el.find('.q-and-a__answer').first().trigger('click');
		view.$el.find('.btn--submit').trigger('click');
		
		modelStub.calledOnce.should.be.ok;
	});

	
});