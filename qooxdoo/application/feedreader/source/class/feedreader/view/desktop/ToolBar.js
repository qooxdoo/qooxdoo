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
     * Fabian Jakobs (fjakobs)
     * Sebastian Werner (wpbasti)
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/* ************************************************************************

#asset(qx/icon/Tango/22/actions/dialog-ok.png)
#asset(qx/icon/Tango/22/actions/dialog-cancel.png)
#asset(qx/icon/Tango/22/actions/view-refresh.png)
#asset(qx/icon/Tango/22/apps/preferences-theme.png)
#asset(qx/icon/Tango/22/actions/help-about.png)
#asset(qx/icon/Tango/22/actions/media-seek-forward.png)

************************************************************************ */

/**
 * The main tool bar widget
 */
qx.Class.define("feedreader.view.desktop.ToolBar",
{
  extend : qx.ui.toolbar.ToolBar,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param controller {feedreader.Application} The main application class
   */
  construct : function(controller)
  {
    this.base(arguments);

    this.__menuItemStore = {};

    // Add/Remove buttons
    this.__addBtn = new qx.ui.toolbar.Button(this.tr("Add feed"), "icon/22/actions/dialog-ok.png");
    this.__addBtn.setCommand(controller.getCommand("addFeed"));
    this.add(this.__addBtn);

    this.__removeBtn = new qx.ui.toolbar.Button(this.tr("Remove feed"), "icon/22/actions/dialog-cancel.png");
    this.__removeBtn.setCommand(controller.getCommand("removeFeed"));
    this.__removeBtn.setEnabled(false);
    this.add(this.__removeBtn);


    // Add a separator
    this.addSeparator();


    // Reload button
    var reloadBtn = new qx.ui.toolbar.Button(this.tr("Reload"), "icon/22/actions/view-refresh.png");
    var reloadCmd = controller.getCommand("reload");
    reloadBtn.setCommand(reloadCmd);
    reloadBtn.setToolTipText(this.tr("Reload the feeds. (%1)", reloadCmd.toString()));
    this.add(reloadBtn);


    // Add a separator
    this.addSeparator();


    // Preferences button
    this.__prefBtn = new qx.ui.toolbar.Button(this.tr("Preferences"), "icon/22/apps/preferences-theme.png");
    this.__prefBtn.setCommand(controller.getCommand("preferences"));
    this.__prefBtn.setToolTipText(this.tr("Open preferences window."));
    this.add(this.__prefBtn);


    // Add a spacer
    this.addSpacer();


    // About button
    var aboutBtn = new qx.ui.toolbar.Button(this.tr("Help"), "icon/22/actions/help-about.png");
    var aboutCmd = controller.getCommand("about");
    aboutBtn.setCommand(aboutCmd);
    aboutBtn.setToolTipText("(" + aboutCmd.toString() + ")");
    this.add(aboutBtn);

    // enable overflow handling
    this.setOverflowHandling(true);

    // add a button for overflow handling
    var chevron = new qx.ui.toolbar.MenuButton(null, "icon/22/actions/media-seek-forward.png");
    chevron.setAppearance("toolbar-button");  // hide the down arrow icon
    this.add(chevron);
    this.setOverflowIndicator(chevron);

    // add the overflow menu
    this.__overflowMenu = new qx.ui.menu.Menu();
    chevron.setMenu(this.__overflowMenu);

    // add the listener
    this.addListener("hideItem", this._onHideItem, this);
    this.addListener("showItem", this._onShowItem, this);
  },


  members :
  {
    // private members
    __removeBtn : null,
    __overflowMenu : null,
    __menuItemStore : null,
    __addBtn : null,
    __prefBtn : null,


    /**
     * Return the button which removed the feeds. This is needed to enable /
     * disable the button from the main application.
     *
     * @return {qx.ui.toolbar.Button}
     */
    getRemoveButton: function() {
      return this.__removeBtn;
    },


    /**
     * Handler for the overflow handling which will be called on hide.
     * @param e {qx.event.type.Data} The event.
     */
    _onHideItem : function(e) {
      var item = e.getData();
      var menuItem = this._getMenuItem(item);
      menuItem.setVisibility("visible");
    },


    /**
     * Handler for the overflow handling which will be called on show.
     * @param e {qx.event.type.Data} The event.
     */
    _onShowItem : function(e) {
      var item = e.getData();
      var menuItem = this._getMenuItem(item);
      menuItem.setVisibility("excluded");
    },


    /**
     * Helper for the overflow handling. It is responsible for returning a
     * corresponding menu item for the given toolbar item.
     *
     * @param toolbarItem {qx.ui.core.Widget} The toolbar item to look for.
     * @return {qx.ui.core.Widget} The coresponding menu item.
     */
    _getMenuItem : function(toolbarItem) {
      var cachedItem = this.__menuItemStore[toolbarItem.toHashCode()];

      if (!cachedItem) {
        if (toolbarItem instanceof qx.ui.toolbar.Button) {
          cachedItem = new qx.ui.menu.Button(
            toolbarItem.getLabel().translate(),
            toolbarItem.getIcon(),
            toolbarItem.getCommand()
          );

          toolbarItem.bind("enabled", cachedItem, "enabled");
        } else {
          cachedItem = new qx.ui.menu.Separator();
        }

        this.__overflowMenu.addAt(cachedItem, 0);
        this.__menuItemStore[toolbarItem.toHashCode()] = cachedItem;
      }

      return cachedItem;
    },


    /**
     * Signals the toolbar which part currently loading.
     *
     * @param part {String} The name of the part currently loading.
     * @param loading {Boolean} ture, if the part is currently loading.
     */
    signalLoading : function(part, loading)
    {
      // get the right button
      if (part == "addfeed") {
        var button = this.__addBtn;
      } else if (part == "settings") {
        var button = this.__prefBtn;
      } else {
        // do nothing on the rest of the parts if given
        return;
      }

      // set / reset icon of the button
      if (loading) {
        button.setUserData("originalIcon", button.getIcon());
        button.setIcon("feedreader/images/loading22.gif");
      } else {
        var icon = button.getUserData("originalIcon");
        button.setIcon(icon);
      }
    }
  },



  /*
   *****************************************************************************
      DESTRUCTOR
   *****************************************************************************
   */

  destruct : function() {
    this._disposeObjects("__removeBtn", "__overflowMenu");
  }
});
