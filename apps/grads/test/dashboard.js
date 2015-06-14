var benv = require('benv'),
	sinon = require('sinon'),
	resolve = require('path').resolve,
	graduateModelData = require('./test_data/graduate');

describe('Dashboard Base View', function () {
	
	var Dashboard, Graduate, view;

	before(function(done){
		benv.setup(function() {
			benv.render(resolve(__dirname, '../index.jade'), {}, function() {
				benv.expose({ 
					$: require('jquery'),
					TweenMax: benv.require('../../bower_components/greensock-js/src/uncompressed/TweenMax', 'TweenMax'),
					TimelineMax: benv.require('../../bower_components/greensock-js/src/uncompressed/TimelineMax', 'TimelineMax')
				});
				Graduate = require('../modules/graduate');
				Leaderboard = benv.requireWithJadeify(
					'../modules/leaderboard.js',
					['leaderboardTemplate']
				);
				Dashboard = benv.requireWithJadeify(
					'../modules/dashboard.js',
					['dashboardTemplate']
				);
				done();
			});
		});
	});

	after(function() {
		benv.teardown();
	});

	beforeEach(function() {
		var model = new Graduate.Model(graduateModelData);
		view = new Dashboard.Views.Base({
			leaderboard: new Leaderboard.Views.Leaderboard({
				model: model
			}).render(),
			model: model
		});
	});

	it('#initialize', function() {
		(typeof view.leaderboard).should.not.equal('undefined');
	});

	it('#render', function() {
		view.render();
		view.$el.find('.challenge-icon').length.should.equal(3);
	});

	it('#showLeaderboard', function() {
		view.render();
		(typeof view.timeline).should.not.equal('undefined');
		view.$el.find('.modal__content').html().should.equal('');
		view.$el.find('.show-leaderboard').trigger('click');
		view.$el.find('.modal__content').html().should.not.equal('');
	});

	it('#launchGame', function() {
	});

	it('#showBadges', function() {
		//view.$el.find('.show-badges').trigger('click');
	});

	it('#leaderboard', function() {

	});
});