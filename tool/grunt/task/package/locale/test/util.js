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
  setUp: function(done) {
    this.util = require('../lib/util.js');
    done();
  },

  renameProperty: function(test) {
    var obj = {'a': 1, 'b': 2};
    var actual = this.util.renameProperty(obj, 'a', 'c');
    var expected = {'c': 1, 'b': 2};

    test.deepEqual(actual, expected);
    test.done();
  },

  mergeObject: function(test) {
    var obj1 = {'a': 2, 'c': 2};
    var obj2 = {'b': 3, 'c': 3};
    var actual = this.util.mergeObject(obj1, obj2);
    var expected = {'a': 2, 'b': 3, 'c': 3};

    test.deepEqual(actual, expected);
    test.done();
  },

  appendPrefixToProperties: function(test) {
    var obj = {'a': 1, 'b': 2};
    var actual = this.util.appendPrefixToProperties(obj, 'my-prefix_');
    var expected = {'my-prefix_a': 1, 'my-prefix_b': 2};

    test.deepEqual(actual, expected);
    test.done();
  }
};
