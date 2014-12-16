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

var path = require('path');

module.exports = {

  // test unexported functions
  internal: {
    /**
     * @see {@link https://github.com/caolan/nodeunit#sandbox-utility}
     */
    setUp: function (done) {
      // sandbox depAnalyzer to be able to call non-exported functions
      var sandbox = require('nodeunit').utils.sandbox;
      var boxGlobals = {
        // inject commen globals
        module: {exports: exports},
        require: require,
        console: console,
        // inject all local modules cause rel paths in depAnalyzer.js won't fit
        parentAnnotator: require('../lib/annotator/parent'),
        classNameAnnotator: require('../lib/annotator/className'),
        loadTimeAnnotator: require('../lib/annotator/loadTime'),
        qxCoreEnv: require('../lib/qxCoreEnv'),
        util: require('../lib/util'),
      };

      this.depAnalyzer = sandbox('lib/depAnalyzer.js', boxGlobals);

      done();
    },

    isVar: function (test) {
      test.ok(!this.depAnalyzer.isVar({type:'Foo'}));
      test.ok(this.depAnalyzer.isVar({type:'Identifier'}));
      test.done();
    },

    findVarRoot: function (test) {
      var ref = {
        type: 'Identifier',
        parent: {
          type: 'MemberExpression',
          computed: false,
          parent: {
            type: 'MemberExpression',
            computed: false
          }
        }
      };

      test.strictEqual(this.depAnalyzer.findVarRoot({type:'FunctionExpression'}), undefined);
      test.deepEqual(this.depAnalyzer.findVarRoot(ref), ref.parent.parent);
      test.strictEqual(this.depAnalyzer.findVarRoot(ref.parent.parent), ref.parent.parent);

      test.done();
    },

    assemble: function (test) {
      // require 'escodegen' to then monkey patch
      var escodegen = require('escodegen');
      var orig_generate = escodegen.generate;
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

      // don't forget to restore original!
      escodegen.generate = orig_generate;

      test.done();
    },

    dependenciesFromAst: function (test) {
      var scope = {
        through: [
          {},
          {resolved: {}}
        ]
      };

      test.strictEqual(this.depAnalyzer.dependenciesFromAst(scope).length, 1);

      test.done();
    },

    notBuiltin: function (test) {
      var refFunctionExpression = {
        identifier: {
          type: 'FunctionExpression'
        }
      };
      var refIdentifierBuiltin = {
        identifier: {
          type: 'Identifier',
          name: 'arguments'
        }
      };
      var refIdentifierCustom = {
        identifier: {
          type: 'Identifier',
          name: 'Infinity'
        }
      };
      var refIdentifierNotBuiltin = {
        identifier: {
          type: 'Identifier',
          name: 'myIdentifierFoo'
        }
      };

      test.ok(this.depAnalyzer.notBuiltin(refFunctionExpression));
      test.ok(!this.depAnalyzer.notBuiltin(refIdentifierBuiltin));
      test.ok(!this.depAnalyzer.notBuiltin(refIdentifierCustom));
      test.ok(this.depAnalyzer.notBuiltin(refIdentifierNotBuiltin));

      test.done();
    },

    notQxInternal: function (test) {
      var refFunctionExpression = {
        identifier: {
          type: 'FunctionExpression'
        }
      };
      var ref_qx_$$libraries = {
        identifier: {
          type: 'Identifier',
          name: 'qx',
          parent: {
            property: {
              name: '$$libraries'
            }
          }
        }
      };
      var ref_qx_Bootsrap_$$logs = {
        identifier: {
          type: 'Identifier',
          name: 'qx',
          parent: {
            property: {
              name: 'Bootstrap',
              parent: {
                parent: {
                  property: {
                    name: '$$logs'
                  }
                }
              }
            }
          }
        }
      };
      var ref_qx_core_Property_$$method = {
        identifier: {
          type: 'Identifier',
          name: 'qx',
          parent: {
            property: {
              name: 'core',
              parent: {
                parent: {
                  property: {
                    name: 'Property',
                    parent: {
                      parent: {
                        property: {
                          name: '$$method'
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      };

      test.ok(this.depAnalyzer.notQxInternal(refFunctionExpression));
      test.ok(!this.depAnalyzer.notQxInternal(ref_qx_$$libraries));
      test.ok(!this.depAnalyzer.notQxInternal(ref_qx_Bootsrap_$$logs));
      test.ok(!this.depAnalyzer.notQxInternal(ref_qx_core_Property_$$method));

      test.done();
    },

    notRuntime: function (test) {
      test.ok(!this.depAnalyzer.notRuntime( {foo:1} ));
      test.ok(!this.depAnalyzer.notRuntime( {from:{isLoadTime:false}} ));
      test.ok(this.depAnalyzer.notRuntime( {from:{isLoadTime:true}} ));

      test.done();
    },

    unify: function (test) {
      var className = 'qx.Foo';
      var deps = [
        // good ones
        'qx.Class',
        'qx.core.Environment',
        'qx.core.Object',
        // filter qx
        'qx',
        // uniq
        'qx.Class',
        // filter self ref & constants
        'qx.Foo',
        'qx.Foo.MAX'
      ];

      var actual = this.depAnalyzer.unify(deps, className);
      var expected = ['qx.Class', 'qx.core.Environment', 'qx.core.Object'];

      test.deepEqual(actual, expected);

      test.done();
    },

    getClassesFromTagDesc: function (test) {
      var tag = '';
      var actual = [];
      var expected = [];

      tag = '(qx.event, qx.event.GlobalError.*)';
      actual = this.depAnalyzer.getClassesFromTagDesc(tag);
      expected = ['qx.event', 'qx.event.GlobalError.*'];
      test.deepEqual(actual, expected);

      tag = '(qx.data.IListData)';
      actual = this.depAnalyzer.getClassesFromTagDesc(tag);
      expected = ['qx.data.IListData'];
      test.deepEqual(actual, expected);

      tag = '(qx.bom.element.AnimationJs#play)';
      actual = this.depAnalyzer.getClassesFromTagDesc(tag);
      expected = ['qx.bom.element.AnimationJs#play'];
      test.deepEqual(actual, expected);

      test.done();
    },

    getResourcesFromTagDesc: function (test) {
      var tag = '';
      var actual = [];
      var expected = [];

      tag = '(qx/mobile/css/*)';
      actual = this.depAnalyzer.getResourcesFromTagDesc(tag);
      expected = 'qx/mobile/css/*';
      test.strictEqual(actual, expected);

      tag = '(qx/icon/Tango/48/places/folder.png)';
      actual = this.depAnalyzer.getResourcesFromTagDesc(tag);
      expected = 'qx/icon/Tango/48/places/folder.png';
      test.strictEqual(actual, expected);

      test.done();
    },

    applyIgnoreRequireAndUse: function (test) {
      var actual = {};
      var expected = {};
      var className = '';

      var depsRequire = {
        load: [
          'qx.Bootstrap',
          'qx.log.Logger',
        ],
        run: [
          'qx.core.Environment'
        ],
        athint: {
          ignore: [],
          require: [
            'qx.log.appender.Util',
            'qx.bom.client.Html'
          ],
          use: []
        }
      };
      expected = {
        load: [
          'qx.Bootstrap',
          'qx.log.Logger',
          'qx.log.appender.Util',
          'qx.bom.client.Html'
        ]
      };
      className = 'qx.log.appender.Native';
      actual = this.depAnalyzer.applyIgnoreRequireAndUse(depsRequire, className);
      test.deepEqual(actual.load, expected.load);

      var depsIgnore = {
        load: [
          'qx.Bootstrap'
        ],
        run: [
          'qx.Class',
          'qx.lang.String',
          'qx.theme',
          'qx.theme.manager',
          'qx.theme.manager.Color'
        ],
        athint: {
          ignore: [
            'qx.theme.*',
            'qx.Class',
            'qx.Class.*'
          ],
          require: [],
          use: []
        }
      };
      expected = {
        run: [
          'qx.lang.String'
        ],
      };
      className = 'qx.util.ColorUtil';
      actual = this.depAnalyzer.applyIgnoreRequireAndUse(depsIgnore, className);
      test.deepEqual(actual.run, expected.run);

      var depsIgnoreAndRequire = {
        load: [
          'qx.Class',
          'qx.core.Environment',
          'qx.core.Object',
          'qx.event.GlobalError',
          'qx.event.IEventHandler',
          'qx.event.Registration',
        ],
        run: [
          'qx.bom.Event',
          'qx.bom.client.Device',
          'qx.bom.client.Engine',
          'qx.bom.client.Event',
          'qx.bom.client.OperatingSystem',
          'qx.dom.Hierarchy',
          'qx.event.handler.MouseEmulation',
          'qx.event.handler.DragDrop',
          'qx.event.type.Data',
          'qx.event.type.Mouse',
          'qx.event.type.MouseWheel',
          'qx.lang.Function'
        ],
        athint: {
          ignore: [
            'qx.event.handler.DragDrop'
          ],
          require: [
            'qx.event.handler.UserAction'
          ],
          use: [],
        }
      };
      expected = {
        load: [
          'qx.Class',
          'qx.core.Environment',
          'qx.core.Object',
          'qx.event.GlobalError',
          'qx.event.IEventHandler',
          'qx.event.Registration',
          'qx.event.handler.UserAction'
        ],
        run: [
          'qx.bom.Event',
          'qx.bom.client.Device',
          'qx.bom.client.Engine',
          'qx.bom.client.Event',
          'qx.bom.client.OperatingSystem',
          'qx.dom.Hierarchy',
          'qx.event.handler.MouseEmulation',
          'qx.event.type.Data',
          'qx.event.type.Mouse',
          'qx.event.type.MouseWheel',
          'qx.lang.Function'
        ],
      };
      className = 'qx.util.ColorUtil';
      actual = this.depAnalyzer.applyIgnoreRequireAndUse(depsIgnoreAndRequire, className);
      test.deepEqual(actual.run, expected.run);
      test.deepEqual(actual.load, expected.load);

      var depsUse = {
        load: [
          'qx.Class',
          'qx.core.Environment',
          'qx.event.Registration',
          'qx.event.dispatch.AbstractBubbling'
        ],
        run: [
          'qx.bom.Event',
          'qx.bom.client.Engine',
          'qx.dom.Hierarchy',
          'qx.event.handler.MouseEmulation',
          'qx.event.type.Event'
        ],
        athint: {
          ignore: [],
          require: [],
          use: [
            'qx.event.handler.Focus',
            'qx.event.handler.Window',
            'qx.event.handler.Capture'
          ],
        }
      };
      expected = {
        run: [
          'qx.bom.Event',
          'qx.bom.client.Engine',
          'qx.dom.Hierarchy',
          'qx.event.handler.MouseEmulation',
          'qx.event.type.Event',
          'qx.event.handler.Focus',
          'qx.event.handler.Window',
          'qx.event.handler.Capture'
        ],
      };
      className = 'qx.event.dispatch.MouseCapture';
      actual = this.depAnalyzer.applyIgnoreRequireAndUse(depsUse, className);
      test.deepEqual(actual.run, expected.run);

      test.done();
    },

    collectAtHintsFromComments: function (test) {
      var jsCode = "\n"+
        "/**\n"+
        " * This class is one of the most important parts of qooxdoo's\n"+
        " * object-oriented features.\n"+
        " *\n"+
        " * @require(qx.Interface)\n"+
        " * @cldr\n"+
        " */\n"+
        "qx.Bootstrap.define('qx.Class',{});\n"+
        "\n"+
        "/**\n"+
        " * @use(qx.Mixin)\n"+
        " * @asset(foo/*)\n"+
        " * @ignore(qx.log.Logger)\n"+
        " */\n"+
        "(function(){})()\n";

      var esprima = require('esprima');
      var tree = esprima.parse(jsCode, {comment: true, loc: true});

      var actual = this.depAnalyzer.collectAtHintsFromComments(tree);
      var expected = {
        ignore: ['qx.log.Logger'],
        require: ['qx.Interface'],
        use: ['qx.Mixin'],
        asset: ['foo/*'],
        cldr: true
      };

      test.deepEqual(actual, expected);

      test.done();
    }
  },

  // test exported functions
  external: {
    setUp: function(done) {
      this.depAnalyzer = require('../lib/depAnalyzer.js');
      done();
    },

    findUnresolvedDeps: function (test) {
      var fs = require('fs');
      var esprima = require('esprima');

      var curFullPath = './test/data/myapp/source/class/myapp/Application.js';
      var jsCode = fs.readFileSync(curFullPath, {encoding: 'utf8'});
      var tree = esprima.parse(jsCode, {comment: true, loc: true});

      var actualClassDeps = this.depAnalyzer.findUnresolvedDeps(tree, {}, {flattened: false, variants: false});
      var expectedClassDeps = {
        load: [
          'qx.Class',
          'qx.application.Standalone'
        ],
        run: [
          'qx.core.Environment',
          'qx.log.appender.Console',
          'qx.log.appender.Native',
          'qx.ui.form.Button'
        ],
        athint: {
          ignore: [],
          require: [],
          use: [],
          asset: ['myapp/*'],
          cldr: false
        }
      };

      test.deepEqual(actualClassDeps, expectedClassDeps);

      test.done();
    },

    collectDepsRecursive: function (test) {
      var excludedClassIds = ['myapp.test.*'];
      var classesDeps = this.depAnalyzer.collectDepsRecursive(
        {'myapp': './test/data/myapp/source/class/',
         'qx': '../../../../../framework/source/class/'},
        ['myapp.Application', 'myapp.theme.Theme'],
        excludedClassIds,
        {}
      );

      test.ok(Object.keys(classesDeps).length, 247);
      test.ok(!!classesDeps['myapp.Application'].load);
      test.ok(!!classesDeps['myapp.Application'].run);
      test.ok(!!classesDeps['myapp.Application'].athint);
      test.ok(!!classesDeps['myapp.Application'].athint.ignore);
      test.ok(!!classesDeps['myapp.Application'].athint.require);
      test.ok(!!classesDeps['myapp.Application'].athint.use);
      test.ok(!!classesDeps['myapp.Application'].athint.asset);
      test.ok(!classesDeps['myapp.Application'].athint.cldr);

      test.done();
    },

    createAtHintsIndex: function (test) {
      var deps = {
        'qx.Foo': {
          'athint': {
            'ignore': [],
            'require': [
              'qx.lang.normalize.Array',
              'qx.lang.normalize.Date',
              'qx.lang.normalize.Error'
            ],
            'use': [],
            'asset': [
              'myapp/*'
            ],
            'cldr': false
          }
        },
        'qx.Bar': {
          'athint': {
            'ignore': [
              'qx.Interface',
            ],
            'require': [
              'qx.Mixin',
              'qx.lang.normalize.Function',
              'qx.lang.normalize.Object'
            ],
            'use': [
              'qx.lang.normalize.String'
            ],
            'asset': [],
            'cldr': false
          }
        },
        'qx.Fugu': {
          'athint': {
            'ignore': [
              'qx.data',
              'qx.data.IListData',
              'qx.util.OOUtil'
            ],
            'require': [],
            'use': [],
            'asset': [],
            'cldr': true
          }
        }
      };

      var expected = {
        ignore: {
          'qx.Bar': ['qx.Interface'],
          'qx.Fugu': ['qx.data', 'qx.data.IListData', 'qx.util.OOUtil'] },
        require: {
          'qx.Foo': [
            'qx.lang.normalize.Array',
            'qx.lang.normalize.Date',
            'qx.lang.normalize.Error'
          ],
          'qx.Bar': [
            'qx.Mixin',
            'qx.lang.normalize.Function',
            'qx.lang.normalize.Object'
          ]
        },
        use: {'qx.Bar': ['qx.lang.normalize.String']},
        asset: {'qx.Foo': ['myapp/*']},
        cldr: ['qx.Fugu']
      };
      var actual = this.depAnalyzer.createAtHintsIndex(deps);
      test.deepEqual(actual, expected);

      var optsOnlyCldr = {
        ignore: false,
        require: false,
        use: false,
        asset: false
      };
      actual = this.depAnalyzer.createAtHintsIndex(deps, optsOnlyCldr);
      expected = {cldr: ['qx.Fugu']};
      test.deepEqual(actual, expected);

      test.done();
    },

    sortDepsTopologically: function (test) {
      var deps = {
        'A':  { load: ['B','C'], run: ['D'] },
        'Aa': { load: ['D'], run: [] },
        'B':  { load: ['C'], run: [] },
        'C':  { load: ['E'], run: ['D'] },
        'D':  { load: [], run: [] },
        'E':  { load: [], run: ['D'] }
      };

      // no excludes
      var actual = this.depAnalyzer.sortDepsTopologically(deps, 'load', []);
      var expected = ['E', 'C', 'B', 'A', 'D', 'Aa'];
      test.deepEqual(actual, expected);

      // excludes w/o glob
      actual = this.depAnalyzer.sortDepsTopologically(deps, 'load', ['A']);
      expected = ['E', 'C', 'B', 'D', 'Aa'];
      test.deepEqual(actual, expected);

      // excludes w/ glob
      actual = this.depAnalyzer.sortDepsTopologically(deps, 'load', ['A*']);
      expected = ['E', 'C', 'B', 'D'];
      test.deepEqual(actual, expected);

      test.done();
    },

    prependNamespace: function (test) {
      var classList = [
        'q.js',
        'qxWeb.js',
        'my.foo.namespace.Application',
        'qx.log.appender.Console',
        'qx.ui.core.MExecutable',
        'qx.ui.form.Button'
      ];
      var classListExpected = [
        'qx:q.js',
        'qx:qxWeb.js',
        'my.foo.namespace:my.foo.namespace.Application',
        'qx:qx.log.appender.Console',
        'qx:qx.ui.core.MExecutable',
        'qx:qx.ui.form.Button'
      ];

      var namespaces =  ['qx','my.foo.namespace'];
      var actualClassList = this.depAnalyzer.prependNamespace(classList, namespaces);
      test.deepEqual(actualClassList, classListExpected);

      test.done();
    },

    translateClassIdsToPaths: function (test) {
      var classListLong = [
        'qx:qx.log.appender.Console',
        'qx:qx.ui.core.MExecutable',
        'qx:qx.ui.form.Button'
      ];
      var classListSmall = [
        'qx.log.appender.Console',
        'qx.ui.core.MExecutable',
        'qx.ui.form.Button'
      ];

      var actualLong = this.depAnalyzer.translateClassIdsToPaths(classListLong);
      var expectedClassListLong = [
        'qx:qx/log/appender/Console.js',
        'qx:qx/ui/core/MExecutable.js',
        'qx:qx/ui/form/Button.js'
      ];
      test.deepEqual(actualLong, expectedClassListLong);

      var actualSmall = this.depAnalyzer.translateClassIdsToPaths(classListSmall);
      var expectedClassListSmall = [
        'qx/log/appender/Console.js',
        'qx/ui/core/MExecutable.js',
        'qx/ui/form/Button.js'
      ];
      test.deepEqual(actualSmall, expectedClassListSmall);

      test.done();
    },

    getAbsFilePath: function(test) {
      var actualOk = this.depAnalyzer.getAbsFilePath(
        'myapp.Application',
        {'myapp': './test/data/myapp/source/class/',
         'qx': '../../../../../framework/source/class/'}
      );

      test.strictEqual(actualOk, path.normalize('test/data/myapp/source/class/myapp/Application.js'));

      // ENOENT - Missing library
      test.throws(
        function() {
          this.depAnalyzer.getAbsFilePath('myapp.Application', {});
        },
        Error
      );

      // ENOENT - Path doesn't exist
      test.throws(
        function() {
          this.depAnalyzer.getAbsFilePath(
            'myapp.Foo',
            {'myapp': './test/data/myapp/source/class/',
             'qx': '../../../../../framework/source/class/'}
          );
        },
        Error
      );

      test.done();
    },

    readFileContent: function(test) {
      var actualOk = this.depAnalyzer.readFileContent(
        ['myapp.Application', 'myapp.theme.Theme'],
        {'myapp': './test/data/myapp/source/class/',
         'qx': '../../../../../framework/source/class/'}
      );

      test.strictEqual(actualOk[0].substr(0, 4), '/* *');

      test.done();
    }
  }
};
