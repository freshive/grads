/*jshint expr: true*/

var benv = require('benv'),
	sinon = require('sinon'),
	resolve = require('path').resolve,
	graduateModelTestData = require('./test_data/graduate');

describe('Graduate Start View', function() {
	var Graduate, view, fetchUserFbStub, fetchUserServerSpy, navigateUserSpy, toggleCurtainSpy;

	before(function(done){
		benv.setup(function() {
			benv.render(resolve(__dirname, '../index.jade'), {
					
					sd: {},
					sharify: { script: function() {  } }

				}, function() {
				benv.expose({ 
					$: require('jquery')
				});
				Graduate = benv.requireWithJadeify(
					'../modules/graduate.js',
					['startTemplate']
				);
				done();
			});
		});
	});

	beforeEach(function() {
		var dfd = new $.Deferred();
		
		
		fetchUserFbStub = sinon.stub(Graduate.Views.Start.prototype, 'getUserFromFacebook')
			.returns(dfd.promise());

		dfd.resolve({
			authResponse: {
				accessToken: '1234'
			}
		});

		fetchUserServerSpy = sinon.spy(Graduate.Views.Start.prototype, 'getUserFromServer');

		navigateUserSpy = sinon.spy(Graduate.Views.Start.prototype, 'navigateUser');


		view = new Graduate.Views.Start({
			model: new Graduate.Model(),
			facebookApi: {}
		});

		view.render();
	});

	afterEach(function() {
		fetchUserFbStub.restore();
		fetchUserServerSpy.restore();
		navigateUserSpy.restore();
	});

	after(function() {
		benv.teardown();
	});

	describe('Graduate Model', function() {
		var graduate;

		beforeEach(function() {
			graduate = new Graduate.Model();
		});

		it('isLoggedIn', function() {
			graduate.isLoggedIn().should.be.false;
		});
	});

	it('#initialize', function() {
		view.facebookApi.should.be.defined;
	});

	it('#render', function() {
		view.$el.find('.title__sub').length.should.equal(1);
	});


	it('#navigateUser', function() {
		var spy = sinon.spy(view.vent, 'trigger');
		view.navigateUser();
		spy.calledOnce.should.be.ok;
		spy.getCall(0).args[0].should.equal('route:graduate-type');
	});

	it('#determineUserPath', function() {
		sinon.stub(view.model, 'fetch');
		view.$el.find('.js-fetch-user').trigger('click');
		fetchUserFbStub.calledOnce.should.be.ok;
		fetchUserServerSpy.calledOnce.should.be.ok;
		navigateUserSpy.calledOnce.should.be.ok;
		fetchUserServerSpy.getCall(0).args[0].authResponse.accessToken.should.equal('1234');
	});
});

describe('Graduate Profile View', function() {
	var Graduate, view, instanceSpy;

	before(function(done){
		benv.setup(function() {
			benv.render(resolve(__dirname, '../index.jade'), {
					
					sd: {},
					sharify: { script: function() {  } }

				}, function() {
				benv.expose({ 
					$: require('jquery')
				});
				Graduate = benv.requireWithJadeify(
					'../modules/graduate.js',
					['profileTemplate']
				);
				done();
			});
		});
	});

	after(function() {
		benv.teardown();
	});

	beforeEach(function(){
		view = new Graduate.Views.Profile({
			model: new Graduate.Model(graduateModelTestData)
		});

		view.render();
	});

	it('#render', function() {
		view.$el.find('.graduate-overview-bar__name').text().should.equal('Welcome: Tyrone');
	});

	it('#toggleAboutBtn', function () {
		var btn = view.$el.find('.btn--about');
		btn.length.should.equal(1);
		view.toggleAboutBtn();
		btn.css('display').should.equal('none');
	});
});

describe('Graduate ThinkerType View', function() {
	var Graduate, view, clickSpy;

	before(function(done){
		benv.setup(function() {
			benv.render(resolve(__dirname, '../index.jade'), {
					
					sd: {},
					sharify: { script: function() {  } }

				}, function() {
				benv.expose({ 
					$: require('jquery')
				});
				Graduate = benv.requireWithJadeify(
					'../modules/graduate.js',
					['thinkerTypeTemplate']
				);
				done();
			});
		});
	});

	after(function() {
		benv.teardown();
	});

	beforeEach(function() {
		clickSpy = sinon.spy(Graduate.Views.ThinkerType.prototype, 'setGraduateThinkerType'),
		view = new Graduate.Views.ThinkerType({
			model: new Graduate.Model(graduateModelTestData)
		});
		view.render();
	});

	afterEach(function () {
		clickSpy.restore();
		view.remove();
	});

	it('#initialize', function () {
		view.vent.should.be.defined;
	});

	it('#setGraduateThinkerType', function() {
		var dfd = new $.Deferred(),
			stub = sinon.stub(view.model, 'save').returns(dfd.promise()),
			spy = sinon.spy(view.vent, 'trigger');

		dfd.resolve();
		
		view.$el.find('.graduate-thinkertype')
				.first()
				.trigger('click');

		clickSpy.calledOnce.should.be.ok;
		stub.calledOnce.should.be.ok;
		spy.calledOnce.should.be.ok;
		view.model.get('ThinkerType').should.equal(1);
	});
});