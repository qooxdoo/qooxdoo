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
     * Derrell Lipman
     * Sebastian Werner (wpbasti)

************************************************************************ */

/* ************************************************************************

#module(ui_radioview)

************************************************************************ */

/**
 * @appearance button-view-bar
 */
qx.Class.define("qx.ui.pageview.radioview.Bar",
{
  extend : qx.ui.pageview.AbstractBar,

  properties :
  {
    appearance :
    {
      refine : true,
      init : "radio-view-bar"
    },

    height :
    {
      refine : true,
      init : "auto"
    },

    width :
    {
      refine : true,
      init : null
    },

    orientation :
    {
      refine : true,
      init : "vertical"
    }
  }
});
