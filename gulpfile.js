var gulp = require('gulp');
var plugins = require( 'gulp-load-plugins' )();
var concat = require('gulp-concat');
var less = require('gulp-less');
var minifyCSS = require('gulp-minify-css');
var embedlr = require('gulp-embedlr');
var del = require('del');
var runSequence = require('run-sequence').use(gulp);
var browserSync = require('browser-sync').create();
var amdOptimize = require('amd-optimize');
var addsrc = require('gulp-add-src');
var replace = require('gulp-replace');
var uglify = require('gulp-uglify');
var jshint = require('gulp-jshint');
var exec = require('child_process').exec;
// var shell = require('gulp-shell')

var config = {
    app:'app',
   src:'app/scripts/src',
   dist:'build/dist',
   chrome:'chrome',
   chromebuild:'build/chrome-app/bpds/build',
   chromedist:'build/chrome-app/bpds/dist',
   vendor:'scripts/vendor/',
   styles:'styles/'
}

gulp.task('lint-scripts',function(){        
    gulp.src(config.app+"/scripts/src/**/*.js")
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
});


gulp.task('styles', function() {
    gulp.src([config.app+'/'+config.styles+'/main.less'])
    .pipe(less())
    .pipe(minifyCSS())
    .pipe(gulp.dest(config.app+'/'+config.styles))
        
});

gulp.task('copy-base-files', function() {
    gulp.src([config.app+"/*.{html,png,ico,txt}"])
    .pipe(embedlr())
    .pipe(gulp.dest(config.dist));
});

gulp.task('copy-assets', function() {
    gulp.src(config.app+"/assets/**/*.*")
    .pipe(gulp.dest(config.dist+'/assets'))
});

gulp.task('copy-styles', function() {
    gulp.src(config.app+"/styles/**/*.css")
    .pipe(gulp.dest(config.dist+'/styles/'))
});


gulp.task('webserver', function() {
  
  browserSync.init({
        server: {
            baseDir: config.app
        }
    });
});


//server dist
gulp.task('webserver:dist',function() {
  
    browserSync.init({
        server: {
            baseDir: config.dist
        }
    });

});

//reload server
gulp.task('reload-server',function(){

   browserSync.reload();

});


gulp.task('requirejsBuild', function(done) {
    
    gulp.src(config.app+'/**/*.js',{ base: 'app' })
    .pipe(amdOptimize("app",{
        baseUrl: config.app,
        configFile: config.app+'/app-config.js',
        findNestedDependencies: true
    }))
    .pipe(addsrc.prepend(config.app+'/scripts/vendor/requirejs/require.js')) 
    .pipe(concat('app.js'))
    .pipe(uglify())
    .pipe(gulp.dest(config.dist))
    .on('end', function() {
        //run some code here
        console.log('finished js amd-optimize');
        done();
    });;

     
});



//change the code to update link to javascript
gulp.task('update-index', function() {
    gulp.src(config.dist+"/index.html")
    .pipe(replace('<script src="scripts/vendor/requirejs/require.js" data-main="app-config"></script>', '<script src="app.js" data-main="app"></script>'))
    .pipe(gulp.dest(config.dist));
});


gulp.task('default',['webserver'], function() {
    
    runSequence('styles');

    //watch source
    gulp.watch(config.app+'/scripts/**/*.js', function(event) {
        runSequence('lint-scripts','reload-server');
    })
    
    //watch main.js file
    gulp.watch(config.app+'/app.js', function(event) {  
        runSequence('reload-server');
    })

    //wacth css updates
    gulp.watch(config.app+'/styles/**', function(event) {
        runSequence('styles','reload-server');
    });
    //watch html changes
    gulp.watch(config.app+'/**/*.html', function(event) {
        runSequence('reload-server');
    })

});

gulp.task('build:dist', function(cb) {

   del([config.dist,'tmp'], cb);
    //'styles','copy-base-files','copy-assets','copy-styles',
   runSequence('styles',['copy-base-files','copy-assets','copy-styles','lint-scripts'],'requirejsBuild','update-index');
  
});



gulp.task('chromebuild-copy-base-files',function(cb){

     gulp.src(config.chrome+"/**/*.*")
    .pipe(addsrc.prepend(config.app+'/app.js'))
    .pipe(addsrc.prepend(config.app+'/app-config.js'))
    .pipe(gulp.dest(config.chromebuild)).on('end',function(){
        cb();
    })

});


gulp.task('chromebuild-copy-scripts',function(cb){

     gulp.src(config.app+"/scripts/**/*.*")
    .pipe(gulp.dest(config.chromebuild+"/scripts/")).on('end',function(){
        cb();
    })

});

gulp.task('chromebuild-copy-assets',function(cb){

     gulp.src(config.app+"/assets/**/*.*")
    .pipe(gulp.dest(config.chromebuild+"/assets/")).on('end',function(){
        cb();
    })

});

gulp.task('chromedist-copy-base-files',function(cb){

     gulp.src(config.chrome+"/**/*.*")
   // .pipe(addsrc.prepend(config.dist+'/app.js'))
    .pipe(gulp.dest(config.chromedist)).on('end',function(){
        cb();
    })

});

gulp.task('chromedist-copy-assets',function(cb){

     gulp.src(config.app+"/assets/**/*.*")
    .pipe(gulp.dest(config.chromedist)).on('end',function(){
        cb();
    })

});

gulp.task('chromedist-update-index', function() {
    gulp.src(config.chrome+"/index.html")
    .pipe(replace('<script src="scripts/vendor/requirejs/require.js" data-main="app-config"></script>', '<script src="app.js" data-main="app"></script>'))
    .pipe(gulp.dest(config.chromedist));
});

gulp.task('build:chromedist', function(cb) {

    del([config.chromedist], cb);

    runSequence('chromedist-copy-assets','chromedist-copy-base-files','chromedist-update-index');

});

gulp.task('reload-chrome-build',function(cb){

    console.log("reload");

    var cmd="./reloadchrome.sh"
    
    exec(cmd,function (err, stdout, stderr) {
        console.log("done: "+stdout);

        cb(err);
        }
    );

});

gulp.task('build:chrome', function(cb) {

    del([config.chromebuild], cb);

    runSequence(['chromebuild-copy-assets','chromebuild-copy-base-files','chromebuild-copy-scripts'],'reload-chrome-build');

    //watch source
    gulp.watch(config.app+'/scripts/**/*.js', function(event) {
        runSequence('chromebuild-copy-scripts','reload-chrome-build');
    })
    


});