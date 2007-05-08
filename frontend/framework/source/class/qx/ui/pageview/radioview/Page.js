/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Derrell Lipman (derrell)
     * Sebastian Werner (wpbasti)

************************************************************************ */

/* ************************************************************************

#module(ui_radioview)

************************************************************************ */

/**
 * @appearance radio-view-page
 */
qx.Class.define("qx.ui.pageview.radioview.Page",
{
  extend : qx.ui.pageview.AbstractPage,

  properties :
  {
    appearance :
    {
      refine : true,
      init : "radio-view-page"
    }
  }
});
