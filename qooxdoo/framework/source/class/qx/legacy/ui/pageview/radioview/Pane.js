/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Derrell Lipman (derrell)
     * Sebastian Werner (wpbasti)

************************************************************************ */

/**
 * @appearance radio-view-pane
 */
qx.Class.define("qx.legacy.ui.pageview.radioview.Pane",
{
  extend : qx.legacy.ui.pageview.AbstractPane,

  construct : function()
  {
    this.base(arguments);

    this.initHeight();
  },

  properties :
  {
    appearance :
    {
      refine : true,
      init : "radio-view-pane"
    },

    height :
    {
      refine : true,
      init : "1*"
    }
  }
});
