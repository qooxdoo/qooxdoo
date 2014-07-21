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

  // test unexported functions
  internal: {
    /**
     * @see {@link https://github.com/caolan/nodeunit#sandbox-utility}
     */
    setUp: function (done) {
      // sandbox qxCoreEnv to be able to call non-exported functions
      var sandbox = require('nodeunit').utils.sandbox;
      var boxGlobals = {
        // inject commen globals
        module: {exports: exports},
        require: require,
        console: console,
        __dirname: __dirname,
        // inject all local modules cause rel paths in qxCoreEnv.js won't fit
        util: require('../lib/util')
      };

      this.qxCoreEnv = sandbox('lib/qxCoreEnv.js', boxGlobals);

      done();
    },

    getFeatureTable: function(test) {
      var tree = {
        type: 'Property',
        key: {
          type: 'Identifier',
          name: '_checksMap'
        },
        value: {      // used as input for escodegen.generate()
          type: 'ObjectExpression',
          properties: [
            {
              type: 'Property',
              key: {
                type: 'Literal',
                value: 'engine.version',
                raw: '\'engine.version\''
              },
              value: {
                type: 'Literal',
                value: 'qx.bom.client.Engine.getVersion',
                raw: '\'qx.bom.client.Engine.getVersion\''
              },
              kind: 'init'
            },
            {
              type: 'Property',
              key: {
                type: 'Literal',
                value: 'engine.name',
                raw: '\'engine.name\''
              },
              value: {
                type: 'Literal',
                value: 'qx.bom.client.Engine.getName',
                raw: '\'qx.bom.client.Engine.getName\''
              },
              kind: 'init'
            }
            // ...
          ]
        }
      };

      // require 'escodegen' to then monkey patch
      var esprima = require('esprima');
      var orig_parse = esprima.parse;
      esprima.parse = function() { return tree; };

      var expected = {
        'engine.version': 'qx.bom.client.Engine.getVersion',
        'engine.name': 'qx.bom.client.Engine.getName'
      };

      test.deepEqual(this.qxCoreEnv.getFeatureTable(), expected);

      // don't forget to restore original!
      esprima.parse = orig_parse;

      test.done();
    },

    extractEnvDefaults: function(test) {
      var tree = {
        type: 'Property',
        key: {
          type: 'Identifier',
          name: '_defaults'
        },
        value: {      // used as input for escodegen.generate()
          type: 'ObjectExpression',
          properties: [
            {
              type: 'Property',
              key: {
                type: 'Literal',
                value: 'qx.debug',
                raw: '\'qx.debug\''
              },
              value: {
                type: 'Literal',
                value: true,
                raw: '\'true\''
              },
              kind: 'init'
            },
            {
              type: 'Property',
              key: {
                type: 'Literal',
                value: 'qx.blankpage',
                raw: '\'qx.blankpage\''
              },
              value: {
                type: 'Literal',
                value: 'qx/static/blank.html',
                raw: '\'qx/static/blank.html\''
              },
              kind: 'init'
            }
            // ...
          ]
        }
      };

      // require 'escodegen' to then monkey patch
      var esprima = require('esprima');
      var orig_parse = esprima.parse;
      esprima.parse = function() { return tree; };

      var expected = {
        'qx.debug': true,
        'qx.blankpage': 'qx/static/blank.html'
      };

      test.deepEqual(this.qxCoreEnv.extractEnvDefaults(), expected);

      // don't forget to restore original!
      esprima.parse = orig_parse;

      test.done();
    },

    findVariantNodes: function(test) {
      var treeTmpl = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'MemberExpression',
            object: {
              type: 'MemberExpression',
              object: {
                type: 'Identifier',
                name: 'qx',
              },
              property: {
                type: 'Identifier',
                name: 'core'
              }
            },
            property: {
              type: 'Identifier',
              name: 'Environment'
            }
          },
          property: {
            type: 'Identifier',
            name: 'toBeFilledByTests'
          }
        }
      };

      treeTmpl.callee.property.name = 'select';
      var treeGoodSelect = treeTmpl;
      var actualTree = this.qxCoreEnv.findVariantNodes(treeGoodSelect);
      test.deepEqual(actualTree, [treeGoodSelect]);

      treeTmpl.callee.property.name = 'selectAsync';
      var treeGoodSelectAsync = treeTmpl;
      actualTree = this.qxCoreEnv.findVariantNodes(treeGoodSelectAsync);
      test.deepEqual(actualTree, [treeGoodSelectAsync]);

      treeTmpl.callee.property.name = 'get';
      var treeGoodGet = treeTmpl;
      actualTree = this.qxCoreEnv.findVariantNodes(treeGoodGet);
      test.deepEqual(actualTree, [treeGoodGet]);

      treeTmpl.callee.property.name = 'getAsync';
      var treeGoodGetAsync = treeTmpl;
      actualTree = this.qxCoreEnv.findVariantNodes(treeGoodGetAsync);
      test.deepEqual(actualTree, [treeGoodGetAsync]);

      treeTmpl.callee.property.name = 'filter';
      var treeGoodFilter = treeTmpl;
      actualTree = this.qxCoreEnv.findVariantNodes(treeGoodFilter);
      test.deepEqual(actualTree, [treeGoodFilter]);

      treeTmpl.callee.property.name = 'wrongMethod';
      var treeBadMethName = treeTmpl;
      actualTree = this.qxCoreEnv.findVariantNodes(treeBadMethName);
      test.deepEqual(actualTree, []);  // no results

      treeTmpl.callee.property.name = 'select';  // fix method
      treeTmpl.callee.object.object.property.name = 'notCore';
      var treeBadQxEnvCall = treeTmpl;
      actualTree = this.qxCoreEnv.findVariantNodes(treeBadQxEnvCall);
      test.deepEqual(actualTree, []);  // no results

      test.done();
    },

    addLoadRunInformation: function(test) {
      var nodes = [
        {loc:{start:{line: 105}}},  // within first scope
        {loc:{start:{line: 64}}},   // within third scope
        {loc:{start:{line: 999}}},  // within no scope
      ];
      var scopeRefs = [
        {
          from: {
            isLoadTime: true,
            block: {
              loc: {
                start: {line: 100},
                end: {line: 120}
              }
            }
          }
        },
        {from: {isLoadTime: false}},
        {
          from: {
            isLoadTime: true,
            block: {
              loc: {
                start: {line: 50},
                end: {line: 70}
              }
            }
          }
        }
      ];

      var actualAugmentedNodes = this.qxCoreEnv.addLoadRunInformation(nodes, scopeRefs);

      test.strictEqual(actualAugmentedNodes[0].isLoadTime, true);
      test.strictEqual(actualAugmentedNodes[1].isLoadTime, true);
      test.strictEqual(actualAugmentedNodes[2].isLoadTime, false);

      test.done();
    },

    addEnvCallDependency: function(test) {
      var actualLoad = this.qxCoreEnv.addEnvCallDependency(
        'qx.Foo.bar',
        { isLoadTime: true },
        { load:[], run:[] }
      );
      var expectedLoad = { load: ['qx.Foo.bar'], run: [] };
      test.deepEqual(actualLoad, expectedLoad);

      var actualRun = this.qxCoreEnv.addEnvCallDependency(
        'qx.Foo.bar',
        { isLoadTime: false },
        { load:[], run:[] }
      );
      var expectedRun = { load: [], run: ['qx.Foo.bar'] };
      test.deepEqual(actualRun, expectedRun);

      test.done();
    },

    getMethodFromEnvCall: function(test) {
      var fakeNode = {
        callee: {
          property: {
            name: "foo"
          }
        }
      };

      var actual = this.qxCoreEnv.getMethodFromEnvCall(fakeNode);
      test.strictEqual(actual, "foo");

      test.done();
    },

    getKeyFromEnvCall: function(test) {
      var fakeNode = {
        arguments: {
          0: {
            value: 123
          }
        }
      };

      var actual = this.qxCoreEnv.getKeyFromEnvCall(fakeNode);
      test.strictEqual(actual, 123);

      test.done();
    },

    getClassCode: function(test) {
      var actual = this.qxCoreEnv.getClassCode();

      // js code is string and has more than 1300 lines
      test.strictEqual((typeof actual), "string");
      test.ok(actual.split('\n').length > 1300);

      test.done();
    }
  },

  // test exported functions
  external: {
    setUp: function (done) {
      this.qxCoreEnv = require('../lib/qxCoreEnv.js');
      done();
    },

    extract: function(test) {
      var qxFooMyClass = 'qx.Bootstrap.define("qx.foo.MyClass",\n'+    // 1
        '{\n'+                                                         // 2
        '  statics:\n'+                                                // 3
        '  {\n'+                                                       // 4
        '    addEnvCallToLoad: function() {\n'+                        // 5
        '      qx.core.Environment.get("engine.name");\n'+             // 6
        '    }\n'+                                                     // 7
        '  },\n'+                                                      // 8
        '  defer: function(statics) {\n'+                              // 9
        '    qx.core.Environment.get("engine.name");\n'+               // 10
        '  }\n'+                                                       // 11
        '});';                                                         // 12

      var scopeRefs = [
        {
          from: {
            isLoadTime: false,
          }
        },
        {
          from: {
            isLoadTime: true,  // because of 'defer' special treatment
            block: {
              loc: {
                start: {line: 9},
                end: {line: 11}
              }
            }
          }
        }
      ];

      var esprima = require('esprima');
      var tree = esprima.parse(qxFooMyClass, {loc: true});
      var expectedEnvDeps = {
        load: ['qx.bom.client.Engine'],
        run: ['qx.bom.client.Engine']
      };
      var actualEnvDeps = this.qxCoreEnv.extract(tree, scopeRefs);
      test.deepEqual(actualEnvDeps, expectedEnvDeps);

      test.done();
    }
  }
};
