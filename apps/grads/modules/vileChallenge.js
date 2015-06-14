// Get dependancies
var _ = require('underscore'),
	vent = require('./vent'),
	Backbone = require('backbone'),
	$ = Backbone.$ = require('jquery/dist/jquery'),
	sd = require('sharify').data,
	vileChallengeTemplate = function () { return require('../templates/vileChallenge.jade').apply(null, arguments); };

var VileChallenge = module.exports = {
	Views: {},
};

VileChallenge.Views.Challenge = Backbone.View.extend({
	className: 'modal__box modal__vile-challenge',

	events: {
		'click .vile-transfer-btn': 'transfer',
		'click .vile--empty': 'empty',
		'click .vile--fill': 'fill',
		'click .btn--submit': 'renderNewGame'
	},

	initialize: function(options) {
		this.vileData = options.vileData;
		this.currentChallenge = 1;
		this.vent = vent;
		this.currentAnswers = [];

		
	},

	render: function () {
		this.game = this.vileData[this.currentChallenge - 1];
		this.$el.empty().append(vileChallengeTemplate({ challengeNum: this.currentChallenge, challenge: this.game, totalChallenges: this.vileData.length }));
		_.each(this.game.viles, this.animateWater, this);
		this.delegateEvents();
		return this;
	},

	transfer: function (ev) {
		var $vileBtn = $(ev.currentTarget),
			vileFromIndex = $vileBtn.data('transfer-from'),
			vileToIndex = $vileBtn.data('transfer-to'),
			vileFrom = this.game.viles[vileFromIndex],
			vileTo = this.game.viles[vileToIndex],
			transferAmount = this.calculateTransferAmount(vileTo, vileFrom);

		vileTo.fillAmount = transferAmount.to;
		vileFrom.fillAmount = transferAmount.from;
		this.checkAnswer(this.game);
		this.animateWater(vileTo, vileToIndex);
		this.animateWater(vileFrom, vileFromIndex);
	},

	calculateTransferAmount: function (vileTo, vileFrom) {
		var availableToTransferTo = vileTo.capacity - vileTo.fillAmount,
			transferAmount = vileFrom.fillAmount > availableToTransferTo ? availableToTransferTo : vileFrom.fillAmount;

		return {
			to: vileTo.fillAmount + transferAmount,
			from: vileFrom.fillAmount - transferAmount
		};
	},

	empty: function (ev) {
		var $vileBtn = $(ev.currentTarget),
			index = $vileBtn.data('empty'),
			vile = this.game.viles[index];

		vile.fillAmount = 0;
		this.animateWater(vile, index);
		this.checkAnswer(this.game);
	},

	fill: function (ev) {
		var $vileBtn = $(ev.currentTarget),
			index = $vileBtn.data('fill'),
			vile = this.game.viles[index];

		vile.fillAmount = vile.capacity;
		this.animateWater(vile, index);
		this.checkAnswer(this.game);
	},

	checkAnswer: function(game) {
		var canProgress = true;
		_.each(game.viles, function(vile, index) {
			if(vile.fillAmount !== game.solution[index])
				canProgress = false;
		}, this);

		if(canProgress) {
			this.vent.trigger('notify', { type: 'info', message: 'Wahoo. You can now submit and move forward.'  });
			this.$('.btn--submit').removeAttr('disabled');
		}
	},

	animateWater: function (vile, index) {
		var $vile = this.$('.vile').eq(index);

		$vile.find('.vile-water-levels').animate({
			height: vile.height * vile.fillAmount
		}, 1000);

		$vile.find('.vile-fill').html(vile.fillAmount);
	},

	renderNewGame: function() {
		var self = this;
		this.currentAnswers.push(this.game.solution[this.currentChallenge - 1]);
		this.currentChallenge = this.currentChallenge + 1;
		this.vent.trigger('notify', { type: 'info', message: 'Congratulations. You can be really proud of yourself, you engineer you.'  });
		if(this.currentChallenge  > this.vileData.length) {
			this.$('.btn--submit').attr('disabled', 'disabled');
			this.model.set('Answers', this.currentAnswers.join(','));
			return this.model.save().then(function() {
				self.vent.trigger('challenge:submit');	
			});
		}

		this.render();
	},

	animations: []
});



