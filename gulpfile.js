'use strict';

var gulp = require('gulp');
var webpack = require('gulp-webpack');
var webpackConfig = require('./webpack.config.js');

gulp.task('build', function() {
	return gulp.src('./src/app.js')
		.pipe(webpack(webpackConfig))
		.pipe(gulp.dest('build/'));
});

gulp.task('watch', function() {
	//gulp.watch(['examples/**/*.js', '!examples/js/*.js'], ['example']);
	gulp.watch('src/**/*.js', ['build']);
});

gulp.task('default', ['build', 'example']);