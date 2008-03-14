/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2008 Derrell LIpman

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Derrell Lipman (derrell)

************************************************************************ */

/* ************************************************************************

#module(ui_progressive)

************************************************************************ */

/**
 * Data Model for Progressive renderer.  EXPERIMENTAL!  INTERFACE MAY CHANGE.
 */
qx.Class.define("qx.ui.progressive.model.Default",
{
  extend     : qx.core.Object,


  /**
   */
  construct : function()
  {
    this.base(arguments);
  },


  events :
  {
    /**
     */
  },


  statics :
  {
    /**
     */
  },


  properties :
  {
    /**
     * The elements to be progressively renderered.  Each array element must
     * be an object which contains at least two members: renderer name and
     * data.
     */
    elements :
    {
      check : "Array",
      init : [ ]
    }
  },


  members :
  {
  },


  /**
   */
  destruct : function()
  {
  }
});
