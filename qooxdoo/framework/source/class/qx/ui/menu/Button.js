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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * The real menu button class which supports a command and an icon. All
 * other features are inherited from the {@link qx.ui.menu.AbstractButton}
 * class.
 */
qx.Class.define("qx.ui.menu.Button",
{
  extend : qx.ui.menu.AbstractButton,
  include : qx.ui.core.MExecutable,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param label {String} Initial label
   * @param icon {String} Initial icon
   * @param command {qx.event.Command} Intial command (shortcut)
   * @param menu {qx.ui.menu.Menu} Initial sub menu
   */
  construct : function(label, icon, command, menu)
  {
    this.base(arguments);

    // Add command listener
    this.addListener("changeCommand", this._onChangeCommand, this);

    // Initialize with incoming arguments
    if (label != null) {
      this.setLabel(label);
    }

    if (icon != null) {
      this.setIcon(icon);
    }

    if (command != null) {
      this.setCommand(command);
    }

    if (menu != null) {
      this.setMenu(menu);
    }
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
      init : "menu-button"
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
      EVENT HANDLER
    ---------------------------------------------------------------------------
    */

    /**
     * Event listener for command changes. Updates the text of the shortcut.
     *
     * @param e {qx.event.type.Data} Property change event
     */
    _onChangeCommand : function(e) {
      this._getChildControl("shortcut").setContent(e.getData().toString());
    },


    // overridden
    _onMouseUp : function(e)
    {
      if (e.isLeftPressed())
      {
        this.execute();

        // stop menu from closing
        if (this.getMenu()) {
          e.stopPropagation();
        }
      }
    },


    // overridden
    _onKeyPress : function(e) {
      this.execute();
    }
  }
});
