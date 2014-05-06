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
      this.pAnnotator = require('../lib/annotator/parent.js');
      done();
    },

    annotate: function(test) {
      var tree = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'MemberExpression',
            object: {
              type: 'MemberExpression',
              object: {
                type: 'Identifier',
                name: 'qx',
              },
              property: {
                type: 'Identifier',
                name: 'foo'
              }
            },
            property: {
              type: 'Identifier',
              name: 'Bar'
            }
          },
          property: {
            type: 'Identifier',
            name: 'aMethodCall'
          }
        }
      };

      test.ok(!tree.parent);
      test.ok(!tree.callee.parent);
      test.ok(!tree.callee.object.parent);
      test.ok(!tree.callee.object.object.parent);
      test.ok(!tree.callee.object.object.object.parent);
      this.pAnnotator.annotate(tree);
      test.deepEqual(tree.parent, null);  // top level has no parent
      test.ok(tree.callee.parent);
      test.ok(tree.callee.object.parent);
      test.ok(tree.callee.object.object.parent);
      test.ok(tree.callee.object.object.object.parent);

      test.done();
    }
  }
};
