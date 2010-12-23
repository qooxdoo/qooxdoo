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

************************************************************************ */

qx.Class.define("inspector.view.ToolBar",
{
  extend : qx.ui.toolbar.ToolBar,

  construct : function(inspectorModel, state)
  {
    this.base(arguments);

    this.__model = inspectorModel;
    this.__state = state;

    this.__model.addListener("changeInspected", this.__changeInspected, this);

    this.setDecorator("myToolbar");
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

    this.addSeparator();

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


    getTextField : function() {
      return this._urlTextField;
    },

    getSelectedWidgetLabel : function() {
      return this._selectedWidgetLabel;
    },

    getConsoleWindow : function() {
      return this._consoleWindow
    },

    __createWindow : function(name, clazz, buttonRef)
    {
      var win = new clazz(name, this.__model);
      this.__state.add(win, name.toLowerCase());

      var button = this[buttonRef] = new qx.ui.toolbar.CheckBox(name);
      this.add(button);

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
    }
  },


  destruct : function() {
  }
});
