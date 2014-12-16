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
    setUp: function(done) {
      this.path = require('path');

      // sandbox resource to be able to call non-exported functions
      var sandbox = require('nodeunit').utils.sandbox;
      var boxGlobals = {
        // inject commen globals
        module: {exports: exports},
        require: require,
        console: console,
        // inject all local modules cause rel paths in resource.js won't fit
        qxResource: {
          Image: require('../lib/qxResource/Image'),
          Resource: require('../lib/qxResource/Resource')
        },
      };

      this.res = sandbox('lib/resource.js', boxGlobals);

      done();
    },

    findResourceMetaFiles: function(test) {
      var actual = this.res.findResourceMetaFiles('.');
      var expected = ['test/data/myapp/source/resource/myapp/tree-combined.meta'];

      test.deepEqual(actual, expected);

      test.done();
    },

    processMetaFiles: function(test) {
      var metaFile = ['source/resource/myapp/tree-combined.meta'];
      var actual = this.res.processMetaFiles(metaFile, 'test/data/myapp');

      test.equal(Object.keys(actual).length, 4);

      test.done();
    },

    basePathForNsExistsOrError: function(test) {
      var namespaces = ['myapp', 'qx'];
      var resBasePathMap = {myapp:[], qx:[]};
      var res = this.res;
      test.doesNotThrow(function() {
        res.basePathForNsExistsOrError(namespaces, resBasePathMap);
      });
      test.throws(function() {
        res.basePathForNsExistsOrError(['badns'], resBasePathMap);
      });

      test.done();
    },

    namespaceFrom: function(test) {
      var allNamespaces = ['qx', 'qx.Foo'];
      var className = 'qx.Foo.Bar';

      var actual = this.res.namespaceFrom(className, allNamespaces);
      var expected = 'qx.Foo';
      test.strictEqual(actual, expected);

      actual = this.res.namespaceFrom('qxWeb', []);
      expected = 'qx';
      test.strictEqual(actual, expected);

      actual = this.res.namespaceFrom('q', []);
      expected = 'qx';
      test.strictEqual(actual, expected);

      test.done();
    },

    flattenAssetPathsByNamespace: function(test) {
      var namespaces = ['myapp', 'qx'];
      var assetPaths = {
        'myapp.Application': [
          'myapp/*',
          'qx/icon/${qx.icontheme}/128/categories/*'
        ],
        'myapp.Manager': [
          'qx/icon/Oxygen/16/places/folder-open.png'
        ],
        'qx.ui.core.Widget': [
          'qx/static/blank.gif'
        ],
        'qx.theme.modern.Appearance': [
          'qx/icon/Tango/16/places/folder-open.png',
          'qx/icon/Tango/16/places/folder.png',
        ],
        'qx.theme.modern.Decoration': [
          'qx/decoration/Modern/toolbar/toolbar-part.gif'
        ]
      };
      var expected = {
        'myapp': [
          'myapp/*',
          'qx/icon/${qx.icontheme}/128/categories/*',
          'qx/icon/Oxygen/16/places/folder-open.png'
        ],
        'qx': [
          'qx/static/blank.gif',
          'qx/icon/Tango/16/places/folder-open.png',
          'qx/icon/Tango/16/places/folder.png',
          'qx/decoration/Modern/toolbar/toolbar-part.gif'
        ]
      };
      var actual = this.res.flattenAssetPathsByNamespace(assetPaths, namespaces);
      test.deepEqual(actual, expected);

      test.done();
    },

    globAndSanitizePaths: function(test) {
      var absQxPath = '../../../../../framework';
      var absAppPath = './test/data/myapp/';
      var relQxResourcePath = 'source/resource';
      var relAppResourcePath = 'source/resource';

      var resBasePathMap = {
        'qx': this.path.join(absQxPath, relQxResourcePath),
        'myapp': this.path.join(absAppPath, relAppResourcePath)
      };

      var assetPaths = {
        'myapp': [
          'myapp/*',
          'qx/icon/Oxygen/16/places/folder-open.png'
        ],
        'qx': [
          'qx/static/blank.gif',
          'qx/icon/Tango/16/places/folder-open.png',
          'qx/icon/Tango/16/places/folder.png',
          'qx/decoration/Modern/toolbar/toolbar-part.gif'
        ]
      };

      var expected = {
        myapp: {
          myapp: [
            'myapp/ace.js',
            'myapp/test.png'
          ],
          qx: [
            'qx/icon/Oxygen/16/places/folder-open.png'
          ]
        },
        qx: {
          myapp: [],
          qx: [
            'qx/static/blank.gif',
            'qx/icon/Tango/16/places/folder-open.png',
            'qx/icon/Tango/16/places/folder.png',
            'qx/decoration/Modern/toolbar/toolbar-part.gif'
          ]
        }
      };

      var actual = this.res.globAndSanitizePaths(assetPaths, resBasePathMap);
      test.deepEqual(actual, expected);

      test.done();
    },

    createResources: function(test) {
      var absAppPath = './test/data/myapp/';
      var relAppResourcePath = 'source/resource';
      var myappBasePath = this.path.join(absAppPath, relAppResourcePath);

      var actual = this.res.createResources('image', ['myapp/test.png'], 'myapp', myappBasePath);
      var expected = { 'myapp/test.png': [ 32, 32, 'png', 'myapp' ] };
      test.deepEqual(actual[0].stringify(), expected);

      actual = this.res.createResources('plainResource', ['myapp/ace.js'], 'myapp', myappBasePath);
      expected = { 'myapp/ace.js': 'myapp' };
      test.deepEqual(actual[0].stringify(), expected);

      test.done();
    },

    createResourceInfoMaps: function(test) {
      var absQxPath = '../../../../../framework';
      var relQxResourcePath = 'source/resource';
      var qxBasePath = this.path.join(absQxPath, relQxResourcePath);
      var qxImgs = [
        'qx/icon/Tango/16/places/folder-open.png',
        'qx/icon/Tango/16/places/folder.png'
      ];

      var actual = this.res.createResources('image', qxImgs, 'qx', qxBasePath);
      actual = actual.map(function(img){
        return img.stringify();
      });

      var expected = [
        { 'qx/icon/Tango/16/places/folder-open.png': [ 16, 16, 'png', 'qx' ] },
        { 'qx/icon/Tango/16/places/folder.png': [ 16, 16, 'png', 'qx' ] }
      ];

      test.deepEqual(actual, expected);

      test.done();
    },

    collectUsedMetaEntries: function(test) {
      var absQxPath = '../../../../../framework';
      var absAppPath = './test/data/myapp/';
      var relQxResourcePath = 'source/resource';
      var relAppResourcePath = 'source/resource';

      var resBasePathMap = {
        'qx': this.path.join(absQxPath, relQxResourcePath),
        'myapp': this.path.join(absAppPath, relAppResourcePath)
      };

      var assetPaths = {
        'myapp': {
          myapp: [],
          qx: ['qx/icon/Oxygen/16/places/folder-open.png']
        },
        'qx': {
          qx: [
            'qx/static/blank.gif',
            'qx/decoration/Modern/tree/open-selected.png'
          ]
        }
      };

      var actual = this.res.collectUsedMetaEntries(assetPaths, resBasePathMap);
      var expected = {
        'qx/decoration/Modern/tree/open-selected.png': [
          8, 8, 'png', 'qx', 'qx/decoration/Modern/tree-combined.png', -8, 0
        ]
      };

      test.deepEqual(actual, expected);

      test.done();
    },

    expandAssetMacros: function(test) {
      var macroToExpansionMap = {
        '${qx.icontheme}': 'Tango'
      };
      var assetPaths = {
        'myapp': [ 'qx/icon/${qx.icontheme}/128/categories/*' ],
      };

      var actual = this.res.expandAssetMacros(assetPaths, macroToExpansionMap);
      var expected = { myapp: [ 'qx/icon/Tango/128/categories/*' ] };

      test.deepEqual(actual, expected);

      test.done();
    }
  },

  // test exported functions
  external: {
    setUp: function (done) {
      this.path = require('path');
      this.res = require('../lib/resource.js');

      done();
    },

    flattenExpandAndGlobAssets: function(test) {
      var absQxPath = '../../../../../framework';
      var absAppPath = './test/data/myapp/';
      var relQxResourcePath = 'source/resource';
      var relAppResourcePath = 'source/resource';

      var resBasePathMap = {
        'qx': this.path.join(absQxPath, relQxResourcePath),
        'myapp': this.path.join(absAppPath, relAppResourcePath)
      };

      var assets = {
        'myapp.Application': [
          'myapp/*',
          'qx/icon/${qx.icontheme}/128/categories/*'
        ],
        'myapp.Manager': [
          'qx/icon/Oxygen/16/places/folder-open.png'
        ],
        'qx.ui.core.Widget': [
          'qx/static/blank.gif'
        ],
        'qx.theme.modern.Appearance': [
          'qx/icon/Tango/16/places/folder-open.png',
          'qx/icon/Tango/16/places/folder.png',
        ],
        'qx.theme.modern.Decoration': [
          'qx/decoration/Modern/toolbar/toolbar-part.gif'
        ]
      };

      var macroToExpansionMap = {
        '${qx.icontheme}': 'Tango'
      };

      var actual = this.res.flattenExpandAndGlobAssets(
        assets,
        resBasePathMap,
        macroToExpansionMap
      );

      var expected = {
        myapp: {
          myapp: [ 'myapp/ace.js', 'myapp/test.png' ],
          qx: [
            'qx/icon/Oxygen/16/places/folder-open.png',
            'qx/icon/Tango/128/categories/accessories.png',
            'qx/icon/Tango/128/categories/development.png',
            'qx/icon/Tango/128/categories/engineering.png',
            'qx/icon/Tango/128/categories/games.png',
            'qx/icon/Tango/128/categories/graphics.png',
            'qx/icon/Tango/128/categories/internet.png',
            'qx/icon/Tango/128/categories/multimedia.png',
            'qx/icon/Tango/128/categories/office.png',
            'qx/icon/Tango/128/categories/science.png',
            'qx/icon/Tango/128/categories/system.png',
            'qx/icon/Tango/128/categories/utilities.png'
          ]
        },
        qx: {
          myapp: [],
          qx: [
            'qx/static/blank.gif',
            'qx/icon/Tango/16/places/folder-open.png',
            'qx/icon/Tango/16/places/folder.png',
            'qx/decoration/Modern/toolbar/toolbar-part.gif'
          ]
        }
      };

      test.deepEqual(actual, expected);

      test.done();
    },

    collectResources: function(test) {
      var absQxPath = '../../../../../framework';
      var absAppPath = './test/data/myapp/';
      var relQxResourcePath = 'source/resource';
      var relAppResourcePath = 'source/resource';

      var resBasePathMap = {
        'qx': this.path.join(absQxPath, relQxResourcePath),
        'myapp': this.path.join(absAppPath, relAppResourcePath)
      };

      var assetNsBasesPaths = {
        myapp: {
          myapp: [ 'myapp/ace.js', 'myapp/test.png' ],
          qx: [
            'qx/icon/Oxygen/16/places/folder-open.png',
            'qx/icon/Tango/128/categories/accessories.png',
            'qx/icon/Tango/128/categories/development.png',
            'qx/icon/Tango/128/categories/engineering.png',
            'qx/icon/Tango/128/categories/games.png',
            'qx/icon/Tango/128/categories/graphics.png',
            'qx/icon/Tango/128/categories/internet.png',
            'qx/icon/Tango/128/categories/multimedia.png',
            'qx/icon/Tango/128/categories/office.png',
            'qx/icon/Tango/128/categories/science.png',
            'qx/icon/Tango/128/categories/system.png',
            'qx/icon/Tango/128/categories/utilities.png'
          ]
        },
        qx: {
          myapp: [],
          qx: [
            'qx/static/blank.gif',
            'qx/icon/Tango/16/places/folder-open.png',
            'qx/icon/Tango/16/places/folder.png',
            'qx/decoration/Modern/toolbar/toolbar-part.gif'
          ]
        }
      };

      var actual = this.res.collectResources(
        assetNsBasesPaths,
        resBasePathMap,
        {metaFiles:true}
      );

      var expected = {
        'myapp/ace.js': 'myapp',
        'myapp/test.png': [ 32, 32, 'png', 'myapp' ],
        'qx/icon/Oxygen/16/places/folder-open.png': [ 16, 16, 'png', 'qx' ],
        'qx/icon/Tango/128/categories/accessories.png': [ 128, 128, 'png', 'qx' ],
        'qx/icon/Tango/128/categories/development.png': [ 128, 128, 'png', 'qx' ],
        'qx/icon/Tango/128/categories/engineering.png': [ 128, 128, 'png', 'qx' ],
        'qx/icon/Tango/128/categories/games.png': [ 128, 128, 'png', 'qx' ],
        'qx/icon/Tango/128/categories/graphics.png': [ 128, 128, 'png', 'qx' ],
        'qx/icon/Tango/128/categories/internet.png': [ 128, 128, 'png', 'qx' ],
        'qx/icon/Tango/128/categories/multimedia.png': [ 128, 128, 'png', 'qx' ],
        'qx/icon/Tango/128/categories/office.png': [ 128, 128, 'png', 'qx' ],
        'qx/icon/Tango/128/categories/science.png': [ 128, 128, 'png', 'qx' ],
        'qx/icon/Tango/128/categories/system.png': [ 128, 128, 'png', 'qx' ],
        'qx/icon/Tango/128/categories/utilities.png': [ 128, 128, 'png', 'qx' ],
        'qx/static/blank.gif': [ 1, 1, 'gif', 'qx' ],
        'qx/icon/Tango/16/places/folder-open.png': [ 16, 16, 'png', 'qx' ],
        'qx/icon/Tango/16/places/folder.png': [ 16, 16, 'png', 'qx' ],
        'qx/decoration/Modern/toolbar/toolbar-part.gif': [ 7, 1, 'gif', 'qx' ]
      };

      test.deepEqual(actual, expected);

      test.done();
    },

    copyResources: function(test) {
      // require 'shelljs' to then monkey patch
      var shell = require('shelljs');
      var orig_shell_cp = shell.cp;
      var orig_shell_mkdir = shell.mkdir;

      var expectedSource = [
        this.path.normalize('test/data/myapp/source/resource/myapp/ace.js'),
        this.path.normalize('test/data/myapp/source/resource/myapp/test.png')
      ];
      var expectedTarget = [
        this.path.normalize('test/data/myapp/build/resource/myapp/ace.js'),
        this.path.normalize('test/data/myapp/build/resource/myapp/test.png')
      ];

      // monkey patch
      shell.mkdir = function() {};
      shell.cp = function(flag, resSourcePath, resTargetPath) {
        test.ok(expectedSource.indexOf(resSourcePath) > -1);
        test.ok(expectedTarget.indexOf(resTargetPath) > -1);
      };

      var absAppPath = './test/data/myapp/';
      var relAppResourcePath = 'source/resource';
      var resBasePathMap = {
        'myapp': this.path.join(absAppPath, relAppResourcePath)
      };
      var assetNsBasesPaths = {
        myapp: {
          myapp: [
            this.path.normalize('myapp/ace.js'),
            this.path.normalize('myapp/test.png')
          ]
        }
      };

      this.res.copyResources(
        this.path.join(absAppPath, "build/resource"),
        resBasePathMap,
        assetNsBasesPaths
      );

      // don't forget to restore original!
      shell.mkdir = orig_shell_mkdir;
      shell.cp = orig_shell_cp;

      test.done();
    }
  }
};
