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
      // sandbox depAnalyzer to be able to call non-exported functions
      var sandbox = require('nodeunit').utils.sandbox;
      var boxGlobals = {
        // inject commen globals
        module: {exports: exports},
        require: require,
        console: console,
      };

      this.compression = sandbox('lib/compression.js', boxGlobals);

      done();
    },

    convertIntToChar: function(test) {
      test.strictEqual(this.compression.convertIntToChar(0), 'a');
      test.strictEqual(this.compression.convertIntToChar(1), 'b');

      test.done();
    },

    shortenPrivate: function(test) {
      test.strictEqual(this.compression.shortenPrivate("qx.foo.Bar", "foo", {}), "__a");
      test.strictEqual(this.compression.shortenPrivate("qx.foo.Bar", "foo", {"qx.foo.Bar#foo": "__xyz"}), "__xyz");

      test.done();
    },

    hasStartingDunderButNotTrailingDunder: function(test) {
      test.ok(this.compression.hasStartingDunderButNotTrailingDunder("__abc"));
      test.ok(!this.compression.hasStartingDunderButNotTrailingDunder("__abc__"));

      test.done();
    },

    collectAstObjectKeyValPrivates: function(test) {
      var fakeClass = function fn() {
        return {
          extend: Object,

          construct: function(maxEntries)
          {
            this.setMaxEntries(maxEntries || 50);
          },

          members:
          {
            __foo : 0,
            ignoreMe: true,

            ignoreMeToo: function() {},
            __bar: function() {}
          },
        };
      };

      var privateNodes = this.compression.collectAstObjectKeyValPrivates(fakeClass.toString());
      test.ok(privateNodes.length, 2);
      test.strictEqual(privateNodes[0].start.value, "__foo");
      test.strictEqual(privateNodes[1].start.value, "__bar");

      test.done();
    },

    replaceAstObjectKeyValPrivates: function(test) {
      var fakeClass = function fn() {
        return {
          extend: Object,

          construct: function(maxEntries)
          {
            this.setMaxEntries(maxEntries || 50);
          },

          members:
          {
            __foo : 0,
            ignoreMe: true,

            ignoreMeToo: function() {},
            __bar: function() {}
          },
        };
      };

      var actualCode = this.compression.replaceAstObjectKeyValPrivates(
        "qx.foo.Bar",
        fakeClass.toString(),
        this.compression.collectAstObjectKeyValPrivates(fakeClass.toString()),
        {}
      );

      test.ok(actualCode.indexOf("__b") !== -1);
      test.ok(actualCode.indexOf("__a") !== -1);

      test.done();
    },

    collectAstStrings: function(test) {
      var fakeClass = function fn() {
        return {
          extend: Object,

          members:
          {
            foo: function() { var a = "__bar"; },
          },
        };
      };

      var privateNodes = this.compression.collectAstStrings(fakeClass.toString());
      test.ok(privateNodes.length, 1);
      test.strictEqual(privateNodes[0].start.value, "__bar");

      test.done();
    },

    replaceAstStrings: function(test) {
      var fakeClass = function fn() {
        return {
          extend: Object,

          members:
          {
            foo: function() { var a = "__bar"; },
          },
        };
      };

      var actualCode = this.compression.replaceAstStrings(
        "qx.foo.Bar",
        fakeClass.toString(),
        this.compression.collectAstStrings(fakeClass.toString()),
        {}
      );

      test.ok(actualCode.indexOf("__a") !== -1);

      test.done();
    },

    collectAstDotPrivates: function(test) {
      var fakeClass = function fn() {
        return {
          extend: Object,

          members:
          {
            foo: function() { this.__bar = true; },
          },
        };
      };

      var privateNodes = this.compression.collectAstDotPrivates(fakeClass.toString());
      test.ok(privateNodes.length, 1);
      test.strictEqual(privateNodes[0].property, "__bar");

      test.done();
    },

    replaceAstDotPrivates: function(test) {
      var fakeClass = function fn() {
        return {
          extend: Object,

          members:
          {
            foo: function() { this.__bar = true; },
          },
        };
      };

      var actualCode = this.compression.replaceAstDotPrivates(
        "qx.foo.Bar",
        fakeClass.toString(),
        this.compression.collectAstDotPrivates(fakeClass.toString()),
        {}
      );

      test.ok(actualCode.indexOf("__a") !== -1);

      test.done();
    },

    replaceSourceCode: function(test) {
      var code = "abc aaa def";

      test.strictEqual(this.compression.replaceSourceCode(code, 4, 7, "zzz"), "abc zzz def");

      test.done();
    },

    replacePrivates: function(test) {
      var fakeClass = function fn() {
        return {
          extend: Object,

          construct: function(maxEntries)
          {
            this.setMaxEntries(maxEntries || 50);
          },

          members:
          {
            __foo : 0,
            ignoreMe: true,

            ignoreMeToo: function() {},
            __bar: function() {},
            baz: function() { var a = "__fugu"; }
          },
        };
      };

      var actualCode = this.compression.replacePrivates(
        "qx.foo.Bar",
        fakeClass.toString()
      );

      test.ok(actualCode.indexOf("__a") !== -1);
      test.ok(actualCode.indexOf("__b") !== -1);
      test.ok(actualCode.indexOf("__c") !== -1);

      test.done();
    }

  },

  // test exported functions
  external: {
    setUp: function(done) {
      this.compression = require('../lib/compression.js');
      done();
    },

    compress: function(test) {
      var fakeClass = function fn() {
        return {
          extend: Object,

          construct: function(maxEntries)
          {
            this.setMaxEntries(maxEntries || 50);
          },

          members:
          {
            __foo : 0,
            ignoreMe: true,

            ignoreMeToo: function() {},
            __bar: function() {},
            baz: function() { var a = "__fugu"; }
          },
        };
      };

      var actualCodeWithPrivates = this.compression.compress(
        "qx.foo.Bar",
        fakeClass.toString(),
        null,
        {}
      );

      test.ok(actualCodeWithPrivates.indexOf("__a") !== -1);
      test.equal(actualCodeWithPrivates.match(/\n/g), null);

      var actualCodeWithoutPrivates = this.compression.compress(
        "qx.foo.Bar",
        fakeClass.toString(),
        null,
        {privates: false}
      );

      test.ok(actualCodeWithoutPrivates.indexOf("__a") === -1);
      test.equal(actualCodeWithoutPrivates.match(/\n/g), null);

      test.done();
    }
  }
};
