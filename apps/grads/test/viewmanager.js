/*jshint expr: true*/
var benv = require('benv'),
	sinon = require('sinon'),
	resolve = require('path').resolve;

describe('ViewManager', function () {

	var viewManager, viewBefore, viewAfter, removeViewSpy, timelineSpy;
	
	before(function(done){
		benv.setup(function() {
			benv.render(resolve(__dirname, '../index.jade'), {}, function() {
				benv.expose({ 
					$: require('jquery'),
					TweenMax: benv.require('../../bower_components/greensock-js/src/uncompressed/TweenMax', 'TweenMax'),
					TimelineMax: benv.require('../../bower_components/greensock-js/src/uncompressed/TimelineMax', 'TimelineMax')
				});
				done();
			});
		});
	});

	after(function() {
		benv.teardown();
	});

	beforeEach(function () {
		var ViewManager = require('../modules/viewManager'),
			Graduate = benv.requireWithJadeify(
				'../modules/graduate.js',
				['startTemplate', 'introTemplate']
			);

		viewManager = new ViewManager({
			$viewHolder: $('.page')
		});

		removeViewSpy = sinon.spy(Graduate.Views.Start.prototype, 'remove');
		timelineSpy = sinon.spy(TimelineMax.prototype, 'clear');

		viewBefore = new Graduate.Views.Start({
			facebookApi: {}
		});
		viewAfter = new Graduate.Views.Intro();
	});

	afterEach(function () {
		viewBefore.remove();
		viewAfter.remove();
		timelineSpy.restore();
	});

	it('#constructor', function() {
		viewManager.$viewHolder.should.be.defined;
	});

	it('#switchView', function() {
		var dfd = new $.Deferred();
			stubStartAnim = sinon.stub(viewManager, 'startViewAnimation').returns(dfd.resolve()),
			stubReverseAnim = sinon.stub(viewManager, 'reverseViewAnimation').returns(dfd.resolve()),
			spyDefaults = sinon.spy(viewManager, 'setupView');

		// initial view
		viewManager.switchView(viewBefore);
		spyDefaults.calledOnce.should.be.ok;
		stubStartAnim.calledOnce.should.be.ok;

		// // switch out previous view
		viewManager.switchView(viewAfter);
		stubReverseAnim.calledOnce.should.be.ok;
		removeViewSpy.calledOnce.should.be.ok;
		spyDefaults.calledTwice.should.be.ok;
		stubStartAnim.calledTwice.should.be.ok;
		timelineSpy.calledTwice.should.be.ok;

	});

	it('#setCurrentViewDefaults', function () {
		viewManager.switchView(viewBefore);
		viewManager.currentView.should.equal(viewBefore);
		viewManager.$viewHolder.find('.page__view').length.should.equal(1);
		viewManager.$viewHolder.find('.page__view')
			.hasClass('page__view--initial-state').should.not.be.true;
	});
	
});