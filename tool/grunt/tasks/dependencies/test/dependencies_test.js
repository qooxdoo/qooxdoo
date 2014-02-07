'use strict';

var path = require('path');

var grunt = require('grunt');
var esprima = require('esprima');
var doctrine = require('doctrine');
var Toposort = require('toposort-class');
var _ = require('underscore');

var parentAnnotator = require('../lib/annotator/parent');
var classNameAnnotator = require('../lib/annotator/className');
var util = require('../lib/util');

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

exports.dependencies = {
  setUp: function(done) {
    // setup here if necessary
    done();
  },
  /*
  default_options: function(test) {
    test.expect(1);

    var actual = grunt.file.read('tmp/default_options');
    var expected = grunt.file.read('test/expected/default_options');
    test.equal(actual, expected, 'should describe what the default behavior is.');

    test.done();
  },
  custom_options: function(test) {
    test.expect(1);

    var actual = grunt.file.read('tmp/custom_options');
    var expected = grunt.file.read('test/expected/custom_options');
    test.equal(actual, expected, 'should describe what the custom option(s) behavior is.');

    test.done();
  },
  */
  analyze_tree : function (test) {
    var depAnalyzer = require('../lib/depAnalyzer.js');
    var classesDeps = {};

    // dynamic => self discovering (recursive) with class entry point
    var collectDepsDynamic = function(basePaths, initFilePaths, namespacePathMap) {
      var classesDeps = {};
      var namespacePathMap = namespacePathMap || {};

      var getMatchingPath = function(basePaths, filePath) {
        for (var i=0; i<basePaths.length; i++) {
          if (grunt.file.exists(basePaths[i], filePath)) {
            return basePaths[i];
          }
        }
      };

      var getClassNamesFromPaths = function(filePaths) {
        return filePaths.map(function(path) {
          return util.classNameFrom(path);
        });
      };

      var recurse = function(basePaths, shortFilePaths, seenClasses) {
        for (var i=0; i<shortFilePaths.length; i++) {
          var shortFilePath = shortFilePaths[i];
          var curBasePath = getMatchingPath(basePaths, shortFilePath);
          var curFullPath = path.join(curBasePath, shortFilePath);
          var jsCode = grunt.file.read(curFullPath);
          var tree = esprima.parse(jsCode, {comment: true, loc: true});
          var classDeps = {
            'load': [],
            'run': []
          };

          parentAnnotator.annotate(tree);
          classNameAnnotator.annotate(tree, shortFilePath);

          classDeps = depAnalyzer.analyze(tree, {flattened: false});

          for (var namespacePath in namespacePathMap) {
            shortFilePath = shortFilePath.replace(namespacePathMap[namespacePath], namespacePath);
          }

          var className = util.classNameFrom(shortFilePath);
          classesDeps[className] = classDeps;

          var loadAndRun = classDeps.load.concat(classDeps.run);
          for (var j=0; j<loadAndRun.length; j++) {
            var dep = loadAndRun[j];

            if (seenClasses.indexOf(dep) === -1) {
              seenClasses.push(dep);

              var depShortFilePath = util.filePathFrom(dep);
              recurse(basePaths, [depShortFilePath], seenClasses);
            }
          }

        }
        return classesDeps;
      };

      // start with initFilePaths and corresponding classes
      return recurse(basePaths, initFilePaths, getClassNamesFromPaths(initFilePaths));
    };

    // classesDeps = collectDepsDynamic(['../../../../framework/source/class/'], ['qx/dev/StackTrace.js']);
    // classesDeps = collectDepsDynamic(['../../../../framework/source/class/'], ['qx/event/GlobalError.js']);
    classesDeps = collectDepsDynamic(['/Users/rsternagel/workspace/depTest/source/class/',
                                      '../../../../framework/source/class/'],
                                     ['depTest/Application.js', 'depTest/theme/Theme.js'],
                                     { "deptest": "depTest" });

    var tsort = new Toposort();
    for (var clazz in classesDeps) {
      tsort.add(clazz, classesDeps[clazz].load);
    }
    var classListLoadOrder = tsort.sort().reverse();

    console.log(classesDeps);
    console.log(classListLoadOrder, classListLoadOrder.length);

    test.ok(true);
    test.done();
  }
};
