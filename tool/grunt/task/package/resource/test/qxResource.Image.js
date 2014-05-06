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
    /**
     * @see {@link https://github.com/caolan/nodeunit#sandbox-utility}
     */
    setUp: function(done) {
      var qxResource = { Image: require('../lib/qxResource/Image') };
      var testPng = 'data/myapp/source/resource/myapp/test.png';
      this.img = new qxResource.Image(testPng, 'myapp');

      done();
    },

    __getFormat: function(test) {
      var actual = this.img.__getFormat(this.img.__relpath);
      var expected = 'png';

      test.strictEqual(actual, expected);
      test.done();
    },

    __getImageSize: function(test) {
      var path = require("path");
      var absImgPath = path.join('./test', this.img.__relpath);

      var actual = this.img.__getImageSize(absImgPath);
      var expected = { width: 32, height: 32 };

      test.deepEqual(actual, expected);
      test.done();
    },

    collectInfoAndPopulate: function(test) {
      this.img.collectInfoAndPopulate('./test');

      var expectedDim = { width: 32, height: 32 };
      test.deepEqual(this.img.__dimensions, expectedDim);
      var expectedFormat = 'png';
      test.strictEqual(this.img.__format, expectedFormat);

      test.done();
    },

    stringify: function(test) {
      var expectedBefore = {
        'data/myapp/source/resource/myapp/test.png':
        [ null, null, null, 'myapp' ]
      };
      test.deepEqual(this.img.stringify(), expectedBefore);

      this.img.collectInfoAndPopulate('./test');
      var expectedAfter = {
        'data/myapp/source/resource/myapp/test.png':
        [ 32, 32, 'png', 'myapp' ]
      };
      test.deepEqual(this.img.stringify(), expectedAfter);

      test.done();
    }
};
