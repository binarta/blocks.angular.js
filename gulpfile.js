var gulp = require('gulp'),
    minifyHtml = require('gulp-minify-html'),
    template = require('gulp-template'),
    templateCache = require('gulp-angular-templatecache');

var minifyHtmlOpts = {
    empty: true,
    cdata: true,
    conditionals: true,
    spare: true,
    quotes: true
};

gulp.task('default', function () {
    gulp.src('template/bootstrap3/*.html')
        .pipe(template())
        .pipe(minifyHtml(minifyHtmlOpts))
        .pipe(templateCache('blocks-tpls-bootstrap3.js', {standalone: true, module: 'bin.blocks.templates'}))
        .pipe(gulp.dest('src'));
});