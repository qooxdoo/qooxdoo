/*global module*/
(function () {
  'use strict';

  // core
  var fs = require('fs');

  // 3rd party
  var async = require('async');

  // own packages
  var DataGenerator = require('./lib/DataGenerator');

  // global vars
  var config = {
    demoPath: 'source/demo/',
    classPath: 'source/class',
    jsSourcePath: 'source/class/demobrowser/demo',
    demoConfigJsonFile: 'config.demo.json',
    demoDataJsonFile: 'source/script/demodata.json'
  };

  // main
  var dataGenerator = new DataGenerator(config);
  async.series([

    // catches all the demos from config.demoPath
    dataGenerator.catchEntries.bind(dataGenerator),

    // Creates json file with all demos
    dataGenerator.createJsonDataFile.bind(dataGenerator),

    // Create config.demo.json file with all the jobs
    dataGenerator.createJsonConfigFile.bind(dataGenerator),

    // copy all javascript files to config.scriptDestinationPath
    dataGenerator.copyJsFiles.bind(dataGenerator)
  ]);
}());