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
  setUp: function(done) {
    this.library = require('../lib/library.js');
    this.testManifestPaths = [
      './test/data/myapp/Manifest.json',
      './test/data/framework/Manifest.json'
    ];
    done();
  },

  getPathsFromManifest: function (test) {
    var expected = ['myapp', 'qx'];
    var actual = this.library.getPathsFromManifest(this.testManifestPaths);
    test.deepEqual(Object.keys(actual), expected);

    test.done();
  },

  getPathsFor: function (test) {
    var expectedClassWithKeys = {
      myapp: path.normalize('test/data/myapp/source/class'),
      qx: path.normalize('test/data/framework/source/class')
    };
    var actualClassWithKeys = this.library.getPathsFor('class', this.testManifestPaths, {withKeys: true});
    test.deepEqual(actualClassWithKeys, expectedClassWithKeys);

    var expectedRessourceWithKeys = {
      myapp: path.normalize('test/data/myapp/source/resource'),
      qx: path.normalize('test/data/framework/source/resource')
    };
    var actualResourceWithKeys = this.library.getPathsFor('resource', this.testManifestPaths, {withKeys: true});
    test.deepEqual(actualResourceWithKeys, expectedRessourceWithKeys);

    var expectedTranslationWithKeys = {
      myapp: path.normalize('test/data/myapp/source/translation'),
      qx: path.normalize('test/data/framework/source/translation')
    };
    var actualTranslationWithKeys = this.library.getPathsFor('translation', this.testManifestPaths, {withKeys: true});
    test.deepEqual(actualTranslationWithKeys, expectedTranslationWithKeys);

    var expectedClass = [
      path.normalize('test/data/myapp/source/class'),
      path.normalize('test/data/framework/source/class')
    ];
    var actualClass = this.library.getPathsFor('class', this.testManifestPaths);
    test.deepEqual(actualClass, expectedClass);

    var expectedResource = [
      path.normalize('test/data/myapp/source/resource'),
      path.normalize('test/data/framework/source/resource')
    ];
    var actualResource = this.library.getPathsFor('resource', this.testManifestPaths);
    test.deepEqual(actualResource, expectedResource);

    var expectedTranslation = [
      path.normalize('test/data/myapp/source/translation'),
      path.normalize('test/data/framework/source/translation')
    ];
    var actualTranslation = this.library.getPathsFor('translation', this.testManifestPaths);
    test.deepEqual(actualTranslation, expectedTranslation);

    test.done();
  }
};

