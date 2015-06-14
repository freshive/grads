// Get dependancies
var _ = require('underscore'),
	vent = require('./vent'),
	Backbone = require('backbone'),
	$ = Backbone.$ = require('jquery/dist/jquery'),
	sd = require('sharify').data,
	sd = sd.FACEBOOK_APP ? sd.FACEBOOK_APP : sd,
	codeChallengeTemplate = function () { return require('../templates/codeChallenge.jade').apply(null, arguments); },
	quineChallengeTemplate = function () { return require('../templates/quineChallenge.jade').apply(null, arguments); };

var CodeChallenge = module.exports = {
	Views: {},
};

CodeChallenge.Views.Challenge = Backbone.View.extend({
	className: 'modal__box modal__code-challenge',

	events: {
		'click .btn--run' : 'runCode',
		'click .btn--submit' : 'nextProblem',
		'click #reset' : 'resetCode',
		'click #next': 'nextProblem'
	},

	initialize: function(options) {
		this.vent = vent;
		this.questions = options.codeData;
		this.currentQuestion = 1;
		this.currentAnswers = [];
	},

	render: function() {
		var self = this;
		
		this.$el.empty().append(codeChallengeTemplate());
		
		$.getScript('js/codemirror.js').done(function(a,b,c) {
			self.editor = CodeMirror.fromTextArea(self.$el.find('.code__input')[0], {
				mode: 'javascript',
				lineNumbers: true,
				styleActiveLine: true,
				matchBrackets: true,
				theme: 'solarized light'
			});
			self.setTemplate();
		});
		this.delegateEvents();
		return this;
	},

	setTemplate: function() {
		var content = this.questions[this.currentQuestion - 1].problem,
			beautified = js_beautify(content, { indent_size: 4 });
		this.editor.setValue(beautified);
		this.$('.num-challenge').empty().append(this.currentQuestion);
		this.$('.modal__content__subheading--code').empty().append(this.questions[this.currentQuestion - 1].description);
	},

	runCode: function(ev) {
		if(ev) { ev.preventDefault(); }
		var iframe = $('<iframe>')
				.css('display', 'none')
				.appendTo(this.$('#sandbox')),
            $output = this.$('.code__result'),
            scriptToRun = this.editor.getValue(),
            existConsole = console.log,
            msg;

		console.log = function() {
			var messages = [];
			// Convert all arguments to Strings (Objects will be JSONified).
			for (var i = 0; i < arguments.length; i++) {
				var value = arguments[i];
				messages.push(typeof(value) === 'object' ? JSON.stringify(value) : String(value));
			}
			msg = messages.join(' ');
			$output.html(msg + ' - incorrect!');
		};

        var sandBoxMarkup = '<script>' +
                'var MSIE/*@cc_on =1@*/;' + // sniff
                'console={ log: parent.console.log };' +
                'parent.sandbox=MSIE?this:{eval:function(s){return eval(s)}}<\/script>';
        var ifrm = iframe[0];
		ifrm = (ifrm.contentWindow) ? ifrm.contentWindow : (ifrm.contentDocument.document) ? ifrm.contentDocument.document : ifrm.contentDocument;
		ifrm.document.open();
		ifrm.document.write(sandBoxMarkup);
		ifrm.document.close();
        scriptToRun = scriptToRun.replace(/"/g, "'");
        scriptToRun = scriptToRun.replace(/'/g, "\\'");
        scriptToRun = scriptToRun.replace(/(\r\n|\n|\r)/gm,"");
        scriptToRun = 'console.log(eval("' + scriptToRun + '"));';
        try{
			sandbox.eval(scriptToRun);
        } catch(err) {
			$output.html(err);
        }
        iframe.remove();
        console.log = existConsole;
        this.checkAnswer(msg);
	},

	checkAnswer: function (msg) {
		if(msg != this.questions[this.currentQuestion - 1].answer)
			return this.$('.btn--submit').attr('disabled', 'disabled');
		this.currentAnswers[this.currentQuestion - 1] = this.editor.getValue();
		this.$('.btn--submit').removeAttr('disabled');
		this.$('.code__result').empty().append(msg + ' - correct!');
	},

	nextProblem: function() {
		var self = this;
		
		if(this.currentQuestion === this.questions.length) {
			this.$('.btn--submit').attr('disabled', 'disabled');
			this.vent.trigger('notify', { type: 'info', message: 'Wahoo. You really are a code ninja.'  });
			this.model.set('Answers', this.currentAnswers.join(','));
			return this.model.save().then(function() {
				self.vent.trigger('challenge:submit');	
			});
		}
			

		this.currentQuestion = this.currentQuestion + 1;
		this.$('.code__result').empty();
		this.$('.btn--submit').attr('disabled', 'disabled');
		this.setTemplate();
	},

	animations: []
});

CodeChallenge.Views.Quine = CodeChallenge.Views.Challenge.extend({
	className: 'modal__box modal__code-challenge',

	events: {
		'click .btn--run' : 'runCode',
		'click .btn--submit' : 'nextProblem',
		'click #reset' : 'resetCode',
		'click #next': 'nextProblem'
	},

	initialize: function(options) {
		this.vent = vent;
	},

	render: function() {
		var self = this;
		
		this.$el.empty().append(quineChallengeTemplate());
		
		$.getScript('js/codemirror.js').done(function(a,b,c) {
			self.editor = CodeMirror.fromTextArea(self.$el.find('.code__input')[0], {
				mode: 'javascript',
				lineNumbers: true,
				styleActiveLine: true,
				matchBrackets: true,
				theme: 'solarized light'
			});
		});
		this.delegateEvents();
		return this;
	},

	checkAnswer: function (msg) {
		if(msg !== this.editor.getValue())
			return this.$('.btn--submit').attr('disabled', 'disabled');

		this.model.set('Answers', this.editor.getValue());
		this.$('.btn--submit').removeAttr('disabled');
		this.$('.code__result').empty().append(msg + ' - correct!');
	},

	nextProblem: function() {
		var self = this;
		this.$('.btn--submit').attr('disabled', 'disabled');
		this.vent.trigger('notify', { type: 'info', message: 'Congratulations. You can be really proud of yourself.'  });
		return this.model.save().then(function() {
			self.vent.trigger('challenge:submit');	
		});
	},
});

