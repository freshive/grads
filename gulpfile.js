// Specify our dependancies
var gulp = require('gulp'),
	nodemon = require('nodemon'),
	browserify = require('gulp-browserify'),
	sass = require('gulp-sass'),
	tinylr = require('tiny-lr')(),
	refresh = require('gulp-livereload'),
	changed = require('gulp-changed'),
	imagemin = require('gulp-imagemin'),
	uglify = require('gulp-uglify'),
	cssmin = require('gulp-cssmin'),
	mocha = require('gulp-mocha');

// Setup paths that we are working with.
var paths = {
	css: './assets/*.scss',
	scripts: './assets/grads.js',
	templates: './apps/**/*.jade',
	imgSrc: './assets/images/**/*',
	fontsSrc: './assets/fonts/**/*',
	dest: './public/',
	// test: ['./test/**/*.js', './apps/grads/test/**/*.js'],
	test: ['./apps/grads/test/vileChallenge.js'],
	testReload: ['./apps/**/*.js']
};

// Setup paths that we are working with.
var watchPaths = {
	css: ['./assets/**/*.scss', './components/css-modules/**/*.scss']
};

// Setup our livereload server
gulp.task('livereload', function() {  
    tinylr.listen(35729, function(err) {
        if(err) return console.log(err);
    });
});

// Minify and compress new images
gulp.task('imagemin', function() {
	gulp.src(paths.imgSrc)
		.pipe(changed(paths.dest + 'images'))
		.pipe(imagemin())
		.pipe(gulp.dest(paths.dest + 'images'));
});

// Copy our fonts accross to our public folder
gulp.task('fonts', function() {
	gulp.src(paths.fontsSrc)
		.pipe(gulp.dest(paths.dest + 'fonts'));
});

// Compile our sass using gulp sass
gulp.task('sass', function () {
	gulp.src(paths.css)
		.pipe(sass({ includePaths : ['./bower_components/foundation/scss/foundation'] }))
		.on('error', handleError)
		.pipe(cssmin())
		.pipe(gulp.dest(paths.dest + 'css'))
		.pipe(refresh(tinylr));
});

// Reload the server when we make changes to our templates
gulp.task('reloadTemplates', function () {
	scripts();
});

/* compile our scripts using browserify.*/
var scripts = function() {
	gulp.src(paths.scripts)
		.pipe(browserify({
			insertGlobals : true,
			transform: ['jadeify2']
		}))
		.on('error', handleError)
		.pipe(uglify())
		.pipe(gulp.dest(paths.dest + 'js'))
		.pipe(refresh(tinylr));
};

gulp.task('scripts', scripts);

// start our server using nodemon.
gulp.task('nodemon', function() {
	nodemon({ script: 'index.js' }).on('restart', function() {
		console.log('Server restarted...');
		// Have to set a timeout to wait untill the server has completely restarted
		// If there is a better way, please share
		setTimeout(function() {
			// var server = refresh(tinylr);
			// server.changed('server');
			scripts();
		}, 500);
	});
});

// Our default task (development)
gulp.task('default', ['livereload', 'scripts', 'sass', 'imagemin', 'fonts', 'nodemon'], function() {
	gulp.watch(watchPaths.css, ['sass']);
	gulp.watch(paths.imgSrc, ['imagemin']);
	gulp.watch(paths.templates, ['reloadTemplates']);
});

function handleError(err) {
	console.log(err.message);
	this.emit('end');
};

// Our test environment
gulp.task('test', function() {
 	gulp.src(paths.test)
    	.pipe(mocha({ 
    		reporter: 'list',
    		globals: {
                should: require('should')
            }
    	}))
    	.on('error', handleError);
});

gulp.task('mocha', ['test'], function() {
	gulp.watch([paths.test, paths.testReload], ['test']);
});