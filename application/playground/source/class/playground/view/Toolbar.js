/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
/* ************************************************************************

#asset(playground/images/*)

************************************************************************ */

/**
 * The playground toolbar containing all buttons and menus.
 */
qx.Class.define("playground.view.Toolbar",
{
  extend : qx.ui.toolbar.ToolBar,


  construct : function()
  {
    this.base(arguments);

    this.__menuItemStore = {};

    // run button
    var runButton = new qx.ui.toolbar.Button(
      this.tr("Run"), "icon/22/actions/media-playback-start.png"
    );
    this.add(runButton);
    runButton.setToolTipText(this.tr("Run the source code"));
    runButton.addListener("execute", function() {
      this.fireEvent("run");
    }, this);

    // sample button
    this.__samplesCheckButton = new qx.ui.form.ToggleButton(
      this.tr("Samples"), "icon/22/actions/edit-copy.png"
    );
    this.__samplesCheckButton.setValue(true);
    this.add(this.__samplesCheckButton);
    this.__samplesCheckButton.setToolTipText(this.tr("Show samples"));
    this.__samplesCheckButton.setAppearance("toolbar-button");
    this.__samplesCheckButton.addListener("changeValue", function(e) {
      this.fireDataEvent("changeSample", e.getData(), e.getOldData());
    }, this);

    // highlighting button
    this.__highlightButton = new qx.ui.form.ToggleButton(
      this.tr("Syntax Highlighting"), "icon/22/actions/check-spelling.png"
    );
    this.add(this.__highlightButton);
    this.__highlightButton.setAppearance("toolbar-button");
    this.__highlightButton.addListener("changeValue", function(e) {
      this.fireDataEvent("changeHighlight", e.getData(), e.getOldData());
    }, this);
    var initValue = qx.bom.Cookie.get("playgroundHighlight") !== "false";
    this.__highlightButton.setValue(initValue);

    // spacer
    this.addSpacer();

    // log Check button
    this.__logCheckButton = new qx.ui.toolbar.CheckBox(
      this.tr("Log"), "icon/22/apps/utilities-log-viewer.png"
    );
    this.add(this.__logCheckButton);
    this.__logCheckButton.setToolTipText(this.tr("Show log output"));
    this.__logCheckButton.addListener("changeValue", function(e) {
      this.fireDataEvent("changeLog", e.getData(), e.getOldData());
    }, this);

    // url shortening button
    var urlShortButton = new qx.ui.toolbar.Button(
      this.tr("Shorten URL"), "icon/22/actions/bookmark-new.png"
    );
    this.add(urlShortButton);
    urlShortButton.setToolTipText(this.tr("Use tinyurl to shorten the url."));
    urlShortButton.addListener("execute", function() {
      this.fireEvent("shortenUrl");
    }, this);

    // api button
    var apiButton = new qx.ui.toolbar.Button(
      this.tr("API Viewer"), "icon/22/actions/help-contents.png"
    );
    this.add(apiButton);
    apiButton.setToolTipText(this.tr("Open the qooxdoo API Viewer"));
    apiButton.addListener("execute", function() {
      this.fireEvent("openApi");
    }, this);

    // help button
    var helpButton = new qx.ui.toolbar.Button(
      this.tr("Manual"), "icon/22/actions/help-about.png"
    );
    this.add(helpButton);
    helpButton.setToolTipText(this.tr("Open the qooxdoo Manual"));
    helpButton.addListener("execute", function() {
      this.fireEvent("openManual");
    }, this);

    // demobrowser button
    var demoBrowserButton = new qx.ui.toolbar.Button(
      this.tr("Demo Browser"), "icon/22/actions/application-exit.png"
    );
    this.add(demoBrowserButton);
    demoBrowserButton.setToolTipText(this.tr("Open the qooxdoo Demo Browser"));
    demoBrowserButton.addListener("execute", function() {
      this.fireEvent("openDemoBrowser");
    }, this);

    // enable doverflow handling
    this.setOverflowHandling(true);

    // remove priority for overflow handling
    this.setRemovePriority(demoBrowserButton, 8);
    this.setRemovePriority(helpButton, 7);
    this.setRemovePriority(apiButton, 6);
    this.setRemovePriority(this.__logCheckButton, 5);
    this.setRemovePriority(this.__samplesCheckButton, 4);
    this.setRemovePriority(this.__highlightButton, 3);
    this.setRemovePriority(urlShortButton, 1);

    // add a button for overflow handling
    var chevron = new qx.ui.toolbar.MenuButton(null, "icon/22/actions/media-seek-forward.png");
    chevron.setAppearance("toolbar-button");  // hide the down arrow icon
    this.add(chevron);
    this.setOverflowIndicator(chevron);

    // add the overflow menu
    this.__overflowMenu = new qx.ui.menu.Menu();
    chevron.setMenu(this.__overflowMenu);

    // add the listener
    this.addListener("hideItem", function(e) {
      var item = e.getData();
      var menuItem = this._getMenuItem(item);
      menuItem.setVisibility("visible");
      // menus
      if (item.getMenu && item.getMenu()) {
        var menu = item.getMenu();
        item.setMenu(null);
        menuItem.setMenu(menu);
      }
    }, this);

    this.addListener("showItem", function(e) {
      var item = e.getData();
      var menuItem = this._getMenuItem(item);
      menuItem.setVisibility("excluded");
      // menus
      if (menuItem.getMenu()) {
        var menu = menuItem.getMenu();
        menuItem.setMenu(null);
        item.setMenu(menu);
      }
    }, this);
  },


  events :
  {
    /**
     * Fired if the run button is pressed.
     */
    "run" : "qx.event.type.Event",

    /**
     * Fired if a new sample should be selected. The data contains the name of
     * the new sample.
     */
    "changeSample" : "qx.event.type.Data",

    /**
     * Data event if the code highlighting should be used.
     */
    "changeHighlight" : "qx.event.type.Data",

    /**
     * Data event if the log should be shown.
     */
    "changeLog" : "qx.event.type.Data",

    /**
     * Event which will indicate a url shortening action.
     */
    "shortenUrl" : "qx.event.type.Event",

    /**
     * Event which will be fired to open the api.
     */
    "openApi" : "qx.event.type.Event",

    /**
     * Event which will be fired to open the manual.
     */
    "openManual" : "qx.event.type.Event",

    /**
     * Event which will be fired to open the demo browser.
     */
    "openDemoBrowser" : "qx.event.type.Event"
  },


  members :
  {
    __menuItemStore : null,
    __overflowMenu : null,
    __highlightButton : null,
    __logCheckButton : null,
    __samplesCheckButton : null,

    /**
     * Controlls the presed state of the log button.
     * @param show {Boolean} True, if the button should be pressed.
     */
    showLog : function(show) {
      this.__logCheckButton.setValue(show);
    },


    /**
     * Controlls the presed state of the samples button.
     * @param show {Boolean} True, if the button should be pressed.
     */
    showExamples : function(show) {
      this.__samplesCheckButton.setValue(show);
    },


    /**
     * Controlls the enabled property of the highlight button.
     * @param value {Boolean} True, if the button should be enabled.
     */
    enableHighlighting : function(value) {
      this.__highlightButton.setEnabled(value);
      // if the button will be disable, remove the pressed state
      if (!value) {
        this.__highlightButton.setValue(false);
      }
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
        if (toolbarItem instanceof qx.ui.toolbar.CheckBox) {
          cachedItem = new qx.ui.menu.CheckBox(toolbarItem.getLabel());
        } else {
          cachedItem = new qx.ui.menu.Button(toolbarItem.getLabel(), toolbarItem.getIcon());
        }

        // connect the execute
        cachedItem.addListener("execute", function() {
          toolbarItem.execute();
        });

        this.__overflowMenu.addAt(cachedItem, 0);
        this.__menuItemStore[toolbarItem.toHashCode()] = cachedItem;
      }

      return cachedItem;
    }
  },


  /*
   *****************************************************************************
      DESTRUCTOR
   *****************************************************************************
   */

  destruct : function() {
    this._disposeObjects("__highlightButton", "__logCheckButton",
    "__overflowMenu");
  }
});