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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Popups are widgets, which can be placed on top of the application.
 * They are automatically added to the application root.
 *
 * Popups are used to display menus, the lists of combo or select boxes,
 * tooltips, etc.
 */
qx.Class.define("qx.ui.popup.Popup",
{
  extend : qx.ui.container.Composite,
  include : qx.ui.core.MPlacement,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(layout)
  {
    this.base(arguments, layout);

    // Automatically add to application's root
    qx.core.Init.getApplication().getRoot().add(this);

    // Initialize visibiltiy
    this.initVisibility();
  },





  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    // overridden
    appearance :
    {
      refine : true,
      init : "popup"
    },

    // overridden
    visibility :
    {
      refine : true,
      init : "excluded"
    },

    /**
     * Whether to let the system decide when to hide the popup. Setting
     * this to false gives you better control but it also requires you
     * to handle the closing of the popup.
     */
    autoHide :
    {
      check : "Boolean",
      init : true
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
      WIDGET API
    ---------------------------------------------------------------------------
    */

    // overridden
    _applyVisibility : function(value, old)
    {
      this.base(arguments, value, old);

      var mgr = qx.ui.popup.Manager.getInstance();
      value === "visible" ? mgr.add(this) : mgr.remove(this);
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    qx.ui.popup.Manager.getInstance().remove(this);
  }
});