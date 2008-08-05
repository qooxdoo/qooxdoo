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

/**
 * A small helper class to create a special layout handler for qx.legacy.ui.menu.Menus
 *
 * @appearance menu-layout
 */
qx.Class.define("qx.legacy.ui.menu.Layout",
{
  extend : qx.legacy.ui.layout.VerticalBoxLayout,





  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    anonymous :
    {
      refine : true,
      init : true
    },

    /** Appearance of the widget */
    appearance :
    {
      refine : true,
      init : "menu-layout"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /*
    ---------------------------------------------------------------------------
      INIT LAYOUT IMPL
    ---------------------------------------------------------------------------
    */

    /**
     * This creates an new instance of the layout impl this widget uses
     *
     * @return {qx.legacy.ui.layout.BoxLayout} TODOC
     */
    _createLayoutImpl : function() {
      return new qx.legacy.ui.menu.MenuLayoutImpl(this);
    }
  }
});
