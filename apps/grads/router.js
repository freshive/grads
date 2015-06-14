// Specify our dependancies
var Backbone = require('backbone'),
	vent = require('./modules/vent'),
	Graduate = require('./modules/graduate'),
	Leaderboard = require('./modules/leaderboard'),
	Dashboard = require('./modules/dashboard'),
	BinaryChallenge = require('./modules/binaryChallenge'),
	PitchChallenge = require('./modules/pitchChallenge'),
	PatternChallenge = require('./modules/patternChallenge'),
	NumberPatternChallenge = require('./modules/numberPatternChallenge'),
	VileChallenge = require('./modules/vileChallenge'),
	PathChallenge = require('./modules/pathChallenge'),
	CodeChallenge = require('./modules/codeChallenge'),
	CircuitChallenge = require('./modules/circuitChallenge'),
	ChallengeResult = require('./modules/challengeResult');

var ModalDescription = require('./modules/modalDescription');

var gameData = require('./data/binaryData'),
	pitchData = require('./data/pitchData'),
	patternData = require('./data/patternData'),
	pathData = require('./data/pathData'),
	numberPatternData = require('./data/numberPatternData'),
	vileData = require('./data/vileData'),
	codeData = require('./data/codeData');

var graduateModelData = require('./test/test_data/graduate');

function isLoggedIn(user, router) { // Obviously need to change this
	if(!user.isLoggedIn()) return router.navigate('', { trigger: true });
}

var Router = Backbone.Router.extend({

	initialize: function(options) {
		this.vent = vent;
		this.viewManager = options.viewManager;
		this.facebookApi = options.facebookApi;
		this.graduate = options.graduate;
		this.vent.on('route:thinkertype', function() {
			this.navigate('thinkertype', { trigger: true }); }, this);
		this.vent.on('route:intro', function() {
			this.navigate('intro', { trigger: true }); }, this);
		this.vent.on('route:dashboard', function() {
			this.navigate('dashboard', { trigger: true }); }, this);
		this.vent.on('route:reloaddashboard', function() {
			this.dashboard(); }, this);
	},

	routes: {
		'': 'index',
		'intro': 'intro',
		'about': 'about',
		'about-me': 'aboutMe',
		'others': 'others',
		'thinkertype': 'thinkertype',
		'dashboard': 'dashboard'
	},

	index: function() {
		var view = new Graduate.Views.Start({
				facebookApi: this.facebookApi,
				model: this.graduate
			}),
			viewManager = this.viewManager;
		
		viewManager.switchView(view);
	},

	intro: function() {
		if(!this.graduate.isLoggedIn()) return this.navigate('', { trigger: true });

		var view = new Graduate.Views.Page({
				page: 'intro'
			});

		this.viewManager.switchView(view);
	},

	about: function() {
		if(!this.graduate.isLoggedIn()) return this.navigate('', { trigger: true });

		var view = new Graduate.Views.Page({
				page: 'about'
			});
		
		this.viewManager.switchView(view).then(view.afterRender.bind(view));
	},

	aboutMe: function() {
		if(!this.graduate.isLoggedIn()) return this.navigate('', { trigger: true });
		
		var view = new Graduate.Views.Page({
				page: 'commerce',
				thinkertype: this.graduate.get('ThinkerType'),
				animations: [
					{
						tweenFunction: 'to',
						element: '.page__view__content',
						duration: 0.5,
						properties: { height: '705px' },
						delay: -0.5
					},
					{
						tweenFunction: 'to',
						element: '.page__content',
						duration: 0.5,
						properties: { opacity: 1 },
					}
				]
			});
		
		this.viewManager.switchView(view).then(view.afterRender.bind(view));
	},

	others: function() {
		//if(!this.graduate.isLoggedIn()) return this.navigate('', { trigger: true });
		
		var view = new Graduate.Views.Page({
				page: 'others',
				animations: [
					{
						tweenFunction: 'to',
						element: '.page__view__content',
						duration: 0.5,
						properties: { height: '705px' },
						delay: -0.5
					},
					{
						tweenFunction: 'to',
						element: '.page__content',
						duration: 0.5,
						properties: { opacity: 1 },
					}
				]
			});
		
		this.viewManager.switchView(view).then(view.afterRender.bind(view));
	},

	thinkertype: function () {
		if(!this.graduate.isLoggedIn()) return this.navigate('', { trigger: true });

		var view = new Graduate.Views.ThinkerType({
				model: this.graduate
			}),
			viewManager = this.viewManager;
		
		viewManager.switchView(view);
	},

	dashboard: function () {
		if(!this.graduate.isLoggedIn()) return this.navigate('', { trigger: true });

		var viewManager = this.viewManager,
			view = new Dashboard.Views.Engineering({
				
				leaderboard: new Leaderboard.Views.Leaderboard({
					model: this.graduate
				}),

				modalDescription: new ModalDescription.Views.Description({
					model: new Backbone.Model()
				}),

				modalResult: new ModalDescription.Views.Result({
					model: new Backbone.Model()
				}),

				badges: new Graduate.Views.Badges({
					model: this.graduate
				}),

				finisher: new Graduate.Views.Finisher({
					model: this.graduate
				}),

				challenges: this._getChallenges(this.graduate.get('ThinkerType')),

				model: this.graduate
			});
		
		viewManager.switchView(view).then(view.afterRender.bind(view));
	},

	_getChallenges: function(challengeType) {
		var challenges = [];

		switch(challengeType) {
		case 1:
			challenges.push(

				new BinaryChallenge.Views.Challenge({
					model: new ChallengeResult.Model(),
					answer: gameData.engineer.answer,
					finalAnswer:  gameData.engineer.finalAnswer,
					question: gameData.engineer.question,
					hashLeft: gameData.hash.left,
					hashRight: gameData.hash.right
				}),

				new VileChallenge.Views.Challenge({
					model: new ChallengeResult.Model(),
					vileData: vileData
				}),

				new CircuitChallenge.Views.Challenge({
					model: new ChallengeResult.Model()
				})
			);
			break;
		case 2:
			challenges.push(
				
				new BinaryChallenge.Views.Challenge({
					model: new ChallengeResult.Model(),
					answer: gameData.commerce.answer,
					finalAnswer:  gameData.commerce.finalAnswer,
					question: gameData.commerce.question,
					hashLeft: gameData.hash.left,
					hashRight: gameData.hash.right
				}),

				new PatternChallenge.Views.Challenge({
					model: new ChallengeResult.Model(),
					questions: patternData
				}),

				
				new PitchChallenge.Views.Challenge({
					model: new ChallengeResult.Model(),
					pitchData: pitchData,
					facebookApi: this.facebookApi,
					graduate: this.graduate,
					streamPerms: { scope: 'publish_stream, read_stream' }
				})

			);
			break;
		case 3:
			challenges.push(
				
				new BinaryChallenge.Views.Challenge({
					model: new ChallengeResult.Model(),
					answer: gameData.compscience.answer,
					finalAnswer:  gameData.compscience.finalAnswer,
					question: gameData.compscience.question,
					hashLeft: gameData.hash.left,
					hashRight: gameData.hash.right
				}),

				new CodeChallenge.Views.Challenge({
					model: new ChallengeResult.Model(),
					codeData: codeData
				}),

				
				new CodeChallenge.Views.Quine({
					model: new ChallengeResult.Model()
				})

			);
			break;
		case 4:
			challenges.push(

				new BinaryChallenge.Views.Challenge({
					model: new ChallengeResult.Model(),
					answer: gameData.math.answer,
					finalAnswer:  gameData.math.finalAnswer,
					question: gameData.math.question,
					hashLeft: gameData.hash.left,
					hashRight: gameData.hash.right
				}),

				new PathChallenge.Views.Challenge({
					model: new ChallengeResult.Model(),
					gameData: pathData
				}),

				new NumberPatternChallenge.Views.Challenge({
					model: new ChallengeResult.Model(),
					questions: numberPatternData
				})
			);
			break;
		}

		return challenges;
	}
});

module.exports = Router;