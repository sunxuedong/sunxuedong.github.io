var gulp = require('gulp');
var minifycss = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var htmlmin = require('gulp-htmlmin');
var htmlclean = require('gulp-htmlclean');
var gutil = require('gulp-util');
var babel = require('gulp-babel');
// var autoprefixer = require('gulp-autoprefixer');
// 压缩 public 目录 css
gulp.task('minify-css', function() {
  return gulp.src('./public/**/*.css')
    // .pipe(autoprefixer({
    //   overrideBrowserslist: ['last 2 versions'],
    //   cascade: true, //是否美化属性值 默认：true 像这样：
    //   //-webkit-transform: rotate(45deg);
    //   //        transform: rotate(45deg);
    //   remove:true //是否去掉不必要的前缀 默认：true
    // }))
    .pipe(minifycss())
    .pipe(gulp.dest('./public'));
});
// 压缩 public 目录 html
gulp.task('minify-html', function() {
  return gulp.src('./public/**/*.html')
    .pipe(htmlclean())
    .pipe(htmlmin({
      removeComments: true,
      minifyJS: true,
      minifyCSS: true,
      minifyURLs: true,
    }))
    .pipe(gulp.dest('./public'))
});
// 压缩 public/js 目录 js
gulp.task('minify-js', function() {
  return gulp.src(['./public/**/*.js', '!./public/**/*.min.js'])
    .pipe(babel())
    .pipe(uglify())
    .on('error', function(err) {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    })
    .pipe(gulp.dest('./public'));
});
// 执行 gulp 命令时执行的任务
gulp.task('default', [
  'minify-html','minify-css','minify-js'
]);