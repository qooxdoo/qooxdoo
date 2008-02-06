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
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

#module(ui_tabview)

************************************************************************ */

/**
 * @appearance tab-view-page
 */
qx.Class.define("qx.ui.pageview.tabview.Page",
{
  extend : qx.ui.pageview.AbstractPage,

  properties :
  {
    appearance :
    {
      refine : true,
      init : "tab-view-page"
    }
  }
});
