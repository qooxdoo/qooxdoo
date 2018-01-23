// Karma configuration
// Generated on Mon Apr 11 2016 10:15:49 GMT+0200 (CEST)
var path = require('path');

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['qooxdoo'],


    // list of files / patterns to load in the browser => auto-filled by the qooxdoo adapter
    files: [],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      // 'source/class/qx/{*.js,!(test)/**/*.js}': 'coverage'
    },

    sauceLabs: {
      tunnelIdentifier: process.env.TRAVIS_JOB_NUMBER,
      startConnect: false,
      testName: 'Qooxdoo Unit-Tests',
      recordScreenshots: false,
      public: 'public',
      connectOptions: {
        noSslBumpDomains: "all"
      }
    },

    customLaunchers: {  
      'ChromeSL': {
        base: 'SauceLabs',
        browserName: 'chrome',
        platform: 'Windows 10',
        version: 'latest'
      },
      'ChromeBetaSL': {
        base: 'SauceLabs',
        browserName: 'chrome',
        platform: 'Windows 10',
        version: 'beta'
      },
      'SafariSL': {
        base: 'SauceLabs',
        browserName: 'safari',
        platform: 'macOS 10.13',
        timezone: 'London'
      },
      'EdgeSL': {
        base: 'SauceLabs',
        platform: 'Windows 10',
        browserName: 'microsoftedge',
        version: '15'
      },
      'IESL': {
        base: 'SauceLabs',
        platform: 'Windows 8.1',
        browserName: 'internet explorer'
      },
      'FirefoxSL': {
        base: 'SauceLabs',
        platform: 'Windows 10',
        browserName: 'firefox'
      },
      'FirefoxBetaSL': {
        base: 'SauceLabs',
        platform: 'Windows 10',
        browserName: 'firefox',
        version: 'beta'
      }
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_ERROR,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['ChromeSL'],

    client: {
      captureConsole: false
    },

    browserNoActivityTimeout: 6000000,
    browserDisconnectTimeout: 6000000,

    coverageReporter: {
      dir: 'coverage',
      reporters: [
        // reporters not supporting the `file` property
        // { type: 'html' },
        { type: 'text-summary' }
      ]
    },

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: 2,

    // proxy settings without coverage (proxying resources, including PHP scripts to a PHP enabled webserver)
    // Note: you have to start a local php server with 'php -S 127.0.0.1:31323 -t ..' in this folder
    proxies: {
      '/script/': 'http://127.0.0.1:31323/framework/test/script/',
      '/resource/': 'http://127.0.0.1:31323/framework/source/resource/',
      '/qx/': 'http://127.0.0.1:31323/framework/test/resource/qx/',
      '/source/': 'http://127.0.0.1:31323/framework/source/',
      '/component/': 'http://127.0.0.1:31323/component/'
    },

    qooxdooFramework: {
      testSources: true
    }
  })
};
