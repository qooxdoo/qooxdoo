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

  // test exported functions
  external: {
    setUp: function(done) {
      this.util = require('../lib/util.js');
      done();
    },

    pipeline: function(test) {
      var _ = require('underscore');
      var a = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      var onlyMod2 = function(num) {
        return (num % 2) === 0;
      };
      var onlySmallerThan6 = function(num) {
        return (num < 6);
      };

      var actual = this.util.pipeline(
        a,
        _.partial(this.util.filter, onlyMod2),
        _.partial(this.util.filter, onlySmallerThan6)
      );
      test.deepEqual(actual, [2, 4]);

      test.done();
    },

    filter: function(test) {
      var a = [1, 2, 3, 4];
      var onlyMod2 = function(num) {
        return (num % 2) === 0;
      };

      var actual = this.util.filter(onlyMod2, a);
      var expected = a.filter(onlyMod2);
      test.deepEqual(actual, expected);

      test.done();
    },

    namespaceFrom: function(test) {
      var allNamespaces = ['qx', 'qx.Foo'];
      var className = 'qx.Foo.Bar';

      var actual = this.util.namespaceFrom(className, allNamespaces);
      var expected = 'qx.Foo';
      test.strictEqual(actual, expected);

      actual = this.util.namespaceFrom('qxWeb', []);
      expected = 'qx';
      test.strictEqual(actual, expected);

      actual = this.util.namespaceFrom('q', []);
      expected = 'qx';
      test.strictEqual(actual, expected);

      test.done();
    },

    classNameFrom: function(test) {
      var filePath = "foo/bar/qx/Foo/Bar.js";
      var basePath = "foo/bar";

      var actual = this.util.classNameFrom(filePath, basePath);
      var expected = 'qx.Foo.Bar';
      test.strictEqual(actual, expected);

      actual = this.util.classNameFrom(filePath);
      expected = 'foo.bar.qx.Foo.Bar';
      test.strictEqual(actual, expected);

      test.done();
    },

    filePathFrom: function(test) {
      var className = "qx.Foo.Bar";
      var basePath = "foo/bar";

      var actual = this.util.filePathFrom(className, basePath, true);
      var expected = 'foo/bar/qx/Foo/Bar';
      test.strictEqual(actual, expected);

      actual = this.util.filePathFrom(className, basePath, false);
      expected = 'foo/bar/qx/Foo/Bar.js';
      test.strictEqual(actual, expected);

      actual = this.util.filePathFrom(className);
      expected = 'qx/Foo/Bar.js';
      test.strictEqual(actual, expected);

      test.done();
    },

    get: function(test) {
      var nestedObj = {a:{b:{c:{d:1}}}};

      actual = this.util.get(nestedObj, "a.b.c");
      test.deepEqual(actual, {d:1});

      var actual = this.util.get(nestedObj, "a.b.c.d");
      test.strictEqual(actual, 1);

      actual = this.util.get(nestedObj, "a.x.y.z");
      test.strictEqual(actual, undefined);

      test.done();
    }
  }
};
