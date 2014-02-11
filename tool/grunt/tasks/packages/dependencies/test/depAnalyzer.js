'use strict';
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
  getClassListLoadOrder : function (test) {
    var depAnalyzer = require('../lib/depAnalyzer.js');
    var classListLoadOrder = [];
    var classesDeps = {};

    // classesDeps = depAnalyzer.collectDepsRecursive(
    //   ['../../../../framework/source/class/'], ['qx/dev/StackTrace.js']
    // );
    // classesDeps = depAnalyzer.collectDepsRecursive(
    //   ['../../../../framework/source/class/'], ['qx/event/GlobalError.js']
    // );

    classesDeps = depAnalyzer.collectDepsRecursive(
      ['/Users/rsternagel/workspace/depTest/source/class/',
       '../../../../../framework/source/class/'],
      ['depTest/Application.js',
       'depTest/theme/Theme.js'],
      { "deptest": "depTest" }
    );

    classListLoadOrder = depAnalyzer.sortDepsTopologically(classesDeps, "load");

    console.log(classesDeps);
    console.log(classListLoadOrder, classListLoadOrder.length);

    test.ok(true);
    test.done();
  }
};
