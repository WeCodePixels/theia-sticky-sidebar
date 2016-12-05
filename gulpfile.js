var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');

gulp.task('theia-sticky-sidebar.js', function () {
    return gulp.src('js/theia-sticky-sidebar.js')
        .pipe(sourcemaps.init())
        .pipe(concat('theia-sticky-sidebar.js'))
        .pipe(sourcemaps.write('maps'))
        .pipe(gulp.dest('dist'));
});

gulp.task('theia-sticky-sidebar.min.js', function () {
    return gulp.src('js/theia-sticky-sidebar.js')
        .pipe(sourcemaps.init())
        .pipe(concat('theia-sticky-sidebar.min.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write('maps'))
        .pipe(gulp.dest('dist'));
});

gulp.task('ResizeSensor.js', function () {
    return gulp.src('bower_components/css-element-queries/src/ResizeSensor.js')
        .pipe(sourcemaps.init())
        .pipe(concat('ResizeSensor.js'))
        .pipe(sourcemaps.write('maps'))
        .pipe(gulp.dest('dist'));
});

gulp.task('ResizeSensor.min.js', function () {
    return gulp.src('bower_components/css-element-queries/src/ResizeSensor.js')
        .pipe(sourcemaps.init())
        .pipe(concat('ResizeSensor.min.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write('maps'))
        .pipe(gulp.dest('dist'));
});

gulp.task('default', [
    'theia-sticky-sidebar.js',
    'theia-sticky-sidebar.min.js',
    'ResizeSensor.js',
    'ResizeSensor.min.js'
]);
