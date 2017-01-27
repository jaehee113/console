/*
  Jekyll serve will only be used for generating _site folder
  Watching stuffs will be done via browserSync
*/
var gulp = require('gulp'),
  browserSync = require('browser-sync').create()
  bundleFiles = require('gulp-bundle-files'),
  bundleOptions = require('./_data/options.json'),
  uglify = require('gulp-uglify'),
  rename = require('gulp-rename'),
  cleanCSS = require('gulp-clean-css'),
  sassGlob = require('gulp-sass-glob'),
  sass = require('gulp-sass'),
  sourcemaps = require('gulp-sourcemaps'),
  plumber = require('gulp-plumber');

//Bundling js
gulp.task('bundle-js', function(){
  bundleFiles(bundleOptions);
});

//Minifying js
gulp.task('minify-js', function(){
  return gulp.src('./public/js/client.js')
  .pipe(uglify())
  .pipe(rename({ suffix: '.min'}))
  .pipe(gulp.dest('./public/js'))
  .pipe(browserSync.reload({
    stream: true
  }));
});

//Compile sass files into css file!
gulp.task('sass', function(){
  return gulp.src('_sass/style.scss')
  .pipe(plumber())
  .pipe(sassGlob())
  .pipe(sourcemaps.init())
    .pipe(sass())
      .on('error', function(error){
        console.log(error);
        this.emit('end');
      })
      .pipe(plumber())
  .pipe(sourcemaps.write())
  .pipe(gulp.dest('./public/css'));
});

gulp.task('minify-css', ['sass'], function(){
  return gulp.src('./public/css/style.css')
    .pipe(cleanCSS({
      compatibility: 'ie8'
    }))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('./public/css'))
    .pipe(browserSync.reload({
      stream: true
    }));
});

gulp.task('browserSync', function(){
    browserSync.init({
        server: {
          baseDir: '_site/'
        }
    });
});

//Run GULP!
gulp.task('default', ['browserSync', 'bundle-js', 'minify-js', 'sass', 'minify-css'], function(){
  gulp.watch('_sass/**/*.scss', ['sass']);
  gulp.watch('public/css/*.css', ['minify-css']);
  gulp.watch('assets/js/*.js', ['bundle-js']);
  gulp.watch('public/js/client.js', ['minify-js']);
  gulp.watch('*.html', browserSync.reload);
  gulp.watch('public/js/*.js', browserSync.reload);
});
