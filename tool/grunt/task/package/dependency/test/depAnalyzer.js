/* *****************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2014 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Richard Sternagel (rsternagel)

***************************************************************************** */

'use strict';

module.exports = {

  // just print to stdout
  //  - e.g. to check class list order
  //  - e.g. to check class deps of some classes
  //  - e.g. to check assertHints of some classes
  stdout: {
    setUp: function(done) {
      this.depAnalyzer = require('../lib/depAnalyzer.js');
      done();
    },

    'classListOrder and classesDeps': function (test) {
      var classListLoadOrder = [];
      var classListPaths = [];
      var classesDeps = {};
      var atHintIndex = {};

      var excludedClassIds = ['myapp.test.*'];

      classesDeps = this.depAnalyzer.collectDepsRecursive(
        {'myapp': './test/data/myapp/source/class/',
         'qx': '../../../../../framework/source/class/'},
        ['myapp.Application', 'myapp.theme.Theme'],
        excludedClassIds
      );

      /*
      classesDeps = this.depAnalyzer.collectDepsRecursive(
        {'qx': '../../../../../framework/source/class/'},
        ['qx.*'],
        ['qx.test.*',
         'qx.dev.unit.*',
         'qx.dev.FakeServer']  // as this depends on qx.dev.unit classes
      );
      */

      /*
      classesDeps = this.depAnalyzer.collectDepsRecursive(
        {'qx': '../../../../../framework/source/class/'},
        ['qx.Class',
         'qx.Mixin',
         'qx.Interface',
         'qx.data.marshal.Json',
         'qx.bom.client.Runtime'],
        []
      );
      */

      classListLoadOrder = this.depAnalyzer.sortDepsTopologically(classesDeps, "load", excludedClassIds);
      classListLoadOrder = this.depAnalyzer.prependNamespace(classListLoadOrder, ["qx", "myapp"]);
      classListPaths = this.depAnalyzer.translateClassIdsToPaths(classListLoadOrder);
      atHintIndex = this.depAnalyzer.createAtHintsIndex(classesDeps);

      // console.log(JSON.stringify(classesDeps, null, 2));
      console.log(classListLoadOrder, classListLoadOrder.length);

      // console.log(Object.keys(classesDeps).length);
      // console.log(classListLoadOrder.length);

      // console.log(classListPaths);
      // console.log(atHintIndex);

      test.done();
    }
  },

  // test unexported functions
  internal: {
    /**
     * @see {@link https://github.com/caolan/nodeunit#sandbox-utility}
     */
    setUp: function (done) {
      var sandbox = require('nodeunit').utils.sandbox;
      var boxGlobals = {
        // inject commen globals
        module: {exports: exports},
        require: require,
        console: console,
        // inject all local modules cause rel paths in depAnalyzer.js won't fit
        parentAnnotator: require('lib/annotator/parent'),
        classNameAnnotator: require('lib/annotator/className'),
        loadTimeAnnotator: require('lib/annotator/loadTime'),
        qxCoreEnv: require('lib/qxCoreEnv'),
        util: require('lib/util')
      };
      this.depAnalyzer = sandbox('lib/depAnalyzer.js', boxGlobals);

      done();
    },

    isVar: function (test) {
      test.ok(!this.depAnalyzer.isVar({type:"Foo"}));
      test.ok(this.depAnalyzer.isVar({type:"Identifier"}));
      test.done();
    },

    findVarRoot: function (test) {
      var tree = {
        type: "Identifier",
        parent: {
          type: "MemberExpression",
          computed: false,
          parent: {
            type: "MemberExpression",
            computed: false
          }
        }
      };

      test.strictEqual(this.depAnalyzer.findVarRoot({type:"FunctionExpression"}), undefined);
      test.deepEqual(this.depAnalyzer.findVarRoot(tree), tree.parent.parent);
      test.strictEqual(this.depAnalyzer.findVarRoot(tree.parent.parent), tree.parent.parent);

      test.done();
    },

    assemble: function (test) {
      // require 'escodegen' to then monkey patch it for the assemble calls
      var escodegen = require('escodegen');
      var fakeVarNode = {};

      escodegen.generate = function() { return 'qx.ui.treevirtual.MTreePrimitive.Type.BRANCH'; };
      test.strictEqual(this.depAnalyzer.assemble(fakeVarNode), 'qx.ui.treevirtual.MTreePrimitive');
      escodegen.generate = function() { return 'qx.ui.table.Table'; };
      test.strictEqual(this.depAnalyzer.assemble(fakeVarNode), 'qx.ui.table.Table');
      escodegen.generate = function() { return 'qx.ui.basic.Label.toggleRich()'; };
      test.strictEqual(this.depAnalyzer.assemble(fakeVarNode), 'qx.ui.basic.Label');
      test.strictEqual(this.depAnalyzer.assemble(fakeVarNode, true), 'qx.ui.basic.Label.toggleRich()');
      escodegen.generate = function() { return 'qx.event.IEventHandler'; };
      test.strictEqual(this.depAnalyzer.assemble(fakeVarNode), 'qx.event.IEventHandler');
      escodegen.generate = function() { return 'qx.bom.Style.__supports.call'; };
      test.strictEqual(this.depAnalyzer.assemble(fakeVarNode), 'qx.bom.Style');
      escodegen.generate = function() { return 'WebKitCSSMatrix'; };
      test.strictEqual(this.depAnalyzer.assemble(fakeVarNode), 'WebKitCSSMatrix');
      escodegen.generate = function() { return 'qxWeb'; };
      test.strictEqual(this.depAnalyzer.assemble(fakeVarNode), 'qxWeb');
      escodegen.generate = function() { return 'qx'; };
      test.strictEqual(this.depAnalyzer.assemble(fakeVarNode), 'qx');

      test.done();
    },

    dependenciesFromAst: function (test) {
      // TODO
      test.done();
    },

    not_builtin: function (test) {
      // TODO
      test.done();
    },

    not_qxinternal: function (test) {
      // TODO
      test.done();
    },

    not_runtime: function (test) {
      // TODO
      test.done();
    },

    unify: function (test) {
      // TODO
      test.done();
    },

    getClassesFromTagDesc: function (test) {
      // TODO
      test.done();
    },

    getResourcesFromTagDesc: function (test) {
      // TODO
      test.done();
    },

    applyIgnoreRequireAndUse: function (test) {
      // TODO
      test.done();
    },

    collectAtHintsFromComments: function (test) {
      // TODO
      test.done();
    }
  },

  // test exported functions
  external: {
    findUnresolvedDeps: function (test) {
      // TODO
      test.done();
    },

    collectDepsRecursive: function (test) {
      // TODO
      test.done();
    },

    createAtHintsIndex: function (test) {
      // TODO
      test.done();
    },

    sortDepsTopologically: function (test) {
      // TODO
      test.done();
    },

    prependNamespace: function (test) {
      // TODO
      test.done();
    },

    translateClassIdsToPaths: function (test) {
      // TODO
      test.done();
    }
  }

};
