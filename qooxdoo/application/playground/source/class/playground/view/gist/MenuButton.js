/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
/**
 * Implementation of a special menu button which adds a link for editing 
 * the gist at the end of the menu item.
 */
qx.Class.define("playground.view.gist.MenuButton", 
{
  extend : qx.ui.menu.Button,

  /**
   * @param label {String} Initial label
   * @param icon {String} Initial icon
   * @param command {qx.ui.core.Command} Intial command (shortcut)
   * @param menu {qx.ui.menu.Menu} Initial sub menu
   */
  construct : function(label, icon, command, menu)
  {
    this.base(arguments, label, icon, command, menu);

    // create the link image
    if (label) {
      this.getChildControl("link").addListener("click", function(e) {
        this.fireDataEvent("editGist", label);
        e.stopPropagation();
      }, this);
      
      // stop the menu from being closed
      this.getChildControl("link").addListener("mouseup", function(e) {
        e.stopPropagation();
      }, this);
      
      // cursor change implementation. Would be more easy in a theme!
      this.getChildControl("link").addListener("mouseover", function(e) {
        this.setCursor("pointer");
      }, this);
      this.getChildControl("link").addListener("mouseout", function(e) {
        this.setCursor("default");
      }, this);
      
      // tooltip
      this.getChildControl("link").setToolTipText(
        this.tr("Open an edit page for this gist.")
      );         
    }
  },
  
  
  events : {
    /**
     * Fired on a click of the new link image.
     */
    "editGist" : "qx.event.type.Event"
  },


  members :
  {
    // overridden
    _createChildControlImpl : function(id)
    {
      var control;

      switch(id)
      {
        case "link":
          control = new qx.ui.basic.Image("icon/16/actions/edit-redo.png");
          this._add(control, {column: 3});
          break;
      }

      return control || this.base(arguments, id);
    },
    
    // overridden
    getChildrenSizes : function()
    {
      var values = this.base(arguments);
      values[3] = 20;
      return values;
    }    
  }
});
