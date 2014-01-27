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

    // static (non self discovering with class entry point)
    var filePaths = [
        '../../../../framework/source/class/qx/Bootstrap.js',

        '../../../../framework/source/class/qx/Class.js',
        // qx.Class
        // * @require(qx.lang.normalize.Array)
        // * @require(qx.lang.normalize.Date)
        // * @require(qx.lang.normalize.Error)
        // * @require(qx.lang.normalize.Function)
        // * @require(qx.lang.normalize.String)
        // * @require(qx.lang.normalize.Object)
        '../../../../framework/source/class/qx/lang/normalize/Array.js',
        '../../../../framework/source/class/qx/lang/normalize/Date.js',
        '../../../../framework/source/class/qx/lang/normalize/Error.js',
        '../../../../framework/source/class/qx/lang/normalize/Function.js',
        '../../../../framework/source/class/qx/lang/normalize/String.js',
        '../../../../framework/source/class/qx/lang/normalize/Object.js',

        '../../../../framework/source/class/qx/Interface.js',
        '../../../../framework/source/class/qx/Mixin.js',
        '../../../../framework/source/class/qx/bom/Event.js',
        '../../../../framework/source/class/qx/bom/client/Browser.js',
        // '../../../../framework/source/class/qx/bom/client/CssTransition.js',  // cyclic warnings
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
        // qx.core.MEvent.js
        // * @use(qx.event.dispatch.Direct)
        // * @use(qx.event.handler.Object)
        '../../../../framework/source/class/qx/event/dispatch/Direct.js',
        '../../../../framework/source/class/qx/event/handler/Object.js',

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
        '../../../../framework/source/class/qx/dev/Debug.js',
        // '../../../../framework/source/class/qx/dev/StackTrace.js',  // cyclic warnings
        '../../../../framework/source/class/qx/event/IEventDispatcher.js',
        '../../../../framework/source/class/qx/event/IEventHandler.js',
        '../../../../framework/source/class/qx/event/Manager.js',
        '../../../../framework/source/class/qx/event/Pool.js',
        '../../../../framework/source/class/qx/event/Registration.js',
        '../../../../framework/source/class/qx/event/type/Data.js',
        '../../../../framework/source/class/qx/lang/Array.js',
        '../../../../framework/source/class/qx/log/Logger.js',
        '../../../../framework/source/class/qx/log/appender/RingBuffer.js',
        // '../../../../framework/source/class/qx/lang/Function.js',  // cyclic warning
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

    // dynamic (self discovering with class entry point)
    // TBD

    filePaths.forEach( function (filePath) {
      var jsCode = grunt.file.read(filePath);
      var tree = esprima.parse(jsCode);

      parentAnnotator.annotate(tree);
      classNameAnnotator.annotate(tree, filePath);

      var classDeps = depAnalyzer.analyze(tree, {onlyLoadTime: false});

      classesDeps[util.classNameFrom(filePath)] = classDeps;
    });

    var Toposort = require('toposort-class');
    var tsort = new Toposort();

    for (var clazz in classesDeps) {

      // TODO: Add and interpret @ignores to prevent cyclic dep warnings
      if (clazz === "qx.Bootstrap"
      ||  clazz === "qx.core.Property" && classesDeps[clazz].indexOf("qx.Class")) {
        // qx.Bootstrap:
        // * @ignore(qx.data.IListData)
        // * @ignore(qx.util.OOUtil)
        //
        // qx.core.Property:
        // * @ignore(qx.Class)

        // qx.util.DisposeUtil:
        // * @ignore(qx.ui.container.Composite)
        // * @ignore(qx.ui.container.Scroll)
        // * @ignore(qx.ui.container.SlideBar)
        // * @ignore(qx.ui.container.Stack)
        continue;
      }

      // TODO: Add and interpret @ignores to prevent cyclic dep warnings
      if (clazz === "qx.util.DisposeUtil") {
        // * @ignore(qx.ui.container.Composite)
        // * @ignore(qx.ui.container.Scroll)
        // * @ignore(qx.ui.container.SlideBar)
        // * @ignore(qx.ui.container.Stack)
        classesDeps[clazz] = _.without(classesDeps[clazz], "qx.ui.container.Composite");
        classesDeps[clazz] = _.without(classesDeps[clazz], "qx.ui.container.Scroll");
        classesDeps[clazz] = _.without(classesDeps[clazz], "qx.ui.container.SlideBar");
        classesDeps[clazz] = _.without(classesDeps[clazz], "qx.ui.container.Stack");
      }

      // TODO: Add and interpret @ignores to prevent cyclic dep warnings
      if (clazz === "qx.core.ObjectRegistry") {
        // * @ignore(qx.dev, qx.dev.Debug.*)
        classesDeps[clazz] = _.without(classesDeps[clazz], "qx.dev.Debug");
        classesDeps[clazz] = _.without(classesDeps[clazz], "qx.dev.StackTrace");
      }

      tsort.add(clazz, classesDeps[clazz]);
    }

    console.log(classesDeps);
    console.log(tsort.sort().reverse());

    test.ok(true);
    test.done();
  }
};
