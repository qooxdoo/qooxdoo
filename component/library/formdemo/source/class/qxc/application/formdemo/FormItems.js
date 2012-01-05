/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */

qx.Class.define("qxc.application.formdemo.FormItems", {
  extend : qx.ui.container.Composite,

  construct : function() {
    this.base(arguments);

    this.__widgets = [];
    this._createView();
  },

  members : {
    __widgets : null,

    _createView : function()
    {
      var grid = new qx.ui.layout.Grid(20, 5);
      grid.setColumnFlex(0, 1);
      grid.setColumnFlex(1, 1);
      this.setLayout(grid);
      this.setPadding(10);
      var tabIndex = 1;

      /*****************************************
       * TEXT INPUT
       ****************************************/

      var form = new qx.ui.form.Form();

      var textGroupBox = new qx.ui.groupbox.GroupBox("Text");
      textGroupBox.setLayout(new qx.ui.layout.Canvas());
      this.add(textGroupBox, {row: 0, column: 0});

      // text field
      var textField = new qx.ui.form.TextField();
      textField.setPlaceholder("required");
      textField.setTabIndex(tabIndex++);
      textField.setRequired(true);
      this.__widgets.push(textField);
      form.add(textField, "TextField");

      // password field
      var passwordField = new qx.ui.form.PasswordField();
      passwordField.setTabIndex(tabIndex++);
      textField.setRequired(true);
      this.__widgets.push(passwordField);
      form.add(passwordField, "PasswordField");

      // text area
      var textArea = new qx.ui.form.TextArea();
      textArea.setPlaceholder("placeholder test...");
      textArea.setTabIndex(tabIndex++);
      this.__widgets.push(textArea);
      form.add(textArea, "TextArea");

      // combo box
      var comboBox = new qx.ui.form.ComboBox();
      comboBox.setTabIndex(tabIndex++);
      this.__createItems(comboBox);
      this.__widgets.push(comboBox);
      form.add(comboBox, "ComboBox");

      // virtual combo box
      var virtualComboBox = new qx.ui.form.VirtualComboBox();
      virtualComboBox.setTabIndex(tabIndex++);
      this.__createItemsVirtual(virtualComboBox);
      this.__widgets.push(virtualComboBox);
      form.add(virtualComboBox, "VirtualComboBox");

      // date field
      var dateField = new qx.ui.form.DateField();
      dateField.setTabIndex(tabIndex++);
      this.__widgets.push(dateField);
      form.add(dateField, "DateField");

      var renderedForm = new qx.ui.form.renderer.Single(form);
      textGroupBox.add(renderedForm);

      /*****************************************
       * SELECTION
       ****************************************/

      form = new qx.ui.form.Form();

      var selectionGroupBox = new qx.ui.groupbox.GroupBox("Selection");
      selectionGroupBox.setLayout(new qx.ui.layout.Canvas());
      this.add(selectionGroupBox, {row:1, column: 0, rowSpan: 2});

      // select box
      var selectBox = new qx.ui.form.SelectBox();
      selectBox.setTabIndex(tabIndex++);
      form.add(selectBox, "SelectBox");
      this.__createItems(selectBox);
      this.__widgets.push(selectBox);

      // virtual select box
      var virtualSelectBox = new qx.ui.form.VirtualSelectBox();
      virtualSelectBox.setTabIndex(tabIndex++);
      form.add(virtualSelectBox, "VirtualSelectBox");
      this.__createItemsVirtual(virtualSelectBox);
      this.__widgets.push(virtualSelectBox);

      // list
      var list = new qx.ui.form.List();
      list.setTabIndex(tabIndex++);
      list.setHeight(60);
      list.setWidth(155);
      form.add(list, "List");
      this.__createItems(list);
      this.__widgets.push(list);

      // radio button group
      var radioButtonGroup = new qx.ui.form.RadioButtonGroup();
      radioButtonGroup.add(new qx.ui.form.RadioButton("RadioButton 1").set({tabIndex: tabIndex++}));
      radioButtonGroup.add(new qx.ui.form.RadioButton("RadioButton 2").set({tabIndex: tabIndex++}));
      radioButtonGroup.add(new qx.ui.form.RadioButton("RadioButton 3").set({tabIndex: tabIndex++}));
      form.add(radioButtonGroup, "RadioButtonGroup");
      this.__widgets.push(radioButtonGroup);

      renderedForm = new qx.ui.form.renderer.Single(form);
      selectionGroupBox.add(renderedForm);

      /*****************************************
       * BUTTONS
       ****************************************/

      var buttonGroupBox = new qx.ui.groupbox.GroupBox("Buttons");
      var layout = new qx.ui.layout.Grid(8, 8);
      buttonGroupBox.setLayout(layout);
      layout.setColumnAlign(0, "right", "middle");
      this.add(buttonGroupBox, {row: 0, column: 1});

      // button
      var button = new qx.ui.form.Button("Button").set({tabIndex: tabIndex++});
      var label = new qx.ui.basic.Label("Button :");
      label.setBuddy(button);
      buttonGroupBox.add(label, {row: 0, column: 0});
      buttonGroupBox.add(button, {row: 0, column: 1});
      this.__widgets.push(button);

      // toggle button
      var toggleButton = new qx.ui.form.ToggleButton("ToggleButton").set({tabIndex: tabIndex++});
      label = new qx.ui.basic.Label("ToggleButton :");
      label.setBuddy(toggleButton);
      buttonGroupBox.add(label, {row: 1, column: 0});
      buttonGroupBox.add(toggleButton, {row: 1, column: 1});
      this.__widgets.push(toggleButton);

      // toggle button
      var repeatButton = new qx.ui.form.RepeatButton("0").set({tabIndex: tabIndex++});
      label = new qx.ui.basic.Label("RepeatButton :");
      label.setBuddy(repeatButton);
      buttonGroupBox.add(label, {row: 2, column: 0});
      buttonGroupBox.add(repeatButton, {row: 2, column: 1});
      this.__widgets.push(repeatButton);

      // menu button
      var menueButton = new qx.ui.form.MenuButton("MenuButton", null, this.__createMenuForMenuButton()).set({tabIndex: tabIndex++});
      label = new qx.ui.basic.Label("MenuButton :");
      label.setBuddy(menueButton);
      buttonGroupBox.add(label, {row: 3, column: 0});
      buttonGroupBox.add(menueButton, {row: 3, column: 1});
      this.__widgets.push(menueButton);

      // split button
      var splitButton = new qx.ui.form.SplitButton("SplitButton", null, this.__createMenuForSplitButton()).set({tabIndex: tabIndex++});
      label = new qx.ui.basic.Label("SplitButton :");
      label.setBuddy(splitButton);
      buttonGroupBox.add(label, {row: 4, column: 0});
      buttonGroupBox.add(splitButton, {row: 4, column: 1});
      this.__widgets.push(splitButton);

      // Listener
      repeatButton.addListener("execute", function()
      {
        var tempValue = parseInt(repeatButton.getLabel(), 10) + 1;
        repeatButton.setLabel(tempValue.toString());
      });

      /*****************************************
       * BOOLEAN INPUT
       ****************************************/

      form = new qx.ui.form.Form();

      var booleanGroupBox = new qx.ui.groupbox.GroupBox("Boolean");
      booleanGroupBox.setLayout(new qx.ui.layout.Canvas());
      this.add(booleanGroupBox, {row:1, column: 1});

      // check box
      var checkBox = new qx.ui.form.CheckBox().set({tabIndex: tabIndex++});
      form.add(checkBox, "CheckBox");
      this.__widgets.push(checkBox);

      // tri-state check box
      var triCheckBox = new qx.ui.form.CheckBox().set({
        tabIndex: tabIndex++,
        triState: true,
        value: null
      });
      form.add(triCheckBox, "Tri-State CheckBox");
      this.__widgets.push(triCheckBox);

      // radio button
      var radioButton = new qx.ui.form.RadioButton().set({tabIndex: tabIndex++});
      form.add(radioButton, "RadioButton");
      this.__widgets.push(radioButton);

      renderedForm = new qx.ui.form.renderer.Single(form);
      booleanGroupBox.add(renderedForm);

      /*****************************************
       * NUMBER INPUT
       ****************************************/

      form = new qx.ui.form.Form();

      var numberGroupBox = new qx.ui.groupbox.GroupBox("Number");
      numberGroupBox.setLayout(new qx.ui.layout.Canvas());
      this.add(numberGroupBox, {row: 2, column: 1});

      // spinner
      var spinner = new qx.ui.form.Spinner(0, 50, 100).set({tabIndex: tabIndex++});
      form.add(spinner, "Spinner");
      this.__widgets.push(spinner);

      // slider
      var slider = new qx.ui.form.Slider().set({tabIndex: tabIndex++});
      slider.setWidth(130);
      form.add(slider, "Slider");
      this.__widgets.push(slider);

      slider.bind("value", spinner, "value");
      spinner.bind("value", slider, "value");

      renderedForm = new qx.ui.form.renderer.Single(form);
      numberGroupBox.add(renderedForm);
    },


    __createItems: function(widget)
    {
      for (var i = 0; i < 10; i++) {
        var tempItem = new qx.ui.form.ListItem("Item " + i);
        widget.add(tempItem);
      }
    },


    __createItemsVirtual: function(widget)
    {
      // Creates the model data
      var model = new qx.data.Array();
      for (var i = 0; i < 300; i++) {
        model.push("Item " + (i));
      }
      widget.setModel(model);
    },


    __createMenuForMenuButton : function()
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

      for (i = 0; i < 3; i++) {
        var tempButton = new qx.ui.menu.Button("Button" + i);
        menu.add(tempButton);
      }

      var optionButton = new qx.ui.menu.Button("Options", "", null, optionMenu);
      menu.addSeparator();
      menu.add(optionButton);

      return menu;
    },


    __createMenuForSplitButton : function()
    {
      var menu = new qx.ui.menu.Menu;

      var site1 = new qx.ui.menu.Button("Website 1");
      var site2 = new qx.ui.menu.Button("Website 2");
      var site3 = new qx.ui.menu.Button("Website 3");

      menu.add(site1);
      menu.add(site2);
      menu.add(site3);

      return menu;
    },


    getWidgets : function() {
      return this.__widgets;
    }
  }
});