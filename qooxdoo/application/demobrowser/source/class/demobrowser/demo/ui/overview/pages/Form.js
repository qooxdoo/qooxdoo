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
     * Tristan Koch (tristankoch)

************************************************************************ */

/**
 * Demonstrates qx.ui.form(...):
 *
 * AbstractField, AbstractSelectBox, Button, CheckBox, ComboBox, DateField,
 * HoverButton, List, ListItem, MenuButton, PasswordField, RadioButton,
 * RadioButtonGroup, RepeatButton, SelectBox, Slider, Spinner, SplitButton,
 * TextArea, TextField, ToggleButton
 *
 */
qx.Class.define("demobrowser.demo.ui.overview.pages.Form",
{
  extend: qx.ui.tabview.Page,

  include: demobrowser.demo.ui.overview.MControls,

  statics:
  {
    ITEM_SIZE: 3
  },

  construct : function()
  {
    this.base(arguments);

    this.setLabel("Form");
    this.setLayout(new qx.ui.layout.Canvas());

    this._initWidgets();
    this._initControls(this.__widgets, {disabled: true, hovered: true, focused: true, invalid: true});
  },

  members :
  {
    __widgets : null,

    // __initControls: null,

    _initWidgets: function()
    {
      this.__widgets = new qx.type.Array();

      /****************************************
       * TEXT INPUT
       ***************************************/

      var textGroupBox = new qx.ui.groupbox.GroupBox("Text");
      textGroupBox.setLayout(new qx.ui.layout.Grid(8, 8));
      textGroupBox.setWidth(290);
      this.add(textGroupBox, {left: 0, top: 40});

      // Text field
      var textField = new qx.ui.form.TextField();
      this.__widgets.push(textField);
      textField.setPlaceholder("Placeholder");
      var label = new qx.ui.basic.Label("TextField:");
      label.setBuddy(textField);
      textGroupBox.add(label, {row: 0, column: 0});
      textGroupBox.add(textField, {row: 0, column: 1});

      // Password field
      var passwordField = new qx.ui.form.PasswordField();
      this.__widgets.push(passwordField);
      passwordField.setPlaceholder("Password");
      label = new qx.ui.basic.Label("PasswordField:");
      label.setBuddy(passwordField);
      textGroupBox.add(label, {row: 1, column: 0});
      textGroupBox.add(passwordField, {row: 1, column: 1});

      // Text area
      var textArea = new qx.ui.form.TextArea();
      this.__widgets.push(textArea);
      textArea.setPlaceholder("Placeholder");
      label = new qx.ui.basic.Label("TextArea:");
      label.setBuddy(textArea);
      textGroupBox.add(label, {row: 2, column: 0});
      textGroupBox.add(textArea, {row: 2, column: 1});

      // Combo box
      var comboBox = new qx.ui.form.ComboBox();
      this.__widgets.push(comboBox);
      comboBox.setPlaceholder("Placeholder");
      label = new qx.ui.basic.Label("ComboBox:");
      label.setBuddy(comboBox);
      textGroupBox.add(label, {row: 3, column: 0});
      textGroupBox.add(comboBox, {row: 3, column: 1});
      this.createItems(comboBox);

      // Date field
      var dateField = new qx.ui.form.DateField();
      this.__widgets.push(dateField);
      dateField.setPlaceholder("dd.mm.YYYY");
      label = new qx.ui.basic.Label("DateField:");
      label.setBuddy(dateField);
      textGroupBox.add(label, {row: 4, column: 0});
      textGroupBox.add(dateField, {row: 4, column: 1});

      /****************************************
       * SELECTION
       ***************************************/

      var selectionGroupBox = new qx.ui.groupbox.GroupBox("Selection");
      selectionGroupBox.setLayout(new qx.ui.layout.Grid(8, 8));
      selectionGroupBox.setWidth(290);
      this.add(selectionGroupBox, {left: 0, top: 290});

      // Select box
      var selectBox = new qx.ui.form.SelectBox();
      this.__widgets.push(selectBox);
      label = new qx.ui.basic.Label("SelectBox:");
      label.setBuddy(selectBox);
      selectionGroupBox.add(label, {row: 0, column: 0});
      selectionGroupBox.add(selectBox, {row: 0, column: 1});
      this.createItems(selectBox);

      // List
      var list = new qx.ui.form.List();
      this.__widgets.push(list);
      list.setHeight(60);
      list.setWidth(155)
      label = new qx.ui.basic.Label("List:");
      label.setBuddy(list);
      selectionGroupBox.add(label, {row: 1, column: 0});
      selectionGroupBox.add(list, {row: 1, column: 1});
      this.createItems(list);

      // Radio button group
      var radioButtonGroup = new qx.ui.form.RadioButtonGroup();
      this.__widgets.push(radioButtonGroup);
      var radioButton1 = new qx.ui.form.RadioButton("RadioButton 1");
      var radioButton2 = new qx.ui.form.RadioButton("RadioButton 2");
      var radioButton3 = new qx.ui.form.RadioButton("RadioButton 3");
      radioButtonGroup.add(radioButton1);
      radioButtonGroup.add(radioButton2);
      radioButtonGroup.add(radioButton3);
      label = new qx.ui.basic.Label("RadioButtonGroup:");
      label.setBuddy(radioButtonGroup);
      selectionGroupBox.add(label, {row: 2, column: 0});
      selectionGroupBox.add(radioButtonGroup, {row: 2, column: 1});

      /****************************************
       * BUTTONS
       ***************************************/

      var buttonGroupBox = new qx.ui.groupbox.GroupBox("Buttons");
      buttonGroupBox.setLayout(new qx.ui.layout.Grid(8, 8));
      buttonGroupBox.setWidth(210);
      this.add(buttonGroupBox, {left: 330, top: 40});

      // Button
      var button = new qx.ui.form.Button("Button");
      this.__widgets.push(button);
      label = new qx.ui.basic.Label("Button:");
      label.setBuddy(button);
      buttonGroupBox.add(label, {row: 0, column: 0});
      buttonGroupBox.add(button, {row: 0, column: 1});

      // Toggle button
      var toggleButton = new qx.ui.form.ToggleButton("ToggleButton");
      this.__widgets.push(toggleButton);
      label = new qx.ui.basic.Label("ToggleButton:");
      label.setBuddy(toggleButton);
      buttonGroupBox.add(label, {row: 1, column: 0});
      buttonGroupBox.add(toggleButton, {row: 1, column: 1});

      // Repeat button
      var repeatButton = new qx.ui.form.RepeatButton("0");
      this.__widgets.push(repeatButton);
      label = new qx.ui.basic.Label("RepeatButton:");
      label.setBuddy(repeatButton);
      buttonGroupBox.add(label, {row: 2, column: 0});
      buttonGroupBox.add(repeatButton, {row: 2, column: 1});

      // Menu button
      var menueButton = new qx.ui.form.MenuButton("MenuButton", null, this.createMenuForMenuButton());
      this.__widgets.push(menueButton);
      label = new qx.ui.basic.Label("MenuButton:");
      label.setBuddy(menueButton);
      buttonGroupBox.add(label, {row: 3, column: 0});
      buttonGroupBox.add(menueButton, {row: 3, column: 1});

      // Hover button
      var hoverButton = new qx.ui.form.HoverButton("HoverButton");
      this.__widgets.push(hoverButton);
      label = new qx.ui.basic.Label("HoverButton:");
      label.setBuddy(hoverButton);
      buttonGroupBox.add(label, {row: 4, column: 0});
      buttonGroupBox.add(hoverButton, {row: 4, column: 1});


      // Split button
      var splitButton = new qx.ui.form.SplitButton("SplitButton", null, this.createMenuForSplitButton());
      this.__widgets.push(splitButton);
      label = new qx.ui.basic.Label("SplitButton:");
      label.setBuddy(splitButton);
      buttonGroupBox.add(label, {row: 5, column: 0});
      buttonGroupBox.add(splitButton, {row: 5, column: 1});

      // Listener
      repeatButton.addListener("execute", function()
      {
        var tempValue = parseInt(repeatButton.getLabel()) + 1;
        repeatButton.setLabel(tempValue.toString());
      });

      /****************************************
       * BOOLEAN INPUT
       ***************************************/

      var booleanGroupBox = new qx.ui.groupbox.GroupBox("Boolean");
      booleanGroupBox.setLayout(new qx.ui.layout.Grid(8, 8));
      booleanGroupBox.setWidth(210);
      this.add(booleanGroupBox, {left: 330, top: 290});

      // Check box
      var checkBox = new qx.ui.form.CheckBox("CheckBox");
      this.__widgets.push(checkBox);
      label = new qx.ui.basic.Label("CheckBox:");
      label.setBuddy(checkBox);
      booleanGroupBox.add(label, {row: 0, column: 0});
      booleanGroupBox.add(checkBox, {row: 0, column: 1});

      // Radio button
      var radioButton = new qx.ui.form.RadioButton("RadioButton");
      this.__widgets.push(radioButton);
      label = new qx.ui.basic.Label("RadioButtons:");
      label.setBuddy(radioButton);
      booleanGroupBox.add(label, {row: 1, column: 0});
      booleanGroupBox.add(radioButton, {row: 1, column: 1});

      /****************************************
       * NUMBER INPUT
       ***************************************/

      var numberGroupBox = new qx.ui.groupbox.GroupBox("Number");
      numberGroupBox.setLayout(new qx.ui.layout.Grid(8, 8));
      numberGroupBox.setWidth(210);
      this.add(numberGroupBox, {left: 330, top: 380});

      // Spinner
      var spinner = new qx.ui.form.Spinner(0, 50, 100);
      this.__widgets.push(spinner);
      label = new qx.ui.basic.Label("Spinner:");
      label.setBuddy(spinner);
      numberGroupBox.add(label, {row: 0, column: 0});
      numberGroupBox.add(spinner, {row: 0, column: 1});

      // Slider
      var slider = new qx.ui.form.Slider();
      this.__widgets.push(slider);
      slider.setWidth(130);
      label = new qx.ui.basic.Label("Slider:");
      label.setBuddy(slider);
      numberGroupBox.add(label, {row: 1, column: 0});
      numberGroupBox.add(slider, {row: 1, column: 1});
    },

    createItems: function(widget)
    {
      for (var i = 0; i < this.self(arguments).ITEM_SIZE; i++) {
        var tempItem = new qx.ui.form.ListItem("Item " + i);
        widget.add(tempItem);
      }
    },

    createMenuForMenuButton: function()
    {
      // Creates the option menu
      var optionMenu = new qx.ui.menu.Menu;

      for (var i = 0; i < 3; i++) {
        optionMenu.add(new qx.ui.menu.RadioButton("Option" + i));
      }

      var groupOptions = new qx.ui.form.RadioGroup;
      groupOptions.add.apply(groupOptions, optionMenu.getChildren());

      // create main menu and buttons
      var menu = new qx.ui.menu.Menu();

      for (var i = 0; i < 3; i++) {
        var tempButton = new qx.ui.menu.Button("Button" + i);
        menu.add(tempButton);
      }

      var optionButton = new qx.ui.menu.Button("Options", "", null, optionMenu);
      menu.addSeparator();
      menu.add(optionButton);

      return menu;
    },

    createMenuForSplitButton: function()
    {
      var menu = new qx.ui.menu.Menu;

      var site1 = new qx.ui.menu.Button("Website 1");
      var site2 = new qx.ui.menu.Button("Website 2");
      var site3 = new qx.ui.menu.Button("Website 3");

      menu.add(site1);
      menu.add(site2);
      menu.add(site3);

      return menu;
    }
  }
});