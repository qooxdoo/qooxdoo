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
     * Christian Schmidt (chris_schmidt)

************************************************************************ */

qx.Class.define("demobrowser.demo.showcase.Form",
{
  extend : qx.application.Standalone,

  statics:
  {
    ITEM_SIZE: 5
  },

  members :
  {
    main: function()
    {
      this.base(arguments);

      // container
      var container = new qx.ui.container.Composite(new qx.ui.layout.Grid(8, 8));
      this.getRoot().add(container, {top: 20, left: 20});

      // text field
      var textField = new qx.ui.form.TextField();
      textField.setPlaceholder("placeholder");
      var label = new qx.ui.basic.Label("TextField:");
      label.setBuddy(textField);
      container.add(label, {row: 0, column: 0});
      container.add(textField, {row: 0, column: 1});

      // password field
      var passwordField = new qx.ui.form.PasswordField();
      passwordField.setPlaceholder("password");
      label = new qx.ui.basic.Label("PasswordField:");
      label.setBuddy(passwordField);
      container.add(label, {row: 1, column: 0});
      container.add(passwordField, {row: 1, column: 1});

      // spinner
      var spinner = new qx.ui.form.Spinner(0, 50, 100);
      label = new qx.ui.basic.Label("Spinner:");
      label.setBuddy(spinner);
      container.add(label, {row: 2, column: 0});
      container.add(spinner, {row: 2, column: 1});

      // date field
      var dateField = new qx.ui.form.DateField();
      dateField.setValue(new Date());
      label = new qx.ui.basic.Label("DateField:");
      label.setBuddy(dateField);
      container.add(label, {row: 3, column: 0});
      container.add(dateField, {row: 3, column: 1});

      // combo box
      var comboBox = new qx.ui.form.ComboBox();
      label = new qx.ui.basic.Label("ComboBox:");
      label.setBuddy(comboBox);
      container.add(label, {row: 4, column: 0});
      container.add(comboBox, {row: 4, column: 1});
      this.createItems(comboBox);

      // select box
      var selectBox = new qx.ui.form.SelectBox();
      label = new qx.ui.basic.Label("SelectBox:");
      label.setBuddy(selectBox);
      container.add(label, {row: 5, column: 0});
      container.add(selectBox, {row: 5, column: 1});
      this.createItems(selectBox);

      // check box
      var checkBox = new qx.ui.form.CheckBox("CheckBox");
      label = new qx.ui.basic.Label("CheckBox:");
      label.setBuddy(checkBox);
      container.add(label, {row: 6, column: 0});
      container.add(checkBox, {row: 6, column: 1});

      // radio group
      var radioButton1 = new qx.ui.form.RadioButton("RadioButton 1");
      var radioButton2 = new qx.ui.form.RadioButton("RadioButton 2");
      new qx.ui.form.RadioGroup(radioButton1, radioButton2);
      container.add(new qx.ui.basic.Label("RadioGroup:"), {row: 7, column: 0});
      container.add(radioButton1, {row: 7, column: 1});
      container.add(radioButton2, {row: 8, column: 1});

      // text area
      var textArea = new qx.ui.form.TextArea();
      textArea.setPlaceholder("placeholder");
      label = new qx.ui.basic.Label("TextArea:");
      label.setBuddy(textArea);
      container.add(label, {row: 9, column: 0});
      container.add(textArea, {row: 9, column: 1});

      // list
      var list = new qx.ui.form.List();
      label = new qx.ui.basic.Label("List:");
      label.setBuddy(list);
      container.add(label, {row: 10, column: 0});
      container.add(list, {row: 10, column: 1});
      this.createItems(list);
      list.setHeight(60);

      // slider
      var slider = new qx.ui.form.Slider();
      label = new qx.ui.basic.Label("Slider:");
      label.setBuddy(slider);
      container.add(label, {row: 11, column: 0});
      container.add(slider, {row: 11, column: 1});

      // button
      var button = new qx.ui.form.Button("Button");
      label = new qx.ui.basic.Label("Button:");
      label.setBuddy(button);
      container.add(label, {row: 12, column: 0});
      container.add(button, {row: 12, column: 1});

      // toggle button
      var toggleButton = new qx.ui.form.ToggleButton("ToggleButton");
      label = new qx.ui.basic.Label("ToggleButton:");
      label.setBuddy(toggleButton);
      container.add(label, {row: 13, column: 0});
      container.add(toggleButton, {row: 13, column: 1});

      // toggle button
      var repeatButton = new qx.ui.form.RepeatButton("0");
      label = new qx.ui.basic.Label("RepeatButton:");
      label.setBuddy(repeatButton);
      container.add(label, {row: 14, column: 0});
      container.add(repeatButton, {row: 14, column: 1});

      // menu button
      var menueButton = new qx.ui.form.MenuButton("MenuButton", null, this.createMenuForMenuButton());
      label = new qx.ui.basic.Label("MenuButton:");
      label.setBuddy(menueButton);
      container.add(label, {row: 15, column: 0});
      container.add(menueButton, {row: 15, column: 1});

      // split button
      var splitButton = new qx.ui.form.SplitButton("SplitButton", null, this.createMenuForSplitButton());
      label = new qx.ui.basic.Label("SplitButton:");
      label.setBuddy(splitButton);
      container.add(label, {row: 16, column: 0});
      container.add(splitButton, {row: 16, column: 1});

      // Listener
      repeatButton.addListener("execute", function()
      {
        var tempValue = parseInt(repeatButton.getLabel()) + 1;
        repeatButton.setLabel(tempValue.toString());
      });
    },

    createItems: function(widget)
    {
      for (var i = 0; i < this.self(arguments).ITEM_SIZE; i++) {
        var tempItem = new qx.ui.form.ListItem("ListItem " + i);
        widget.add(tempItem);
      }
    },

    createMenuForMenuButton : function()
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

    createMenuForSplitButton : function()
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
