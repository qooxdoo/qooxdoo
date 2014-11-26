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
      var classCode = "qx.Bootstrap.define('qx.bom.client.Engine', {\n"+
                      "  defer : function(statics) {\n"+
                      "    qx.core.Environment.add('engine.version', statics.getVersion);\n"+
                      "    qx.core.Environment.add('engine.name', statics.getName);\n"+
                      "  }\n"+
                      "});\n";

      var expected = {
        'engine.version': 'qx.bom.client.Engine',
        'engine.name': 'qx.bom.client.Engine'
      };

      test.deepEqual(this.qxCoreEnv.getFeatureTable({'qx.bom.client.Engine': classCode}), expected);

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


    isQxCoreEnvironmentCall: function(test) {
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
      test.ok(this.qxCoreEnv.isQxCoreEnvironmentCall(treeGoodSelect));

      treeTmpl.callee.property.name = 'selectAsync';
      var treeGoodSelectAsync = treeTmpl;
      test.ok(this.qxCoreEnv.isQxCoreEnvironmentCall(treeGoodSelectAsync));

      treeTmpl.callee.property.name = 'filter';
      var treeGoodFilter = treeTmpl;
      test.ok(this.qxCoreEnv.isQxCoreEnvironmentCall(treeGoodFilter), ['filter', 'get']);

      treeTmpl.callee.property.name = 'wrongMethod';
      var treeBadMethName = treeTmpl;
      test.ok(!this.qxCoreEnv.isQxCoreEnvironmentCall(treeBadMethName));

      treeTmpl.callee.property.name = 'select';  // fix method
      treeTmpl.callee.object.object.property.name = 'notCore';
      var treeBadQxEnvCall = treeTmpl;
      test.ok(!this.qxCoreEnv.isQxCoreEnvironmentCall(treeBadQxEnvCall));

      var treeTmpl_qxWeb = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'MemberExpression',
            object: {
              type: 'Identifier',
              name: 'qxWeb',
            },
            property: {
              type: 'Identifier',
              name: 'env'
            }
          },
          property: {
            type: 'Identifier',
            name: 'toBeFilledByTests'
          }
        }
      };

      treeTmpl_qxWeb.callee.property.name = 'get';
      var treeGoodGet_qxWeb = treeTmpl_qxWeb;
      test.ok(this.qxCoreEnv.isQxCoreEnvironmentCall(treeGoodGet_qxWeb));

      test.done();
    },

    replaceEnvCallGet: function(test) {

      var inputTree = {
        "type": "ExpressionStatement",
        "expression": {
          "type": "CallExpression",
          "callee": {
            "type": "MemberExpression",
            "computed": false,
            "object": {
              "type": "MemberExpression",
              "computed": false,
              "object": {
                "type": "MemberExpression",
                "computed": false,
                "object": {
                  "type": "Identifier",
                  "name": "qx"
                },
                "property": {
                  "type": "Identifier",
                  "name": "core"
                }
              },
              "property": {
                "type": "Identifier",
                "name": "Environment"
              }
            },
            "property": {
              "type": "Identifier",
              "name": "get"
            }
          },
              "arguments": [
                {
                  "type": "Literal",
                  "value": "qx.debug",
                  "raw": "\"qx.debug\""
                }
              ]
          }
      };

      var outputTree = {
        "type": "ExpressionStatement",
        "expression": {
          "type": "Literal",
          "value": true,
          "raw": "true"
        }
      };

      test.deepEqual(
        this.qxCoreEnv.replaceEnvCallGet(inputTree, {"qx.debug": true}),
        outputTree
      );

      test.done();
    },

    replaceEnvCallSelect: function(test) {
      var inputTree = {
        "type": "ExpressionStatement",
        "expression": {
          "type": "CallExpression",
          "callee": {
            "type": "MemberExpression",
            "computed": false,
            "object": {
              "type": "MemberExpression",
              "computed": false,
              "object": {
                "type": "MemberExpression",
                "computed": false,
                "object": {
                  "type": "Identifier",
                  "name": "qx"
                },
                "property": {
                  "type": "Identifier",
                  "name": "core"
                }
              },
              "property": {
                "type": "Identifier",
                "name": "Environment"
              }
            },
            "property": {
              "type": "Identifier",
              "name": "select"
            }
          },
          "arguments": [{
            "type": "Literal",
            "value": "qx.debug",
            "raw": "\"qx.debug\""
          }, {
            "type": "ObjectExpression",
            "properties": [{
              "type": "Property",
              "key": {
                "type": "Literal",
                "value": "true",
                "raw": "\"true\""
              },
              "value": {
                "type": "ObjectExpression",
                "properties": [{
                  "type": "Property",
                  "key": {
                    "type": "Literal",
                    "value": "a",
                    "raw": "\"a\""
                  },
                  "value": {
                    "type": "Literal",
                    "value": 1,
                    "raw": "1"
                  },
                  "kind": "init"
                }]
              },
              "kind": "init"
            }, {
              "type": "Property",
              "key": {
                "type": "Literal",
                "value": "default",
                "raw": "\"default\""
              },
              "value": {
                "type": "Literal",
                "value": null,
                "raw": "null"
              },
              "kind": "init"
            }]
          }]
        }
      };

      var outputTreeTrue = {
        "type": "ExpressionStatement",
        "expression": {
          "type": "ObjectExpression",
          "properties": [{
            "type": "Property",
            "key": {
              "type": "Literal",
              "value": "a",
              "raw": "\"a\""
            },
            "value": {
              "type": "Literal",
              "value": 1,
              "raw": "1"
            },
            "kind": "init"
          }]
        }
      };

      var outputTreeFalse = {
        "type": "ExpressionStatement",
        "expression": {
          "type": "Literal",
          "value": null,
          "raw": "null"
        }
      };

      // clone tree because it will be manipulated after the first test run
      var clonedInputTree = JSON.parse(JSON.stringify(inputTree));

      test.deepEqual(
        this.qxCoreEnv.replaceEnvCallSelect(inputTree, {"qx.debug": true}),
        outputTreeTrue
      );

      test.deepEqual(
        this.qxCoreEnv.replaceEnvCallSelect(clonedInputTree, {"qx.debug": false}),
        outputTreeFalse
      );

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

    getEnvSelectValueByKey: function(test) {
      var inputTree = {
        "type": "CallExpression",
        // [...]
        "arguments": [{
          "type": "Literal",
          "value": "qx.debug",
          "raw": "\"qx.debug\""
        }, {
          "type": "ObjectExpression",
          "properties": [{
            "type": "Property",
            "key": {
              "type": "Literal",
              "value": "true",
              "raw": "\"true\""
            },
            "value": {
              "type": "ObjectExpression",
              "properties": [{
                "type": "Property",
                "key": {
                  "type": "Literal",
                  "value": "a",
                  "raw": "\"a\""
                },
                "value": {
                  "type": "Literal",
                  "value": 1,
                  "raw": "1"
                },
                "kind": "init"
              }]
            },
            "kind": "init"
          }, {
            "type": "Property",
            "key": {
              "type": "Literal",
              "value": "default",
              "raw": "\"default\""
            },
            "value": {
              "type": "Literal",
              "value": null,
              "raw": "null"
            },
            "kind": "init"
          }]
        }]
      };

      var outputTreeTrue = {
        type: 'ObjectExpression',
        properties: [{
          type: 'Property',
          key: {
            type: 'Literal',
            value: 'a',
            raw: '"a"'
          },
          value: {
            type: 'Literal',
            value: 1,
            raw: '1'
          },
          kind: 'init'
        }]
      };

      var outputTreeFalse = {
        "type": "Literal",
        "value": null,
        "raw": "null"
      };

      // clone tree because it will be manipulated after the first test run
      var clonedInputTree = JSON.parse(JSON.stringify(inputTree));
      var inputTreeWithoutDefault = JSON.parse(JSON.stringify(inputTree));
      inputTreeWithoutDefault.arguments[1].properties[1].key.value = "notDefault";


      test.deepEqual(
        this.qxCoreEnv.getEnvSelectValueByKey(inputTree, true),
        outputTreeTrue
      );

      test.deepEqual(
        this.qxCoreEnv.getEnvSelectValueByKey(clonedInputTree, false),
        outputTreeFalse
      );

      test.throws(
        function() {
          this.qxCoreEnv.getEnvSelectValueByKey(inputTreeWithoutDefault, "nonMatchingKey");
        },
        Error
      );

      test.done();
    },

    getClassCode: function(test) {
      var actual = this.qxCoreEnv.getClassCode();

      // js code is string and has more than 1300 lines
      test.strictEqual((typeof actual), "string");
      test.ok(actual.split('\n').length > 1000);

      test.done();
    },

    getEnvKeyProviderCode: function(test) {
      var classToCodeMap = this.qxCoreEnv.getEnvKeyProviderCode();

      // js code is stored as buffer and has more than 200 lines
      var qxBomClientEngineCode = classToCodeMap['qx.bom.client.Engine'].toString('utf-8');
      test.strictEqual((typeof qxBomClientEngineCode), "string");
      test.ok(qxBomClientEngineCode.split('\n').length > 200);

      test.done();
    }
  },

  // test exported functions
  external: {
    setUp: function (done) {
      this.qxCoreEnv = require('../lib/qxCoreEnv.js');
      done();
    },

    optimizeEnvCall: function(test) {
      /*
        if (qx.core.Environment.get("qx.debug") === true) {
          var obj1 = { "a": 1 };
        }

        var obj2 = qx.core.Environment.select("qx.debug", {
          "true": { "b": 2 },
          "default": null
        })
      */
      var inputTree = {
        "type": "Program",
        "body": [{
          "type": "IfStatement",
          "test": {
            "type": "BinaryExpression",
            "operator": "===",
            "left": {
              "type": "CallExpression",
              "callee": {
                "type": "MemberExpression",
                "computed": false,
                "object": {
                  "type": "MemberExpression",
                  "computed": false,
                  "object": {
                    "type": "MemberExpression",
                    "computed": false,
                    "object": {
                      "type": "Identifier",
                      "name": "qx"
                    },
                    "property": {
                      "type": "Identifier",
                      "name": "core"
                    }
                  },
                  "property": {
                    "type": "Identifier",
                    "name": "Environment"
                  }
                },
                "property": {
                  "type": "Identifier",
                  "name": "get"
                }
              },
              "arguments": [{
                "type": "Literal",
                "value": "qx.debug",
                "raw": "\"qx.debug\""
              }]
            },
            "right": {
              "type": "Literal",
              "value": true,
              "raw": "true"
            }
          },
          "consequent": {
            "type": "BlockStatement",
            "body": [{
              "type": "VariableDeclaration",
              "declarations": [{
                "type": "VariableDeclarator",
                "id": {
                  "type": "Identifier",
                  "name": "obj1"
                },
                "init": {
                  "type": "ObjectExpression",
                  "properties": [{
                    "type": "Property",
                    "key": {
                      "type": "Literal",
                      "value": "a",
                      "raw": "\"a\""
                    },
                    "value": {
                      "type": "Literal",
                      "value": 1,
                      "raw": "1"
                    },
                    "kind": "init"
                  }]
                }
              }],
              "kind": "var"
            }]
          },
          "alternate": null
        }, {
          "type": "VariableDeclaration",
          "declarations": [{
            "type": "VariableDeclarator",
            "id": {
              "type": "Identifier",
              "name": "obj2"
            },
            "init": {
              "type": "CallExpression",
              "callee": {
                "type": "MemberExpression",
                "computed": false,
                "object": {
                  "type": "MemberExpression",
                  "computed": false,
                  "object": {
                    "type": "MemberExpression",
                    "computed": false,
                    "object": {
                      "type": "Identifier",
                      "name": "qx"
                    },
                    "property": {
                      "type": "Identifier",
                      "name": "core"
                    }
                  },
                  "property": {
                    "type": "Identifier",
                    "name": "Environment"
                  }
                },
                "property": {
                  "type": "Identifier",
                  "name": "select"
                }
              },
              "arguments": [{
                "type": "Literal",
                "value": "qx.debug",
                "raw": "\"qx.debug\""
              }, {
                "type": "ObjectExpression",
                "properties": [{
                  "type": "Property",
                  "key": {
                    "type": "Literal",
                    "value": "true",
                    "raw": "\"true\""
                  },
                  "value": {
                    "type": "ObjectExpression",
                    "properties": [{
                      "type": "Property",
                      "key": {
                        "type": "Literal",
                        "value": "b",
                        "raw": "\"b\""
                      },
                      "value": {
                        "type": "Literal",
                        "value": 2,
                        "raw": "2"
                      },
                      "kind": "init"
                    }]
                  },
                  "kind": "init"
                }, {
                  "type": "Property",
                  "key": {
                    "type": "Literal",
                    "value": "default",
                    "raw": "\"default\""
                  },
                  "value": {
                    "type": "Literal",
                    "value": null,
                    "raw": "null"
                  },
                  "kind": "init"
                }]
              }]
            }
          }],
          "kind": "var"
        }]
      };

      /*
        if (true === true) {
          var obj1 = {'a': 1};
        }
        var obj2 = {'b': 2};
      */
      var expectedTree = {
        "type": "Program",
        "body": [{
          "type": "IfStatement",
          "test": {
            "type": "BinaryExpression",
            "operator": "===",
            "left": {
              "type": "Literal",
              "value": true,
              "raw": "true"
            },
            "right": {
              "type": "Literal",
              "value": true,
              "raw": "true"
            }
          },
          "consequent": {
            "type": "BlockStatement",
            "body": [{
              "type": "VariableDeclaration",
              "declarations": [{
                "type": "VariableDeclarator",
                "id": {
                  "type": "Identifier",
                  "name": "obj1"
                },
                "init": {
                  "type": "ObjectExpression",
                  "properties": [{
                    "type": "Property",
                    "key": {
                      "type": "Literal",
                      "value": "a",
                      "raw": "\"a\""
                    },
                    "value": {
                      "type": "Literal",
                      "value": 1,
                      "raw": "1"
                    },
                    "kind": "init"
                  }]
                }
              }],
              "kind": "var"
            }]
          },
          "alternate": null
        }, {
          "type": "VariableDeclaration",
          "declarations": [{
            "type": "VariableDeclarator",
            "id": {
              "type": "Identifier",
              "name": "obj2"
            },
            "init": {
              "type": "ObjectExpression",
              "properties": [{
                "type": "Property",
                "key": {
                  "type": "Literal",
                  "value": "b",
                  "raw": "\"b\""
                },
                "value": {
                  "type": "Literal",
                  "value": 2,
                  "raw": "2"
                },
                "kind": "init"
              }]
            }
          }],
          "kind": "var"
        }]
      };

      test.deepEqual(
        this.qxCoreEnv.optimizeEnvCall(inputTree, {"qx.debug": true}),
        expectedTree
      );

      test.done();
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
