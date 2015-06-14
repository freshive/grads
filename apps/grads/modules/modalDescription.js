// Get dependancies
var	Backbone = require('backbone'),
	sd = require('sharify').data,
	descripTemplate = function () { return require('../templates/modalDescription.jade').apply(null, arguments); },
	resultTemplate = function () { return require('../templates/modalResult.jade').apply(null, arguments); };

var ModalDescrip = module.exports = {};

ModalDescrip.Views = {};

ModalDescrip.Views.Description = Backbone.View.extend({
	className: 'modal__box modal__binary-challenge modal__description-challenge',

	render: function() {
		this.$el.empty().append(descripTemplate({ challenge: this.model.toJSON() }));
		return this;
	},

	animations: []
});

ModalDescrip.Views.Result = Backbone.View.extend({
	className: 'modal__box modal__binary-challenge modal__description-challenge',

	render: function() {
		this.$el.empty().append(resultTemplate( this.model.toJSON() ));
		return this;
	},

	animations: []
});

