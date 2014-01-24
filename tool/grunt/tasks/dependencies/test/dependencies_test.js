'use strict';

var grunt = require('grunt');
var esprima = require('esprima');
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

    // var filePath = 'test/data/qx/util/ResourceManager.js';
    // var filePath = 'test/data/qx/Class.js';
    var filePaths = [
        // 'test/data/qx/Class.js',
        'test/data/qx/bom/client/Engine.js',
        // 'test/data/qx/bom/client/Transport.js',
        'test/data/qx/core/Environment.js',
        'test/data/qx/core/Object.js',
        // 'test/data/qx/util/ResourceManager.js',
        // 'test/data/qx/util/LibraryManager.js'
    ];

    // └── qx
    //     ├── Class.js
    //     ├── bom
    //     │   └── client
    //     │       ├── Engine.js
    //     │       └── Transport.js
    //     ├── core
    //     │   ├── Environment.js
    //     │   └── Object.js
    //     └── util
    //         ├── LibraryManager.js
    //         └── ResourceManager.js

    filePaths.forEach( function (filePath) {
      var jsCode = grunt.file.read(filePath);
      var tree = esprima.parse(jsCode);

      parentAnnotator.annotate(tree);
      classNameAnnotator.annotate(tree, filePath);

      var classDeps = depAnalyzer.analyze(tree);

      classesDeps[util.classNameFrom(filePath)] = classDeps;
    });

    var Toposort = require('toposort-class');
    var tsort = new Toposort();

    for (var clazz in classesDeps) {
      tsort.add(clazz, classesDeps[clazz]);
    }

    console.log(classesDeps);
    console.log(tsort.sort().reverse());

    test.ok(true);
    test.done();
  }
};
