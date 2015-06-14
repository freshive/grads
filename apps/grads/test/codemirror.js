/*jshint expr: true*/
/*jshint multistr: true*/

var benv = require('benv'),
	sinon = require('sinon'),
	resolve = require('path').resolve,
	_ = require('underscore'),
	ChallengeResult = require('../modules/challengeResult'),
	codeData = require('../data/codeData');

describe('Code Challenge View', function () {
	
	var CodeChallenge, view;

	before(function(done){
		benv.setup(function() {
			benv.render(resolve(__dirname, '../index.jade'), 
				{
					sd: {},
					sharify: { script: function() {  } }
				}, function() {
					window.se = { sd: { data: { } } };

					benv.expose({ 
						$: require('jquery')
					});
					CodeChallenge = benv.requireWithJadeify(
						'../modules/codeChallenge.js',
						['codeChallengeTemplate']
					);
					done();
			});
		});
	});

	after(function() {
		//benv.teardown();
	});

	beforeEach(function() {
		view = new CodeChallenge.Views.Challenge({
			model: new ChallengeResult.Model({ ChallengeResultId: 1234 }),
			codeData: codeData
		});
	});

	afterEach(function() {
		view.remove();
	});

	it('#initialize', function() {
		view.questions.length.should.equal(codeData.length);
		view.currentQuestion.should.equal(1);
		view.vent.should.be.defined;
	});

	it('#render', function() {
		view.render();
		view.editor.should.be.defined;
		view.$el.find('.code__input').length.should.equal(1);
		view.$el.find('.code__result').length.should.equal(1);
		view.$el.find('.CodeMirror').length.should.equal(1);
	});

	it('#setTemplate', function() {
		view.render();
		view.editor.getValue().should.equal(view.questions[view.currentQuestion - 1].problem);
	});

});