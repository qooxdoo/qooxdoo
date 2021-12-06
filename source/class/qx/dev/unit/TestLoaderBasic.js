/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2010 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (d_wagner)

************************************************************************ */

/**
 * Test loader for server-side/"headless" environments
 */

qx.Class.define("qx.dev.unit.TestLoaderBasic", {

  extend : qx.core.Object,

  include : [qx.dev.unit.MTestLoader],

  /**
   *
   * @param nameSpace {String} Test namespace, e.g. myapplication.test.*
   */
  construct : function(nameSpace)
  {
    if (nameSpace) {
      this.setTestNamespace(nameSpace);
    }
  }
});

