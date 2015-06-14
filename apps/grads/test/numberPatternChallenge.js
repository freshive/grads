/*jshint expr: true*/
/*jshint multistr: true*/

var benv = require('benv'),
	sinon = require('sinon'),
	resolve = require('path').resolve,
	_ = require('underscore'),
	ChallengeResult = require('../modules/challengeResult'),
	numberPatternData = require('../data/numberPatternData');

describe('Pattern Challenge View', function () {
	
	var NumberPatternChallenge, view;

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
					NumberPatternChallenge = benv.requireWithJadeify(
						'../modules/numberPatternChallenge.js',
						['numberPatternChallengeTemplate', 'numberPatternQAndA']
					);
					done();
			});
		});
	});

	after(function() {
		benv.teardown();
	});

	beforeEach(function() {
		view = new NumberPatternChallenge.Views.Challenge({
			model: new ChallengeResult.Model({ ChallengeResultId: 1234 }),
			questions: numberPatternData
		});
	});

	afterEach(function() {
		view.remove();
	});

	it('#initialize', function() {
		view.questions.length.should.be.greaterThan(1);
		view.totalQuestions.should.equal(view.questions.length);
		view.progress.should.equal(1);
		view.currentAnswers.length.should.equal(0);
	});

	it('#getRandomQuestion', function() {
		var orgLength = numberPatternData.length,
			question;
		view.questions.length.should.equal(orgLength);
		question = view.getRandomQuestion();
		view.questions.length.should.equal(orgLength - 1);
	});

	it('#renderRandomQuestion', function() {
		view.render();
		view.$el.find('.q-and-a__answer').length.should.equal(_.size(view.currentQuestion.answers));
		view.$el.find('.questions-progress').html().should.equal('1');
		view.$el.find('.questions-remaining').html().should.equal(view.totalQuestions.toString());
	});

	it('#canSubmit', function() {
		var inputs;
		view.render();
		view.$('.btn--submit').attr('disabled').should.equal('disabled');
		view.$('input').val(1234).trigger('keyup');
		(typeof view.$('.btn--submit').attr('disabled')).should.equal('undefined');
		view.$('input').val('').trigger('keyup');
		view.$('.btn--submit').attr('disabled').should.equal('disabled');
	});

	it('#saveAnswer', function() {
		var dfd = new $.Deferred(),
			inputLength = 0,
			modelStub = sinon.stub(view.model, 'save').returns(dfd.promise());
		
		view.render();
		
		dfd.resolve();
		
		inputLength =  view.$('input').val(1234).trigger('keyup').length;
		view.$el.find('.btn--submit').trigger('click');
		
		view.currentAnswers[0].should.equal(1234 * inputLength);
		
		_.each(view.questions, function(question) {
			view.currentAnswers.push(1234);	
		});
		
		view.$('input').val(1234).trigger('keyup');
		view.$el.find('.btn--submit').trigger('click');
		
		modelStub.calledOnce.should.be.ok;
	});
	
});