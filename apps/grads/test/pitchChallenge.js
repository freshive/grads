/*jshint expr: true*/
/*jshint multistr: true*/

var benv = require('benv'),
	sinon = require('sinon'),
	resolve = require('path').resolve,
	_ = require('underscore'),
	ChallengeResult = require('../modules/challengeResult'),
	pitchData = require('../data/pitchData'),
	postParams = { name: 'Test Post' },
	streamPerms = { scope: 'publish_stream, read_stream' };

describe('Pitch Challenge View', function () {
	
	var PitchChallenge, view;

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
					PitchChallenge = benv.requireWithJadeify(
						'../modules/pitchChallenge.js',
						['pitchChallengeTemplate', 'pitchLikesTemplate']
					);
					done();
			});
		});
	});

	after(function() {
		benv.teardown();
	});

	beforeEach(function() {
		view = new PitchChallenge.Views.Challenge({
			model: new ChallengeResult.Model({ ChallengeResultId: 1234 }),
			pitchData: pitchData,
			facebookApi: { post: function() {}, login: function() {}, get: function () {} },
			streamPerms: streamPerms
		});
	});

	afterEach(function() {
		view.remove();
	});

	it('#initialize', function() {
		view.pitchTest.should.equal(pitchData[view.pitchTestNum]);
		view.facebookApi.should.be.defined;
		view.postParams.should.be.defined;
		view.streamPerms.should.be.defined;
		view.model.get('ChallengeResultId').should.equal(1234);
	});

	it('#returnRandomNumber', function() {
		var number = view.returnRandomNumber(pitchData.length);
		number.should.be.lessThan(pitchData.length + 1);
	});

	it('#render', function() {
		view.render().$el.find('.pitch__words li').length.should.equal(4);
	});

	it('#wordHasBeenUsed', function() {
		var activeWords;
		view.render();
		view.wordHasBeenUsed('Hello ' + view.pitchTest.words[0] + ' ' + view.pitchTest.words[1]);

		activeWords = view.$el.find('.pitch__words li');
		$(activeWords[0]).hasClass('pitch__words__word--active').should.equal(true);
		$(activeWords[1]).hasClass('pitch__words__word--active').should.equal(true);
		$(activeWords[3]).hasClass('pitch__words__word--active').should.equal(false);
	});

	it('canPost', function() {
		var inputText = '';
		view.render();
		(typeof view.$el.find('.btn--submit').attr('disabled')).should.equal('string');
		_.each(view.pitchTest.words, function(word) { inputText += ' ' + word });
		view.wordHasBeenUsed(inputText);
		view.$el.find('.pitch__words__word--active').length.should.equal(view.pitchTest.words.length);
		view.canPost(inputText);
		(typeof view.$el.find('.btn--submit').attr('disabled')).should.equal('undefined');
	});

	it('#checkInputStatus', function() {
		var inputText = '';
		view.render();
		_.each(view.pitchTest.words, function(word) { inputText += ' ' + word });
		view.$el.find('.pitch__input').val(inputText).trigger('keyup');
		(typeof view.$el.find('.btn--submit').attr('disabled')).should.equal('undefined');
		view.$el.find('.pitch__input').val('').trigger('keyup');
		view.$el.find('.btn--submit').attr('disabled').should.equal('disabled');
	});

	it('#getFacebookStreamPerms', function() {
		var stub = sinon.stub(view.facebookApi, 'login');
		view.getFacebookStreamPerms();
		stub.calledOnce.should.be.ok;
		stub.getCall(0).args[0].should.equal(streamPerms);
	});

	it('#postMessageToFb', function() {
		var stub = sinon.stub(view.facebookApi, 'post');
		view.postMessageToFb('Hello World');
		stub.calledOnce.should.be.ok;
		stub.getCall(0).args[0].should.equal('/me/feed');
		stub.getCall(0).args[1].message.should.equal('Hello World');
	});

	it('#postMessageToFb', function() {
		var stub = sinon.stub(view.facebookApi, 'post');
		view.postMessageToFb('Hello World');
		stub.calledOnce.should.be.ok;
		stub.getCall(0).args[0].should.equal('/me/feed');
		stub.getCall(0).args[1].message.should.equal('Hello World');
	});

	it('#getNumLikesFromFb', function() {
		var stub = sinon.stub(view.facebookApi, 'get');
		view.getNumLikesFromFb(1234);
		stub.calledOnce.should.be.ok;
		stub.getCall(0).args[0].should.equal(1234);
	});

	it('#updateLikes', function() {
		view.model.set('Answers', 4);
		view.render();
		view.updateLikes();
		view.$el.find('#numlikes').html().should.equal('0');
		view.updateLikes({ likes: { data: [{ like: 1 }, {like: 2}] }});
		view.$el.find('#numlikes').html().should.equal('2');
	});

	it('#saveMessage', function() {
		var dfd = new $.Deferred(),
			loginStub = sinon.stub(view.facebookApi, 'login').returns(dfd.promise()),
			postStub = sinon.stub(view.facebookApi, 'post').returns(dfd.promise()),
			inputText = '';
		
		dfd.resolve({ id: 4 });
		view.render();
		
		_.each(view.pitchTest.words, function(word) { inputText += ' ' + word });

		view.$el.find('.pitch__input').val(inputText).trigger('keyup');
		view.$el.find('.btn--submit').trigger('click');
		view.model.get('Answers').should.equal(4);
		view.$el.find('#numlikes').html().should.equal('... ');
		view.postParams.message.should.equal(inputText);
		(typeof view.interval).should.be.defined;
	});

});