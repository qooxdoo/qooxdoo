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
      var qxResource = { Resource: require('../lib/qxResource/Resource') };
      var aceJs = 'data/myapp/source/resource/myapp/ace.js';
      this.qxRes = new qxResource.Resource(aceJs, 'myapp');

      done();
    },

    stringify: function(test) {
      var expected = { 'data/myapp/source/resource/myapp/ace.js': 'myapp' } ;

      test.deepEqual(this.qxRes.stringify(), expected);
      test.done();
    }
};

