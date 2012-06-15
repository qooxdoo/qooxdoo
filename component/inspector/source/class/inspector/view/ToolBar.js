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
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

/* ************************************************************************

#asset(qx/icon/Tango/16/actions/view-refresh.png)
#asset(qx/icon/Tango/16/actions/media-seek-forward.png)

************************************************************************ */

qx.Class.define("inspector.view.ToolBar",
{
  extend : qx.ui.toolbar.ToolBar,

  construct : function(inspectorModel, state)
  {
    this.base(arguments);

    this.__menuItemStore = {};

    this.__model = inspectorModel;
    this.__state = state;

    this.__model.addListener("changeInspected", this.__changeInspected, this);

    this._getLayout().setAlignY("middle");

    // create the headline label
    var inspectorLabel = new qx.ui.basic.Label("qooxdoo Inspector");
    inspectorLabel.setPaddingLeft(10);
    inspectorLabel.setPaddingRight(5);

    var font = new qx.bom.Font(12, ["Lucida Grande"])
    font.setBold(true);
    font.setItalic(true);
    inspectorLabel.setFont(font);
    this.add(inspectorLabel);

    this.addSeparator();

    this.__windowsPart = new qx.ui.toolbar.Part();
    this.add(this.__windowsPart);

    // Objects window
    this.__createWindow("Objects", inspector.objects.Window, "_objectsButton");

    // Widgets window
    this.__createWindow("Widgets", inspector.widgets.WidgetsWindow, "_widgetsButton");

    // Property Window
    this.__createWindow("Properties", inspector.property.PropertyWindow, "_propertyButton");

    // Console window
    this._consoleWindow = this.__createWindow("Console", inspector.console.ConsoleWindow, "_consoleButton");

    // Selenium window
    this.__createWindow("Selenium", inspector.selenium.SeleniumWindow, "_seleniumButton");

    this._separator = new qx.ui.toolbar.Separator();
    this.add(this._separator);

    // create the find button
    this._inspectButton = new qx.ui.toolbar.CheckBox("Inspect widget", "inspector/images/icons/edit-find.png");
    this._inspectButton.setAppearance("toolbar-button-bold");
    this.add(this._inspectButton);
    this._inspectButton.addListener("changeValue", function(e) {
      this.fireDataEvent("changeInspectButtonValue", e.getData(), e.getOldData());
    }, this);

    // Lable showing the selected widget
    this._selectedWidgetLabel = new qx.ui.basic.Label();
    this._selectedWidgetLabel.setRich(true);
    this.add(this._selectedWidgetLabel);

    this.addSpacer();

    // add the url textfield
    this._urlTextField = new qx.ui.form.TextField();
    this._urlTextField.setMarginRight(5);
    this._urlTextField.setWidth(300);
    this.add(this._urlTextField);
    this._urlTextField.addListener("changeValue", function(e) {
      this.fireDataEvent("changeTextFieldValue", e.getData(), e.getOldData());
    }, this);

    // reload button
    this._reloadButton = new qx.ui.toolbar.Button(null, "icon/16/actions/view-refresh.png");
    this.add(this._reloadButton);
    this._reloadButton.addListener("execute", function(e) {
      this.fireEvent("executeReloadButton");
    }, this);

    // enable overflow handling
    this.setOverflowHandling(true);
    this.setRemovePriority(this._seleniumButton, 5);
    this.setRemovePriority(this._propertyButton, 4);
    this.setRemovePriority(this._widgetsButton, 3);
    this.setRemovePriority(this._objectsButton, 2);
    this.setRemovePriority(this._consoleButton, 1);

    // add a button for overflow handling
    var chevron = new qx.ui.toolbar.MenuButton(null, "icon/16/actions/media-seek-forward.png");
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


  events :
  {
    "changeInspectButtonValue" : "qx.event.type.Data",

    "changeTextFieldValue" : "qx.event.type.Data",

    "executeReloadButton" : "qx.event.type.Event"
  },

  members :
  {
    __model : null,

    __state : null,

    __menuItemStore : null,

    __overflowMenu : null,

    __windowsPart : null,

    getTextField : function() {
      return this._urlTextField;
    },

    getSelectedWidgetLabel : function() {
      return this._selectedWidgetLabel;
    },

    getConsoleWindow : function() {
      return this._consoleWindow;
    },

    __createWindow : function(name, clazz, buttonRef)
    {
      var win = new clazz(name, this.__model);
      this.__state.add(win, name.toLowerCase());

      var button = this[buttonRef] = new qx.ui.toolbar.CheckBox(name);
      this.__windowsPart.add(button);

      button.addListener("changeValue", function(e) {
        e.getData() ? win.open() : win.close();
      }, this);

      button.addListener("changeEnabled", function(e) {
        if (e.getData() == false) {
          win.hide();
        }
      }, this);

      win.addListener("open", function(e) {
        button.setValue(true);
      }, this);

      win.addListener("close", function(e) {
        button.setValue(false);
      }, this);

      return win;
    },

    __changeInspected: function(e) {
      this._inspectButton.setValue(false);

      var object = e.getData();
      if (object != null) {
        this._selectedWidgetLabel.setValue("<tt>" + object.classname + "[" +
          object.toHashCode() + "]</tt>");
      }
    },

    setEnabledToolbar : function(value)
    {
      this._objectsButton.setEnabled(value);
      this._widgetsButton.setEnabled(value);
      this._consoleButton.setEnabled(value);
      this._propertyButton.setEnabled(value);
      this._seleniumButton.setEnabled(value);
      this._inspectButton.setEnabled(value);
      this._selectedWidgetLabel.setEnabled(value);
    },

    _onHideItem : function(e) {
      var item = e.getData();

      if (item == this._consoleButton) {
        this._separator.setVisibility("excluded");
      }

      var menuItem = this._getMenuItem(item);
      menuItem.setVisibility("visible");
    },


    _onShowItem : function(e) {
      var item = e.getData();

      if (item == this._consoleButton) {
        this._separator.setVisibility("visible");
      }

      var menuItem = this._getMenuItem(item);
      menuItem.setVisibility("excluded");
    },


    _getMenuItem : function(toolbarItem) {
      var cachedItem = this.__menuItemStore[toolbarItem.toHashCode()];

      if (!cachedItem)
      {
        cachedItem = new qx.ui.menu.CheckBox(
          toolbarItem.getLabel()
        );

        toolbarItem.bind("value", cachedItem, "value");
        cachedItem.bind("value", toolbarItem, "value");

        this.__overflowMenu.addAt(cachedItem, 0);
        this.__menuItemStore[toolbarItem.toHashCode()] = cachedItem;
      }

      return cachedItem;
    },

    _getNextToHide : function()
    {
      if (this._separator.getVisibility() == "visible") {
        return this.base(arguments);
      } else {
        return null;
      }
    }
  },


  destruct : function()
  {
    this._separator.dispose();
    this._inspectButton.dispose();
    this._selectedWidgetLabel.dispose();
    this._urlTextField.dispose();
    this._reloadButton.dispose();
    this._objectsButton.dispose();
    this._widgetsButton.dispose();
    this._propertyButton.dispose();
    this._consoleButton.dispose();
    this._seleniumButton.dispose();
    this._consoleWindow.dispose();
    this.__overflowMenu.dispose();
    this.__windowsPart.dispose();

    this._separator = this._inspectButton = this._selectedWidgetLabel =
      this._urlTextField = this._reloadButton = this._objectsButton =
      this._widgetsButton = this._propertyButton = this._consoleButton =
      this._seleniumButton = this._consoleWindow = this.__overflowMenu = null;
  }
});
