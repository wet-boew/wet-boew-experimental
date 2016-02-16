/* Gulp Task List
 *
----------------------------------------------- */
const gulp = require('gulp');
const imagemin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant');
const rm         = require('gulp-rm');
const njrender = require('gulp-nunjucks-render');



/* -------- Tasks --------------- */
gulp.task('clean', function(cb){
   return gulp.src('./build/**/*', { read: false }) // much faster
	.pipe(rm({ async: false }));
});


gulp.task('markup', function(){
	return gulp.src(['themes/**/html/*.html', '!themes/theme-base'], {base: 'themes'})
	.pipe(njrender())
	.pipe(gulp.dest('build'));
});

gulp.task('assets', function(){
	return gulp.src(['themes/**/assets/*', '!themes/theme-base'], {base: 'themes'})
		.pipe(imagemin({
			progressive: true,
			svgoPlugins: [{removeViewBox: false}],
			use: [pngquant()]
		}))
		.pipe(gulp.dest('build'));
});


//gulp.task('default', ['markup', 'styles', 'images', 'scripts']);
gulp.task('default', ['clean', 'markup', 'assets']);
