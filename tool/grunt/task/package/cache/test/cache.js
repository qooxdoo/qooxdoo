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
  // test private methods
  internal: {
    setUp: function(done) {
      var Cache = require('../lib/Cache.js');
      this.cache = new Cache(path.join(__dirname, 'tmp'));

      done();
    },

    __buildDigest: function(test) {
      var actual = this.cache.__buildDigest('prefix-toBeHashed','-');
      var expected = 'prefix-3b0815acc34b27128f7dc91df8f1842616f2660e';

      test.equal(actual, expected);
      test.done();
    },

    __buildAbsFilePath: function(test) {
      var actual = this.cache.__buildAbsFilePath(__dirname, 'prefix-toBeHashed');

      test.ok(/.+prefix-3b0815acc34b27128f7dc91df8f1842616f2660e$/.test(actual));
      test.done();
    },

    __addGetIsMemCache: function(test) {
      this.cache.__addToMemCache('prefix-0123456789abcdef', 'some content');

      test.ok(this.cache.__isInMemCache('prefix-0123456789abcdef'));
      test.ok(!this.cache.__isInMemCache('not-in-mem-cache'));

      test.equal(this.cache.__getFromMemCache('prefix-0123456789abcdef').content, "some content");
      test.done();
    }
  },

  // test public methods
  external: {
    setUp: function (done) {
      var Cache = require('../lib/Cache.js');
      this.cache = new Cache(path.join(__dirname, 'tmp'));

      done();
    },

    createCacheId: function(test) {
      var actual = this.cache.createCacheId('dep', {'a':'b'}, 'qx.foo.Bar', 'source');
      var expected = 'dep#source#f19667405306ef12c6e6541a9326e358235b8a14-qx.foo.Bar';
      var actual2 = this.cache.createCacheId('dep', {'a':'b'}, 'qx.foo.Bar');
      var expected2 = 'dep#f19667405306ef12c6e6541a9326e358235b8a14-qx.foo.Bar';

      test.equals(actual, expected);
      test.equals(actual2, expected2);

      test.done();
    },

    getPath: function(test) {
      test.ok(/.+tmp$/.test(this.cache.getPath()));
      test.done();
    },

    writeReadHas: function(test) {
      this.cache.write('prefix-0123456789abcdef', 'some content');

      test.equals(this.cache.read('prefix-0123456789abcdef'), 'some content');
      test.equals(this.cache.read('prefix-0123456789abcdef', false), 'some content');
      test.ok(this.cache.has('prefix-0123456789abcdef'));
      test.ok(!this.cache.has('not-in-cache'));

      test.done();
    },

    stat: function(test) {
      this.cache.write('prefix-0123456789abcdef', 'some content');
      var actual = this.cache.stat('prefix-0123456789abcdef');

      var statProps = Object.keys(actual);

      test.ok(statProps.indexOf('atime'));
      test.ok(statProps.indexOf('mtime'));
      test.ok(statProps.indexOf('ctime'));
      test.ok(statProps.indexOf('ino'));

      test.done();
    }
  }
};
