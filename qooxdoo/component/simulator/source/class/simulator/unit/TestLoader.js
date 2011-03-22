/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2010 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (d_wagner)

************************************************************************ */

/**
 * Creates a suite of integration tests.
 */

qx.Class.define("simulator.unit.TestLoader", {

  extend : qx.core.Object,

  properties :
  {
    /** The test suite */
    suite : {
      check    : "qx.dev.unit.TestSuite"
    }
  },

  /**
   *
   * @param nameSpace {String} Test namespace, e.g. myapplication.simulation.*
   */
  construct : function(nameSpace)
  {
    var suite = new qx.dev.unit.TestSuite(nameSpace);
    this.setSuite(suite);
  }
});

