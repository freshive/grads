// Get dependancies
var _ = require('underscore'),
	Backbone = require('backbone'),
	$ = Backbone.$ = require('jquery/dist/jquery'),
	leaderboardTemplate = function () { return require('../templates/leaderboard.jade').apply(null, arguments); };

var Leaderboard = module.exports = {
	Views: {}
};

Leaderboard.Collection = Backbone.Collection.extend({});

Leaderboard.Views.Leaderboard = Backbone.View.extend({
	className: 'modal__box modal__leaderboard',

	render: function() {
		this.$el.empty().append(leaderboardTemplate({
			collection: this.model.get('TopGraduates')
		}));
		return this;
	},

	animations: [
		{
			tweenFunction: 'allTo',
			element: '.leaderboard__list li',
			duration: 0.25,
			properties: { x: '0',   opacity: 1, ease: 'Circ.easeInOut' },
			delay: 0.25
		}
	]
});

