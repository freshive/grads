/*jshint expr: true*/
/*jshint multistr: true*/

var benv = require('benv'),
	sinon = require('sinon'),
	resolve = require('path').resolve,
	_ = require('underscore'),
	ChallengeResult = require('../modules/challengeResult'),
	binaryData = require('../data/binaryData'),
	highlightObj = [
		[
			'<span class="highlighted" style="background-color: rgb(255, 255, 123);"></span>',
			'10110000000000',
			'0',
			0,
			9
		]
	];

// Drag select text
// Get selected text
// Get all options from the hashtable
// Highlight all possible options in the hashtable
// Select the highlighted hash from available options
// Insert the selected hash into the last empty input
describe('Binary Challenge View', function () {
	
	var BinaryChallenge, view;

	before(function(done){
		benv.setup(function() {
			benv.render(resolve(__dirname, '../index.jade'), {
				sd: {},
				sharify: { script: function() {} } 
			}, function() {
					benv.expose({ 
						$: require('jquery')
					});
					BinaryChallenge = benv.requireWithJadeify(
						'../modules/binaryChallenge.js',
						['binaryChallengeTemplate', 'binaryChallengeQuestionTemplate']
					);
					done();
			});
		});
	});

	after(function() {
		benv.teardown();
	});

	beforeEach(function() {
		view = new BinaryChallenge.Views.Challenge({
			model: new ChallengeResult.Model({ ChallengeResultId: 1234 }),
			answer: binaryData.engineer.answer,
			finalAnswer: binaryData.engineer.finalAnswer,
			question: binaryData.engineer.question,
			hashLeft: binaryData.hash.left,
			hashRight: binaryData.hash.right
		});
	});

	afterEach(function() {
		view.remove();
	});

	it('#initialize', function() {
		view.answer.should.equal(binaryData.engineer.answer);
		view.question.should.equal(binaryData.engineer.question);
		view.model.get('ChallengeResultId').should.equal(1234);
	});

	it('#setupViewData', function() {
		// Split the words into an array
		// Foreach word create an array,
		// Loop through each word character and store it as an array in the array
		var result = view.setupViewData(view.answer);
		result.length.should.equal(7);
		result[0][0].should.equal('W');
		result[0][1].should.equal('H');
	});

	it('#render', function() {
		view.render();
		view.$el.find('.binary__question__selectable')
			.html().should.equal(binaryData.engineer.question);
		view.$el.find('.binary__table--left li').length.should.equal(13);
		view.$el.find('.binary__table--right li').length.should.equal(12);
		view.$el.find('.binary__answers__word').length.should.equal(7);
		view.$el.find('.binary__answers__word')
			.first().children().length.should.equal(4);
	});

	it('#canHighlight', function() {
		view.render();
		view.canHighlight({ startOffset: 2 }).should.equal(false);
		view.canHighlight({ startOffset: 0 }).should.equal(true);
	});

	it('#checkMatch', function() {
		var results = view.getMatches('10111');
		results.length.should.equal(5);
	});

	it('#highlightAnswers', function() {
		view.render();
		var results = view.getMatches('111');
		view.highlightAnswers(results);
		view.$el.find('.binary__table__highlight-option')
			.length.should.equal(4);
	});

	it('#highlightQuestion', function() {
		view.render();
		view.$el.find('.binary__question__selectable .highlighted').length.should.equal(0);
		view.highlightQuestion('10111', highlightObj);
		view.$el.find('.binary__question__selectable .highlighted').length.should.equal(1);
	});

	// Click option get the value and append it to the end of the current answer
	// Take the current answer and subtract it from the question.
	// Rerender the question with current answer and remaining question
	// Answer is unselectable
	// Destory the highlight plugin and reinitialize it on the rerender of the question
	// Take the Key from the selected answer and input it the first input box that
	// does not have a value.
	// Disable the input of the input box and show a cross to empty the element

	it('#updateQuestionWithAnswer', function() {
		var answer = '10111';
		view.render();
		view.updateQuestionWithAnswer(answer);
		view.$el.find('.binary__question__unselectable').html().should.equal(answer);
		view.$el.find('.binary__question__selectable')
			.html().should.equal(view.question.replace(answer, ''));
	});

	it('#insertInput', function() {
		var $inputs;
		view.render();
		$inputs = view.$el.find('.binary__answers input');
		view.insertInput('WH');
		$($inputs[0]).val().should.equal('W');
		$($inputs[1]).val().should.equal('H');
	});

	it('#enableInput', function() {
		var $inputs;
		view.render();
		$inputs = view.$el.find('.binary__answers input');
		view.enableInput(2);
		(typeof $($inputs[2]).attr('disabled')).should.equal('undefined');
	});

	it('#checkInputMatch', function() {
		view.render();
		view.checkInputMatch('10111').should.equal(true);
		view.checkInputMatch('>').should.equal(false);
	});

	it('#toggleRemoveInput', function() {
		view.render();
		view.toggleRemoveInput(0);
		$(view.$el.find('.binary__answers__word__input__remove')[0])
			.css('display').should.equal('');
	});

	it('#toggleSubmit', function() {
		view.render();
		view.fufilledQuestion = 'WHATDOESTHEABBRCTCSSSTANDFOR';
		view.toggleSubmit(view.fufilledQuestion);
		(typeof view.$el.find('.btn--submit').attr('disabled')).should.equal('undefined');
		view.fufilledQuestion = 'WHATDOES';
		view.toggleSubmit(view.fufilledQuestion);
		(typeof view.$el.find('.btn--submit').attr('disabled')).should.equal('string');
	});

	it('#removeLastEntry', function() {
		view.render();
		view.fufilledQuestion = 'WHAT';
		view.currentAnswer = view.hash['W'].toString() + view.hash['H'].toString() + view.hash['A'].toString() + view.hash['T'].toString();
		view.removeLastEntry();
		view.fufilledQuestion.should.equal('WHA');
		view.currentAnswer.should.equal(view.hash['W'].toString() + view.hash['H'].toString() + view.hash['A'].toString());
		
	});

	it('#savesUserSelection', function() {
		view.render();
		var results = view.getMatches('111');
		view.highlightAnswers(results);
		view.$el.find('.binary__table__highlight-option').first().trigger('click');
		view.currentAnswer.should.equal('1');  
		view.fufilledQuestion.should.equal('A');
	});

	it('saveUserInput', function() {
		var answer = '10111';
		view.render();
		view.$el.find('.binary__answers input').first()
			.val('w').trigger('keypress');
		view.currentAnswer.should.equal(answer);  
		view.$el.find('.binary__question__unselectable').html().should.equal(answer);
	});

	it('checkFinalAnswer', function() {
		view.renderPhaseTwo();
		view.$el.find('.binary__final-answer').val(view.finalAnswer)
			.trigger('keyup');
		(typeof view.$el.find('.btn--submit--final').attr('disabled')).should.equal('undefined');
	});

	it('submitChallenge', function() {
		var dfd = new $.Deferred(),
			ventSpy = sinon.spy(view.vent, 'trigger'),
			modelStub = sinon.stub(view.model, 'save').returns(dfd.promise());

		dfd.resolve();

		view.renderPhaseTwo();
		view.$el.find('.binary__final-answer').val(view.finalAnswer)
			.trigger('keyup');
		view.$el.find('.btn--submit--final').trigger('click');
		ventSpy.calledOnce.should.be.ok;
		modelStub.calledOnce.should.be.ok;
	});

});