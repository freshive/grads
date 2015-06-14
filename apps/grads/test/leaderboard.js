var benv = require('benv'),
	sinon = require('sinon'),
	resolve = require('path').resolve,
	graduateModelData = require('./test_data/graduate');

describe('Leaderboard View', function () {
	
	var Leaderboard, Graduate, view;

	before(function(done){
		benv.setup(function() {
			benv.render(resolve(__dirname, '../index.jade'), {}, function() {
				benv.expose({ 
					$: require('jquery')
				});
				Graduate = require('../modules/graduate');
				Leaderboard = benv.requireWithJadeify(
					'../modules/leaderboard.js',
					['leaderboardTemplate']
				);
				done();
			});
		});
	});

	after(function() {
		benv.teardown();
	});

	beforeEach(function() {
		view = new Leaderboard.Views.Leaderboard({
			model: new Graduate.Model(graduateModelData)
		});
	});

	it('#initialize', function() {
		view.model.get('TopGraduates').length.should.equal(2);
	});

	it('#render', function() {
		view.render();
		view.$el.find('.leaderboard__list li').length.should.equal(2);
	});
});