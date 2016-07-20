/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Gabriel Munteanu (gabios)

************************************************************************ */

/**
 * A separator widget used to separate widgets in a toolbar.
 *
 */
qx.Class.define("qx.ui.mobile.toolbar.Separator",
{
  extend : qx.ui.mobile.core.Widget,

  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

    construct : function()
    {
      this.base(arguments);
    },

  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

    properties :
    {
      // overridden
      defaultCssClass :
      {
        refine : true,
        init : "toolbar-separator"
      }
    }
});
