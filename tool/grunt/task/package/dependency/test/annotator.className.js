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
      this.cnAnnotator = require('../lib/annotator/className.js');
      done();
    },

    annotate: function(test) {
      var tree = {};
      this.cnAnnotator.annotate(tree, 'qx.foo.Bar');
      var expected = {qxClassName:'qx.foo.Bar'};
      test.deepEqual(tree, expected);

      test.done();
    }
  }
};
