// Get dependancies
var _ = require('underscore'),
	vent = require('./vent'),
	Backbone = require('backbone'),
	$ = Backbone.$ = require('jquery/dist/jquery'),
	sd = require('sharify').data,
	sd = sd.FACEBOOK_APP ? sd.FACEBOOK_APP : sd,
	circuitChallengeTemplate = function () { return require('../templates/circuitChallenge.jade').apply(null, arguments); };

var CircuitChallenge = module.exports = {
	Views: {},
};

CircuitChallenge.Views.Challenge = Backbone.View.extend({

	className: 'modal__box modal__code-challenge',

	events: {
		'dragstart .dragblock': 'dragstart',
		'drop .question-block': 'drop',
		'dragenter .question-block': 'dragenter',
		'dragleave .question-block': 'dragleave',
		'dragover .question-block': 'dragover',
		'click .btn--reset': 'resetCircuit',
		'click .btn--submit': 'submitChallenge'
	},

	initialize: function (options) {
		this.points = 0;
		this.vent = vent;
	},

	render: function() {
		var self = this;
		this.$el.empty().append(circuitChallengeTemplate());
    this.delegateEvents();
		return this;
	},

	dragstart: function (ev) {
		ev.originalEvent.dataTransfer.setData("Text", $(ev.target).attr('text'));
	},

	drop: function (ev) {
		ev.preventDefault();

		//Hide question
		var target = $(ev.currentTarget).hide();

		//Hide dragged
		var source = $.parseJSON(ev.originalEvent.dataTransfer.getData("Text"));

		this.$el.find('#' + source.id).hide();

		//Insert item into circuit
		this.insertItem(source, target);
	},

	dragenter: function (ev) {
		ev.preventDefault();
		var current = $(ev.currentTarget);
		current.removeClass('turq-border').addClass('orange-border');
	},

	dragleave: function (ev) {
		ev.preventDefault();
		var current = $(ev.currentTarget);
		current.removeClass('orange-border').addClass('turq-border');
	},

	dragover: function (ev) {
		ev.preventDefault();
	},

	insertItem: function (source, target) {

		var _self = this;
		var targettype = target.data('type');
		var targetId = target.attr('id');



		// Create replacements. Could do with refactoring but no time

		switch (targetId)
		{
			case 'vert1':

				if (source.type == 'resistor') {
					this.$el.find('.circuit').append('<div class="circuit-replace-vertical reswgv">' + source.text + '</div>');
				} else {
					this.$el.find('.circuit').append('<div class="circuit-replace-horizontal capwgv">' + source.text + '</div>');
				}

				if (source.id === 'R1')
				{
					_self.points += 1;
				}

				break;
			case 'vert2':

				if (source.type == 'resistor') {
					this.$el.find('.circuit').append('<div class="circuit-replace-vertical resgwv">' + source.text + '</div>');
				} else {
					this.$el.find('.circuit').append('<div class="circuit-replace-horizontal capgwv">' + source.text + '</div>');
				}

				if (source.id === 'R3') {
					_self.points += 1;
				}

				break;
			case 'hori1':

				if (source.type == 'resistor') {
					this.$el.find('.circuit').append('<div class="circuit-replace-horizontal resggh2">' + source.text + '</div>');
				} else {
					this.$el.find('.circuit').append('<div class="circuit-replace-horizontal capggh">' + source.text + '</div>');
				}

				if (source.id === 'R2') {
					_self.points += 1;
				}

				break;
			case 'hori2':

				if (source.type == 'resistor') {
					this.$el.find('.circuit').append('<div class="circuit-replace-horizontal reswwh">' + source.text + '</div>');
				} else {
					this.$el.find('.circuit').append('<div class="circuit-replace-horizontal capwwh">' + source.text + '</div>');
				}

				if (source.id === 'C2') {
					_self.points += 1;
				}

				break;
			case 'hori3':

				if (source.type == 'resistor') {
					this.$el.find('.circuit').append('<div class="circuit-replace-vertical resggh">' + source.text + '</div>');
				} else {
					this.$el.find('.circuit').append('<div class="circuit-replace-horizontal capggh2">' + source.text + '</div>');
				}

				if (source.id === 'C1') {
					_self.points += 1;
				}

				break;
		}

		this.setVolume();
		this.$('.btn--reset').removeAttr('disabled');
	},

	setVolume: function () {

		this.$el.find('.volume').addClass('vol' + this.points);

		if(this.points === 5){
			this.vent.trigger('notify', { type: 'info', message: 'Congratulations. You can be really proud of yourself, you engineer you.'  });
			this.$('.btn--submit').removeAttr('disabled');
		}

	},

	resetCircuit: function () {

		this.initialize();
		this.render();

	},

	submitChallenge: function() {
		var self = this;
		this.vent.trigger('notify', { type: 'info', message: 'Congratulations. You can be really proud of yourself, you engineer you.'  });
		this.$('.btn--submit').attr('disabled', 'disabled');
		this.model.set('Answers', this.points);
		return this.model.save().then(function() {
			self.vent.trigger('challenge:submit');
		});
	},

	animations: []
});

