/*jshint expr: true*/
/*jshint multistr: true*/

var benv = require('benv'),
	sinon = require('sinon'),
	resolve = require('path').resolve,
	_ = require('underscore'),
	ChallengeResult = require('../modules/challengeResult'),
	vileData = require('../data/vileData');

describe('Vile Challenge View', function () {
	
	var VileChallenge, view;

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
					VileChallenge = benv.requireWithJadeify(
						'../modules/vileChallenge.js',
						['vileChallengeTemplate']
					);
					done();
			});
		});
	});

	after(function() {
		benv.teardown();
	});

	beforeEach(function() {
		view = new VileChallenge.Views.Challenge({
			model: new ChallengeResult.Model({ ChallengeResultId: 1234 }),
			vileData: vileData
		});
	});

	afterEach(function() {
		view.remove();
	});

	it('#initialize', function() {
		view.vileData.length.should.equal(vileData.length);
		view.vent.should.be.defined;
		view.currentChallenge.should.equal(1);
	});

	it('#render', function() {
		var challenge = vileData[view.currentChallenge - 1]
		view.render();
		view.$('.vile').length.should.equal(challenge.viles.length);
		view.$('.vile-water-level').length.should.equal(8);
	});

	it('#transfer', function () {
		var vileFrom, vileTo, $vileBtn;
		view.render();
		$vileBtn = view.$('.vile-transfer-btn').last().click();
		vileFrom = view.game.viles[$vileBtn.data('transfer-from')];
		vileTo = view.game.viles[$vileBtn.data('transfer-to')];

		vileFrom.fillAmount.should.not.equal(0);
		vileTo.fillAmount.should.not.equal(8);
	});

	it('#calculateTransferAmount', function () {
		var amount = view.calculateTransferAmount({ capacity: 5, fillAmount: 0 }, { capacity: 8, fillAmount: 8 });

		amount.to.should.equal(5);
		amount.from.should.equal(3);

		amount = view.calculateTransferAmount({ capacity: 5, fillAmount: 5 }, { capacity: 8, fillAmount: 3 });

		amount.to.should.equal(5);
		amount.from.should.equal(3);

		amount = view.calculateTransferAmount({ capacity: 8, fillAmount: 3 }, { capacity: 5, fillAmount: 5 });

		amount.to.should.equal(8);
		amount.from.should.equal(0);
	});

	it('#empty', function () {
		var $vileBtn;
		view.render();
		$vileBtn = view.$('.vile--empty').last().click();
		vile = view.game.viles[$vileBtn.data('empty')];
		vile.fillAmount.should.equal(0);
	});

	it('#fill', function () {
		var $vileBtn;
		view.render();
		$vileBtn = view.$('.vile--fill').last().click();
		vile = view.game.viles[$vileBtn.data('fill')];
		vile.fillAmount.should.equal(vile.capacity);
	});

});