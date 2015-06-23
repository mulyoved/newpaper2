/* jshint node:true */
'use strict';
// generated on 2014-12-21 using generator-gulp-webapp 0.2.0

var Q = require('q');
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var runSequence = require('run-sequence');
require('gulp-grunt')(gulp);
var imageResize = require('gulp-image-resize');
var globToVinyl = require('glob-to-vinyl');
var handlebars = require('gulp-compile-handlebars');
var rename = require('gulp-rename');
var debug = require('gulp-debug');
var cheerio = require('gulp-cheerio');
var sitemap = require('gulp-sitemap');
var markdown = require('gulp-markdown');
var insert = require('gulp-insert');
var localScreenshots = require('gulp-local-screenshots');
var assetpaths = require('gulp-assetpaths');

var fs = require('fs');
var cloudfiles = require("gulp-cloudfiles");
var rackspace = JSON.parse(fs.readFileSync('./rackspace.json'));


gulp.task('styles', function () {
  return gulp.src('app/styles/main.scss')
    .pipe($.plumber())
    .pipe($.sass({
      style: 'expanded',
      precision: 10
    }))
    .pipe($.autoprefixer({browsers: ['last 1 version']}))
    .pipe(gulp.dest('.tmp/styles'));
});

gulp.task('jshint', function () {
  return gulp.src('app/scripts/**/*.js')
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.jshint.reporter('fail'));
});

gulp.task('html', ['styles', 'handlbars', 'markdown'], function () {
  var assets = $.useref.assets({searchPath: '{.tmp,app}'});

  return gulp.src('.tmp/*.html')

    .pipe(assets)
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.css', $.csso()))
    .pipe(assets.restore())
    .pipe($.useref())

    //CDN the resources
    .pipe(assetpaths({
      newDomain: 'http://np.fin-alg.com',
      oldDomain : 'www.theolddomain.com',
      docRoot : '/',
      filetypes : ['jpg','jpeg','png','ico','gif','js','css', 'eot', 'ttf', 'woff'],
      templates: true
    }))

    .pipe($.if('*.html', $.minifyHtml({conditionals: true, loose: true})))
    .pipe(gulp.dest('dist'));
});

gulp.task('images', function () {
  return gulp.src(['app/images/**/*', '!app/images/logo/**'])
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest('dist/images'))
    .pipe($.size({title: 'images'}));
});

gulp.task('image-resize-design', function () {
  var ratio = 760/962;
  //MarketBalance
  var base = 'design/images/stories/';
  var target = 'app/images/';

  var baseOption = {
    crop: true,
    gravity: 'SouthWest',
    upscale: true
  };

  var large = {
    width: 1000,
    height: 1000 * ratio
  };

  var thumbnails = {
    width : 171,
    height : 171 * ratio
  };

  var doubleThumbnails = {
    width: 171 * 2 + 12,
    height: (171 * 2 + 12) * (790 / 1000)
  };

  var folders = [
    {
      folder: 'marketbalance',
      exception: [ {
        name: 'MarketBalance1.png',
        thumbnailsOption: doubleThumbnails
      }]
    },
    {
      folder: 'tpo',
      exception: [ {
        name: 'tpo1.png',
        thumbnailsOption: doubleThumbnails
      }]
    },
    {
      folder: 'tpo_rangeselect',
      exception: [ {
        name: 'TPOChart_RangeSelect.png',
        thumbnailsOption: doubleThumbnails
      }]
    },
    {
      folder: 'mplines',
      exception: [
        {
          name: 'MPLines.png',
          thumbnailsOption: doubleThumbnails
        },
        {
          name: 'MPLines_Parameters.png',
          option: {
            width : large.width,
            height : large.height,
            crop : false,
            gravity: 'SouthWest',
            upscale : false
          },
          thumbnailsOption: {
            width : doubleThumbnails.width,
            height : doubleThumbnails.height,
            crop : false,
            gravity: 'SouthWest',
            //imageMagick: true,
            upscale : true
          }
        }]
      },
      {
        folder: 'deltapackage',
        exception: [
          {
            name: 'AccumulatedDelta.png',
            thumbnailsOption: doubleThumbnails
          },
          {
            name: 'DeltaDivergance.png',
            thumbnailsOption: doubleThumbnails
          }
        ]
      }
    ];

  var merge_options = function(obj1,obj2) {
    var obj3 = {};
    for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
    if (obj2) {
      for (var attrname in obj2) {
        obj3[attrname] = obj2[attrname];
      }
    }
    return obj3;
  };

  var resizeImage = function(fileName, size, folder) {
    var options = merge_options(baseOption, size);

    return gulp.src(fileName)
      .pipe(imageResize(options))
      .pipe(gulp.dest(target + folder));
  };

  globToVinyl('design/images/stories/**/*.png', function(err, files){
    for (var key in files) {
      var file = files[key];


      for (var folderKey in folders) {
        var folder = folders[folderKey];
        //console.log(folder);
        if (file.path.toUpperCase().indexOf((file.base + folder.folder).toUpperCase()) === 0) {
          var found = false;
          for (var exKey in folder.exception) {
            var ex = folder.exception[exKey];
            if (file.path.toUpperCase().indexOf(ex.name.toUpperCase()) > 0) {
              console.log(file.path);
              found = true;

              var options;
              options = merge_options(large, ex.option);
              resizeImage(file.path, options, folder.folder);

              options = merge_options(thumbnails, ex.thumbnailsOption);
              resizeImage(file.path, options, folder.folder + '/thumbnails');

            }
          }

          if (!found) {
            resizeImage(file.path, large, folder.folder);
            resizeImage(file.path, thumbnails, folder.folder + '/thumbnails');
          }
        }
      }

    }

  });
});


gulp.task('image-resize', function () {
  var ratio = 760/962;

  gulp.src('app/images/thumbnails/**')
    .pipe(imageResize({
      width : 240,
      height : 190,
      crop : true,
      gravity: 'SouthWest',
      //imageMagick: true,
      upscale : false
    }))
    .pipe(gulp.dest('dist/images/thumbnails/'));
});

gulp.task('copy-images', function () {
  gulp.src(['app/images/*.svg'])
    .pipe(gulp.dest('dist/images/'))
    .pipe($.size({title: 'copy-images'}));

  gulp.src(['bower_components/photoswipe/dist/default-skin/default-skin.png'])
    .pipe(gulp.dest('dist/styles/'));

  var paths = ['logo', 'icons', 'marketbalance', 'tpo', 'mplines', 'tpo_rangeselect', 'deltapackage', 'partners', 'platforms', 'faq', 'marketbalance_guide'];
  var promises = paths.map(function (key) {
    var deferred = Q.defer();
    gulp.src('app/images/'+key+'/**/*')
      .pipe(gulp.dest('dist/images/'+key))
      .on('end', function () {
        deferred.resolve();
      });

    return deferred.promise;
  });
  return Q.all(promises);
});


gulp.task('fonts', function () {
  return gulp.src(require('main-bower-files')().concat('app/fonts/**/*'))
    .pipe($.filter('**/*.{eot,svg,ttf,woff}'))
    .pipe($.flatten())
    .pipe(gulp.dest('dist/fonts'));
});

gulp.task('extras', function () {
  return gulp.src([
    'app/*.*',
    '!.tmp/*.html',
    'node_modules/apache-server-configs/dist/.htaccess'
  ], {
    dot: true
  }).pipe(gulp.dest('dist'));
});

gulp.task('clean', require('del').bind(null, ['.tmp', 'dist']));

gulp.task('connect', ['styles', 'handlbars', 'markdown'], function () {
  var serveStatic = require('serve-static');
  var serveIndex = require('serve-index');
  var app = require('connect')()
    .use(require('connect-livereload')({port: 35729}))
    .use(serveStatic('.tmp'))
    .use(serveStatic('app'))
    // paths to bower_components should be relative to the current file
    // e.g. in app/index.html you should use ../bower_components
    .use('/bower_components', serveStatic('bower_components'))
    .use(serveIndex('app'));

  require('http').createServer(app)
    .listen(9000)
    .on('listening', function () {
      console.log('Started connect web server on http://localhost:9000');
    });
});

gulp.task('serve', ['connect', 'watch'], function () {
  require('opn')('http://localhost:9000');
});

// inject bower components
gulp.task('wiredep', ['handlbars', 'markdown'], function () {
  var wiredep = require('wiredep').stream;

  gulp.src('app/styles/*.scss')
    .pipe(wiredep())
    .pipe(gulp.dest('app/styles'));

  gulp.src('.tmp/*.html')
    .pipe(wiredep())
    .pipe(gulp.dest('app'));
});

gulp.task('watch', ['connect'], function () {
  $.livereload.listen();

  // watch for changes
  gulp.watch([
    '.tmp/*.html',
    '.tmp/styles/**/*.css',
    'app/scripts/**/*.js',
    'app/images/**/*'
  ]).on('change', $.livereload.changed);

  gulp.watch('app/styles/**/*.scss', ['styles']);
  gulp.watch(['app/articles/**/*.hbs', 'app/partials/**/*.hbs', 'app/articles/**/*.md', 'app/transforms/**/*.js'], ['handlbars', 'markdown']);
  gulp.watch('bower.json', ['wiredep']);
});

gulp.task('build', ['handlbars', 'markdown', 'jshint', 'html', /*'images',*/  'image-resize', 'copy-images', 'fonts', 'extras', 'sitemap'], function () {
  return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('default', function () {
  runSequence('clean', 'build', 'grunt-deploy', 'deploy-cdn');
});

gulp.task('deploy', function() {
  runSequence('clean', 'build', 'grunt-deploy', 'deploy-cdn');
});

gulp.task('deploy-cdn', function() {
  var options = {
    delay: 1000, // optional delay each request by x milliseconds, default is 0
    headers: {
      'Access-Control-Expose-Headers': 'Access-Control-Allow-Origin',
      'Access-Control-Allow-Origin': '*'
    }, // optional additional headers
    uploadPath: "" //optional upload path (uses the container root by default)
  };

  gulp.src('./dist/**', {read: false})
    .pipe(cloudfiles(rackspace, options));
});

gulp.task('sitemap', ['handlbars', 'markdown'], function () {
  gulp.src('.tmp/**/*.html')
    .pipe(sitemap({
      siteUrl: 'http://www.fin-alg.com/'
    }))
    .pipe(gulp.dest('dist'));
});

var handlbarsOptions = {
  template: './app/partials/main.hbs',
  ignorePartials: false, //ignores the unknown footer2 partial in the handlebars template, defaults to false
  batch : ['./app/partials']
};

gulp.task('handlbars', function () {
  var cheerioComponents = require('./app/transforms/cheerioComponents');
  var templateData = {};

  return gulp.src('app/articles/**/*.hbs')
    //.pipe(debug({verbose: false}))
    .pipe(cheerio({
      run: cheerioComponents
    }))
    .pipe(handlebars(templateData, handlbarsOptions))
    .pipe(rename(function (path) {
      path.extname = ".html"
    }))
    .pipe(gulp.dest('.tmp/'));
});

gulp.task('markdown', function () {
  return gulp.src('app/articles/**/*.md')
    .pipe(markdown())
    .pipe(insert.wrap('<div class="marketbalance-guide">', '</div>'))
    .pipe(handlebars({}, handlbarsOptions))
    .pipe(rename(function (path) {
      path.extname = ".html"
    }))
    .pipe(gulp.dest('.tmp/'));
});

gulp.task('screens', function () {
  gulp.src('.tmp/*.html')
    .pipe(localScreenshots({
      path: '/',
      port: 9000,
      server: false,
      width: ['1600', '1000', '480', '320']
    }))
    .pipe(gulp.dest('./screens/'));
});

