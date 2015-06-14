// Get dependancies
var	Backbone = require('backbone'),
	sd = require('sharify').data;

var ChallengeResult = module.exports = {};

ChallengeResult.Model = Backbone.Model.extend({
	idAttribute: 'ChallengeResultId',
	urlRoot: sd.API_URL + 'challengeresults'
});

ChallengeResult.Collection = Backbone.Collection.extend({
	model: ChallengeResult.Model,
	url: sd.API_URL + 'challengeresults'
});