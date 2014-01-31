'use strict';

var grunt = require('grunt');
var esprima = require('esprima');
var doctrine = require('doctrine');
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

    // static => non self discovering with class entry point
    var filePaths = [
        '../../../../framework/source/class/qx/Bootstrap.js',
        '../../../../framework/source/class/qx/Class.js',
        '../../../../framework/source/class/qx/Interface.js',
        '../../../../framework/source/class/qx/Mixin.js',
        '../../../../framework/source/class/qx/bom/Event.js',
        '../../../../framework/source/class/qx/bom/client/Browser.js',
        '../../../../framework/source/class/qx/bom/client/CssTransition.js',
        '../../../../framework/source/class/qx/bom/client/Engine.js',
        '../../../../framework/source/class/qx/bom/client/EcmaScript.js',
        '../../../../framework/source/class/qx/bom/client/OperatingSystem.js',
        '../../../../framework/source/class/qx/bom/client/Transport.js',
        '../../../../framework/source/class/qx/core/Aspect.js',
        '../../../../framework/source/class/qx/core/AssertionError.js',
        '../../../../framework/source/class/qx/core/Environment.js',
        '../../../../framework/source/class/qx/core/MAssert.js',
        '../../../../framework/source/class/qx/core/Assert.js',
        '../../../../framework/source/class/qx/core/MEvent.js',
        '../../../../framework/source/class/qx/core/MLogging.js',
        '../../../../framework/source/class/qx/core/MProperty.js',
        '../../../../framework/source/class/qx/core/ObjectRegistry.js',
        '../../../../framework/source/class/qx/core/Object.js',
        '../../../../framework/source/class/qx/core/Property.js',
        '../../../../framework/source/class/qx/core/ValidationError.js',
        '../../../../framework/source/class/qx/data/IListData.js',
        '../../../../framework/source/class/qx/dom/Node.js',
        '../../../../framework/source/class/qx/data/MBinding.js',
        '../../../../framework/source/class/qx/data/SingleValueBinding.js',
        '../../../../framework/source/class/qx/dev/StackTrace.js',
        '../../../../framework/source/class/qx/event/GlobalError.js',
        '../../../../framework/source/class/qx/event/IEventDispatcher.js',
        '../../../../framework/source/class/qx/event/IEventHandler.js',
        '../../../../framework/source/class/qx/event/Manager.js',
        '../../../../framework/source/class/qx/event/Pool.js',
        '../../../../framework/source/class/qx/event/Registration.js',
        '../../../../framework/source/class/qx/event/type/Data.js',
        '../../../../framework/source/class/qx/lang/Array.js',
        '../../../../framework/source/class/qx/log/Logger.js',
        '../../../../framework/source/class/qx/log/appender/RingBuffer.js',
        '../../../../framework/source/class/qx/lang/Function.js',
        '../../../../framework/source/class/qx/lang/Json.js',
        '../../../../framework/source/class/qx/lang/String.js',
        '../../../../framework/source/class/qx/lang/Type.js',
        '../../../../framework/source/class/qx/type/BaseError.js',
        '../../../../framework/source/class/qx/util/DisposeUtil.js',
        '../../../../framework/source/class/qx/util/LibraryManager.js',
        '../../../../framework/source/class/qx/util/OOUtil.js',
        '../../../../framework/source/class/qx/util/ResourceManager.js',
        '../../../../framework/source/class/qx/util/RingBuffer.js',
    ];

    var collectDepsStatic = function(filePaths) {
      filePaths.forEach(function (filePath) {
        var jsCode = grunt.file.read(filePath);
        var tree = esprima.parse(jsCode, {comment: true, loc: true});

        parentAnnotator.annotate(tree);
        classNameAnnotator.annotate(tree, filePath);

        var classDeps = depAnalyzer.analyze(tree, {flattened: true});

        classesDeps[util.classNameFrom(filePath)] = classDeps;
      });

      return classesDeps;
    };

    // dynamic => self discovering (recursive) with class entry point
    var collectDepsDynamic = function(initFilePath) {
      var basePath = '../../../../framework/source/class/';

      var recurse = function(filePath, seenClasses) {
        var jsCode = grunt.file.read(filePath);
        var tree = esprima.parse(jsCode, {comment: true, loc: true});

        parentAnnotator.annotate(tree);
        classNameAnnotator.annotate(tree, filePath);

        var classDeps = [];
        classDeps = depAnalyzer.analyze(tree, {flattened: true});

        var className = util.classNameFrom(filePath);
        classesDeps[className] = classDeps;

        for (var key in classDeps) {
          var dep = classDeps[key];

          if (seenClasses.indexOf(dep) === -1) {
            seenClasses.push(dep);

            recurse(util.filePathFrom(dep, basePath), seenClasses);
          }
        }

        return classesDeps;
      };

      // start with initFilePath and corresponding class
      return recurse(initFilePath, [util.classNameFrom(initFilePath)]);
    };

    // classesDeps = collectDepsStatic(filePaths);
    classesDeps = collectDepsDynamic("../../../../framework/source/class/qx/util/ResourceManager.js");
    // classesDeps = collectDepsDynamic("../../../../framework/source/class/qx/core/Assert.js");

    // --

    var Toposort = require('toposort-class');
    var tsort = new Toposort();

    for (var clazz in classesDeps) {

      if (clazz === "qx.core.Property") {
        classesDeps[clazz] = _.without(classesDeps[clazz], "qx.Class");
      }

      if (clazz === "qx.core.ObjectRegistry") {
        classesDeps[clazz] = _.without(classesDeps[clazz], "qx.dev.StackTrace");
      }

      if (clazz === "qx.bom.client.CssTransition") {
        classesDeps[clazz] = _.without(classesDeps[clazz], "qx.bom.Event");
      }

      if (clazz === "qx.util.ObjectPool" || clazz === "qx.event.handler.Object") {
        classesDeps[clazz] = _.without(classesDeps[clazz], "qx.core.Object");
      }

      if (clazz === "qx.event.type.Event") {
        classesDeps[clazz] = _.without(classesDeps[clazz], "qx.core.Object");
        classesDeps[clazz] = _.without(classesDeps[clazz], "qx.event.Registration");
      }

      if (clazz === "qx.lang.Array" || clazz === "qx.lang.Function" || clazz === "qx.core.GlobalError") {
        classesDeps[clazz] = _.without(classesDeps[clazz], "qx.core.Assert");
      }

      if (clazz === "qx.event.dispatch.Direct") {
        classesDeps[clazz] = _.without(classesDeps[clazz], "qx.Class");
        classesDeps[clazz] = _.without(classesDeps[clazz], "qx.core.Object");
        classesDeps[clazz] = _.without(classesDeps[clazz], "qx.event.IEventDispatcher");
        classesDeps[clazz] = _.without(classesDeps[clazz], "qx.event.Registration");
        classesDeps[clazz] = _.without(classesDeps[clazz], "qx.event.type.Event");
      }

      if (clazz === "qx.event.type.Data") {
        classesDeps[clazz] = _.without(classesDeps[clazz], "qx.Class");
        classesDeps[clazz] = _.without(classesDeps[clazz], "qx.event.type.Event");
      }

      tsort.add(clazz, classesDeps[clazz]);
    }

    // console.log(Object.keys(classesDeps));
    // console.log(Object.keys(classesDeps).length);
    console.log(classesDeps);
    console.log(tsort.sort().reverse());

    test.ok(true);
    test.done();
  }
};
