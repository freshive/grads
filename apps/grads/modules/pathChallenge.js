// Get dependancies
var _ = require('underscore'),
	Backbone = require('backbone'),
	$ = Backbone.$ = require('jquery/dist/jquery'),
	sd = require('sharify').data,
	vent = require('./vent'),
	pathChallengeTemplate = function () { return require('../templates/pathChallenge.jade').apply(null, arguments); },
	pathGridTemplate = function () { return require('../templates/pathGridChallenge.jade').apply(null, arguments); };

var PathChallenge = module.exports = {
	Views: {}
};

// You have to start on the starting block.
// Create a copy of the path array
// You can only move within the proximity of one block.

// When you click on a block add that to current path
	// , highlight the block
	// , and remove it from the copied array

// If you click the block again unhighlight the block
	// , add it back to the copied array
	// , and remove it from the current path

// Click on the finished block check the current path vs the original path
// If paths match, enable the button and animate the path 

PathChallenge.Views.Challenge = Backbone.View.extend({
	className: 'modal__box modal__path-challenge',

	events: {
		'click .path-challenge__grid-item--play' : 'highlightGridItem',
		'click .btn--reset': 'resetGame',
		'click .btn--submit': 'submitGame'
	},

	initialize: function(options) {
		this.gameData = options.gameData;
		this.vent = vent;
		this.currentGame = 1;
		this.currentPath = [];
		this.currentAnswers = [];
	},

	render: function() {
		var template = pathChallengeTemplate();
		this.$el.empty().append(template);
		this.renderGame(this.currentGame)
			.renderStartEndPoints(this.gameData[this.currentGame - 1].start)
			.renderStartEndPoints(this.gameData[this.currentGame - 1].end);
		
		return this;
	},

	renderGame: function(num) {
		this.$('.path__challenge')
			.empty()
			.append(pathGridTemplate(this.gameData[num - 1]));
		this.delegateEvents();
		return this;
	},

	renderStartEndPoints: function(gridItem) {
		this.$('tr').eq(gridItem[0])
			.find('td').eq(gridItem[1])
			.addClass('path-challenge__start-end');

		return this;
	},

	getCoordsOfGridItem: function($gridItem) {
		var coords = [];
		coords.push($gridItem.parent().index());
		coords.push($gridItem.index());
		return coords;
	},

	getGridItem: function (coords) {
		return this.$('tr').eq(coords[0]).find('td').eq(coords[1]);
	},

	hasClickedStart: function(coords) {
		return this.currentPath.length !== 0 || _.isEqual(coords, this.gameData[this.currentGame - 1].start);
	},

	// I am proud of this!
	canHighlight: function (coords) {
		var prevCoords = this.currentPath[this.currentPath.length - 1],
			movedYOnce = Math.abs(coords[0] - prevCoords[0]) === 1,
			movedXOnce = Math.abs(coords[1] - prevCoords[1]) === 1,
			movedYSkip = Math.abs(coords[0] - prevCoords[0]) > 1,
			movedXSkip = Math.abs(coords[1] - prevCoords[1]) > 1;
		
		if((movedYOnce && !movedXOnce && !movedXSkip) || (movedXOnce && !movedYOnce && !movedYSkip))
			return this.getGridItem(coords).length === 1;

		return false;
	},

	hasCompleted: function() {
		var path = _.flatten(this.gameData[this.currentGame - 1].path);
		return _.isEqual(_.flatten(this.currentPath), path);
	},

	highlightPath: function() {
		var self = this,
			delay = 100;
		
		this.$('.path-challenge__grid-item').removeClass('path-challenge__grid-item--play');

		_.each(this.currentPath, function(coords, index) {
			setTimeout(function() {
				self.getGridItem(coords)
					.addClass('path-challenge__grid-item--completed');
			}, delay * index);
		});
	},

	highlightGridItem: function (ev) {
		var $el = $(ev.currentTarget),
			coords = this.getCoordsOfGridItem($el),
			clickedStart = this.hasClickedStart(coords),
			hasBegun = clickedStart && this.currentPath.length !== 0;
		
		if(!clickedStart)
			return this.vent.trigger('notify', { type: 'info', message: 'Whoops. Looks like you are drifting off the path.'  });

		if(!hasBegun || this.canHighlight(coords)) {
			$el.addClass('path-challenge__grid-item--active');
			this.currentPath.push(coords);
			
			if(!this.hasCompleted()) 
				return this.$('.btn--submit').attr('disabled', 'disabled');

			this.vent.trigger('notify', { type: 'info', message: 'What a champion. Well done for completing the challenge. Now click submit.'  });
			this.$('.btn--submit').removeAttr('disabled');
			this.$('.btn--reset').attr('disabled', 'disabled');
			this.highlightPath();
		}
		
	},

	resetGame: function(ev) {
		this.$('.path-challenge__grid-item--active')
			.removeClass('path-challenge__grid-item--active');
		this.currentPath = [];
	},

	submitGame: function() {
		var self = this;
		this.currentAnswers.push(this.gameData[this.currentGame - 1].path);

		if(this.currentGame === this.gameData.length) {
			this.model.set('Answers', this.currentAnswers.join(','));
			return this.model.save().then(function() {
				self.vent.trigger('challenge:submit');	
			});
		}
			

		this.currentGame = this.currentGame + 1;
		this.currentPath = [];
		this.renderGame(this.currentGame)
			.renderStartEndPoints(this.gameData[this.currentGame - 1].start)
			.renderStartEndPoints(this.gameData[this.currentGame - 1].end);
	},

	animations: []
});

