var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    clean = require('gulp-clean'),
    copy = require('gulp-copy'),
    concat = require('gulp-concat'),
    less = require('gulp-less'),
    server = require('gulp-express'),
    watch = require('gulp-watch');



gulp.task('lint', function() {
    return gulp.src('./main-app/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});


gulp.task('clean', function(){
    return gulp.src('./.build', {read: false})
        .pipe(clean());
});

gulp.task('less', function () {
    return gulp.src('./main-app/less/**/*.less')
        .pipe(less())
        .pipe(gulp.dest('./.build/'));
});

gulp.task('copy-bower',function(){
    return gulp.src('./bower_components/**')
        .pipe(copy('./.build/scripts/', { prefix:0 }));
});

gulp.task('copy-images', function(){
    return gulp.src('./main-app/images/**')
        .pipe(copy('./.build/', { prefix:1 }));
});

gulp.task('copy-main-html', function(){
    return gulp.src('./main-app/*.html')
        .pipe(copy('./.build/', { prefix:1 }));
});

gulp.task('copy-partial-html', function(){
    return gulp.src('./main-app/partials/**/*.html')
        .pipe(copy('./.build/', { prefix:1 }));
});

gulp.task('concat-scripts', function() {
    return gulp.src(['./main-app/scripts/modules.js',
        './main-app/scripts/module-config.js',
        './main-app/scripts/providers/authentication/**/*.js',
        './main-app/scripts/providers/github-proxy/**/*.js',
        './main-app/scripts/providers/ta-proxy/*.js',
        './main-app/scripts/providers/waiting-pulls/*.js',
        './main-app/scripts/providers/stats/*.js',
        './main-app/scripts/authentication/authentication-controller.js',
        './main-app/scripts/waiting-pulls/waiting-pulls-model.js',
        './main-app/scripts/waiting-pulls/pull-request-information-factory.js',
        './main-app/scripts/waiting-pulls/waiting-pulls-controller.js',
        './main-app/scripts/stats/user-stats-factory.js',
        './main-app/scripts/stats/stats-normaliser.js',
        './main-app/scripts/stats/stats-model.js',
        './main-app/scripts/stats/stats-controller.js',
        './main-app/scripts/admin/**/services/*.js',
        './main-app/scripts/admin/**/controllers/*.js',
        './main-app/scripts/main-controller.js',
        './main-app/scripts/module-run.js'
        ])
        .pipe(concat('app.js'))
        .pipe(gulp.dest('./.build/scripts'));
});

//TODO: set a port number
gulp.task('server', function () {
    server.run(['app.js']);
    gulp.watch(['main-app/less/**/*.less'], ['less', server.notify]);
    gulp.watch(['main-app/index.html'], ['copy-main-html', server.notify]);
    gulp.watch(['main-app/partials/**/*.html'], ['copy-partial-html', server.notify]);
    gulp.watch(['main-app/scripts/**/*.js'], ['lint','concat-scripts',server.notify]);
    gulp.watch(['app/images/**/*'], ['copy-images', server.notify]);
});




gulp.task('nostart',['lint', 'less', 'copy-bower', 'copy-images', 'copy-main-html', 'copy-partial-html', 'concat-scripts'])

gulp.task('default', ['nostart', 'server']);
