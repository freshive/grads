/*jshint expr: true*/
/*jshint multistr: true*/

var benv = require('benv'),
	sinon = require('sinon'),
	resolve = require('path').resolve,
	_ = require('underscore'),
	ChallengeResult = require('../modules/challengeResult'),
	pathData = require('../data/pathData');

describe('Path Challenge View', function () {
	
	var PathChallenge, view;

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
					PathChallenge = benv.requireWithJadeify(
						'../modules/pathChallenge.js',
						['pathChallengeTemplate', 'pathGridTemplate']
					);
					done();
			});
		});
	});

	after(function() {
		benv.teardown();
	});

	beforeEach(function() {
		view = new PathChallenge.Views.Challenge({
			model: new ChallengeResult.Model({ ChallengeResultId: 1234 }),
			gameData: pathData
		});
	});

	afterEach(function() {
		view.remove();
	});

	it('#initialize', function() {
		view.gameData.should.be.defined;
		view.currentGame.should.equal(1);
		(view.currentPath instanceof Array).should.be.true;
	});

	it('#render', function() {
		view.render();
		view.$('.path-challenge__1').length.should.equal(1);
	});

	it('#renderGame - 1', function() {
		var $game = view.render().renderGame(1).$('.path-challenge__1');
		$game.find('tr').length.should.equal(view.gameData[0].grid.length);
		$game.find('tr td').length
			.should.equal(view.gameData[0].grid.length * view.gameData[0].grid[0].length);
		$game.find('tr td').first().html().should.equal(view.gameData[0].grid[0][0].toString());
	});

	it('#setStartEndPoints', function() {
		var game = view.gameData[0];

		view.render().renderGame(1)
			.renderStartEndPoints(game.start)
			.renderStartEndPoints(game.end);

		view.$('tr').eq(game.start[0])
			.find('td').eq(game.start[1]).hasClass('path-challenge__start-end').should.be.true;
		view.$('tr').eq(game.end[0])
			.find('td').eq(game.end[1]).hasClass('path-challenge__start-end').should.be.true;
	});

	it('#getCoordsOfGridItem', function() {
		var game = view.gameData[0], $gridItem, coords, difference;

		view.render().renderGame(1);

		$gridItem = view.$('tr').eq(5)
			.find('td').eq(5);

		coords = view.getCoordsOfGridItem($gridItem);
		difference = _.intersection(coords, [5,5]);
		difference.length.should.be.lessThan(2);
	});

	it('#getGridItem', function() {
		var game = view.gameData[0], $gridItem;

		view.render().renderGame(1);

		$gridItem = view.getGridItem([10,10]);
		$gridItem.length.should.equal(0);
		$gridItem = view.getGridItem([1,1]);
		$gridItem.length.should.equal(1);
	});

	it('#hasClickedStart', function() {
		var game = view.gameData[0], $gridItem;

		view.render().renderGame(1);

		view.hasClickedStart([5,5]).should.be.false;
		view.currentPath.push(1);
		view.hasClickedStart([5,5]).should.be.true;
		view.currentPath = [];
		view.hasClickedStart(game.start).should.be.true;
	});

	it('#canHighlight', function() {
		var game = view.gameData[0], $gridItem, path;

		view.render().renderGame(1);

		// Lets Move
		view.currentPath.push([4,4]);
		view.canHighlight([7,7]).should.be.false;
		view.canHighlight([3,4]).should.be.true;
		view.canHighlight([3,5]).should.be.false;
		view.canHighlight([4,5]).should.be.true;
		view.canHighlight([5,5]).should.be.false;
		view.canHighlight([5,4]).should.be.true;
		view.canHighlight([5,3]).should.be.false;
		view.canHighlight([4,3]).should.be.true;

		// Lets Move to a corner
		view.currentPath.push(game.start);
		view.canHighlight([6,0]).should.be.false;
		view.canHighlight([4,0]).should.be.true;
		view.canHighlight([4,1]).should.be.false;
		view.canHighlight([5,1]).should.be.true;

		// Lets follow the path
		view.currentPath = [game.path[0]];
		path = game.path.slice(1, game.path.length);
		_.each(path, function(coords){
			view.canHighlight(coords).should.be.true;
			view.currentPath.push(coords);
		});
	});

	it('#checkProgress', function() {
		var game = view.gameData[0], $gridItem;
		_.each(game.path, function(step) { view.currentPath.push(step); });
		view.hasCompleted().should.be.true;
	});

	it('highlightGridItem', function() {
		var game = view.gameData[0], $gridItem;

		view.render().renderGame(1);

		$gridItem = view.$('tr').eq(5)
			.find('td').eq(5).trigger('click');

		$gridItem.hasClass('path-challenge__grid-item--active').should.be.false;

		$gridItem = view.$('tr').eq(game.start[0])
			.find('td').eq(game.start[1]).trigger('click');

		$gridItem.hasClass('path-challenge__grid-item--active').should.be.true;

		$gridItem = view.$('tr').eq(5)
			.find('td').eq(5).trigger('click');

		$gridItem.hasClass('path-challenge__grid-item--active').should.be.false;

		$gridItem = view.$('tr').eq(5)
			.find('td').eq(1).trigger('click');

		$gridItem.hasClass('path-challenge__grid-item--active').should.be.true;

	});

	it('highlightGridItem', function() {
		var game = view.gameData[0], $gridItem;

		view.render().renderGame(1);

		(typeof view.$('.btn--reset').attr('disabled')).should.equal('undefined');

		_.each(game.path, function(step) {
			view.$('tr').eq(step[0]).find('td').eq(step[1]).trigger('click');
		});

		//view.$('.path-challenge__grid-item--completed').length.should.equal(game.path.length);
		view.$('.btn--reset').attr('disabled').should.equal('disabled');
	});

	it('resetGame', function() {
		view.render().renderGame(1);

		view.$('tr').eq(5)
			.find('td').eq(0).trigger('click');

		view.$('.path-challenge__grid-item--active').length.should.equal(1);
		view.currentPath.length.should.equal(1);
		view.$('.btn--reset').trigger('click');
		view.$('.path-challenge__grid-item--active').length.should.equal(0);
		view.currentPath.length.should.equal(0);
	});

	it('submitGame', function() {
		var dfd = new $.Deferred();
			stub = sinon.stub(view.model, 'save').returns(dfd.promise());
		dfd.resolve();
		view.render().renderGame(1);
		view.$('.btn--submit').removeAttr('disabled').trigger('click');
		view.currentGame.should.equal(2);
		view.$('.btn--submit').removeAttr('disabled').trigger('click');
		view.currentGame.should.equal(3);
		view.$('.btn--submit').removeAttr('disabled').trigger('click');
		stub.calledOnce.should.be.ok;
	});


});
