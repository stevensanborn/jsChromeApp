
require.config({
    shim: {
        
        'modernizr': {
             exports: 'Modernizr'
        }

    },

    paths: {
        jquery: 'scripts/vendor/jquery/dist/jquery',
        backbone: 'scripts/vendor/backbone/backbone',
        TweenMax: 'scripts/vendor/gsap/src/minified/TweenMax.min',
        JSZip:'scripts/vendor/jszip/dist/jszip',
        Modernizr : 'scripts/vendor/modernizr/modernizr',
        underscore: 'scripts/vendor/lodash/lodash.min',
        router:'scripts/src/router',
        AppState:'scripts/src/globals/AppState'
    },

    urlArgs: "bust=" + (new Date()).getTime(),

    deps: ['app']

});
