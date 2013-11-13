'use strict';

var grunt = require('grunt');
var esparent = require('../lib/esparent.js');

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
    var js_code = grunt.file.read('test/data/ResourceManager.js');
    var esprima = require('esprima');
    var tree = esprima.parse(js_code);
    esparent.annotate(tree);
    var depsana = require('../lib/dependencies.js');
    var deps = depsana.analyze(tree, {});
    //grunt.log.writeln(deps);
    console.log();
    console.log(deps.map( function (dep) {
      return depsana.assemble(dep.identifier);
    }));
    test.ok(true);
    test.done()
  }
};
