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
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * @tag showcase
 */
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



      /** **************************************
       * TEXT INPUT
       * **************************************/

      var textGroupBox = new qx.ui.groupbox.GroupBox("Text");
      textGroupBox.setLayout(new qx.ui.layout.Grid(8, 8));
      textGroupBox.setWidth(290);
      this.getRoot().add(textGroupBox, {left: 20, top: 10});

      // text field
      var textField = new qx.ui.form.TextField();
      textField.setPlaceholder("placeholder");
      var label = new qx.ui.basic.Label("TextField:");
      label.setBuddy(textField);
      textGroupBox.add(label, {row: 0, column: 0});
      textGroupBox.add(textField, {row: 0, column: 1});

      // password field
      var passwordField = new qx.ui.form.PasswordField();
      passwordField.setPlaceholder("password");
      label = new qx.ui.basic.Label("PasswordField:");
      label.setBuddy(passwordField);
      textGroupBox.add(label, {row: 1, column: 0});
      textGroupBox.add(passwordField, {row: 1, column: 1});

      // text area
      var textArea = new qx.ui.form.TextArea();
      textArea.setPlaceholder("placeholder");
      label = new qx.ui.basic.Label("TextArea:");
      label.setBuddy(textArea);
      textGroupBox.add(label, {row: 2, column: 0});
      textGroupBox.add(textArea, {row: 2, column: 1});

      // combo box
      var comboBox = new qx.ui.form.ComboBox();
      comboBox.setPlaceholder("placeholder");
      label = new qx.ui.basic.Label("ComboBox:");
      label.setBuddy(comboBox);
      textGroupBox.add(label, {row: 3, column: 0});
      textGroupBox.add(comboBox, {row: 3, column: 1});
      this.createItems(comboBox);

      // date field
      var dateField = new qx.ui.form.DateField();
      dateField.setPlaceholder("dd.mm.YYYY");
      label = new qx.ui.basic.Label("DateField:");
      label.setBuddy(dateField);
      textGroupBox.add(label, {row: 4, column: 0});
      textGroupBox.add(dateField, {row: 4, column: 1});



      /** **************************************
       * SELECTION
       * **************************************/

      var selectionGroupBox = new qx.ui.groupbox.GroupBox("Selection");
      selectionGroupBox.setLayout(new qx.ui.layout.Grid(8, 8));
      selectionGroupBox.setWidth(290);
      this.getRoot().add(selectionGroupBox, {left: 20, top: 250});

      // select box
      var selectBox = new qx.ui.form.SelectBox();
      label = new qx.ui.basic.Label("SelectBox:");
      label.setBuddy(selectBox);
      selectionGroupBox.add(label, {row: 0, column: 0});
      selectionGroupBox.add(selectBox, {row: 0, column: 1});
      this.createItems(selectBox);

      // list
      var list = new qx.ui.form.List();
      list.setHeight(60);
      list.setWidth(155)
      label = new qx.ui.basic.Label("List:");
      label.setBuddy(list);
      selectionGroupBox.add(label, {row: 1, column: 0});
      selectionGroupBox.add(list, {row: 1, column: 1});
      this.createItems(list);

      // radio button group
      var radioButtonGroup = new qx.ui.form.RadioButtonGroup();
      radioButtonGroup.add(new qx.ui.form.RadioButton("RadioButton 1"));
      radioButtonGroup.add(new qx.ui.form.RadioButton("RadioButton 2"));
      radioButtonGroup.add(new qx.ui.form.RadioButton("RadioButton 3"));
      label = new qx.ui.basic.Label("RadioButtonGroup:");
      label.setBuddy(radioButtonGroup);
      selectionGroupBox.add(label, {row: 2, column: 0});
      selectionGroupBox.add(radioButtonGroup, {row: 2, column: 1});





      /** **************************************
       * BUTTOS
       * **************************************/

      var buttonGroupBox = new qx.ui.groupbox.GroupBox("Buttons");
      buttonGroupBox.setLayout(new qx.ui.layout.Grid(8, 8));
      buttonGroupBox.setWidth(210);
      this.getRoot().add(buttonGroupBox, {left: 330, top: 10});

      // button
      var button = new qx.ui.form.Button("Button");
      label = new qx.ui.basic.Label("Button:");
      label.setBuddy(button);
      buttonGroupBox.add(label, {row: 0, column: 0});
      buttonGroupBox.add(button, {row: 0, column: 1});

      // toggle button
      var toggleButton = new qx.ui.form.ToggleButton("ToggleButton");
      label = new qx.ui.basic.Label("ToggleButton:");
      label.setBuddy(toggleButton);
      buttonGroupBox.add(label, {row: 1, column: 0});
      buttonGroupBox.add(toggleButton, {row: 1, column: 1});

      // toggle button
      var repeatButton = new qx.ui.form.RepeatButton("0");
      label = new qx.ui.basic.Label("RepeatButton:");
      label.setBuddy(repeatButton);
      buttonGroupBox.add(label, {row: 2, column: 0});
      buttonGroupBox.add(repeatButton, {row: 2, column: 1});

      // menu button
      var menueButton = new qx.ui.form.MenuButton("MenuButton", null, this.createMenuForMenuButton());
      label = new qx.ui.basic.Label("MenuButton:");
      label.setBuddy(menueButton);
      buttonGroupBox.add(label, {row: 3, column: 0});
      buttonGroupBox.add(menueButton, {row: 3, column: 1});

      // split button
      var splitButton = new qx.ui.form.SplitButton("SplitButton", null, this.createMenuForSplitButton());
      label = new qx.ui.basic.Label("SplitButton:");
      label.setBuddy(splitButton);
      buttonGroupBox.add(label, {row: 4, column: 0});
      buttonGroupBox.add(splitButton, {row: 4, column: 1});

      // Listener
      repeatButton.addListener("execute", function()
      {
        var tempValue = parseInt(repeatButton.getLabel()) + 1;
        repeatButton.setLabel(tempValue.toString());
      });



      /** **************************************
       * BOOLEAN INPUT
       * **************************************/

      var booleanGroupBox = new qx.ui.groupbox.GroupBox("Boolean");
      booleanGroupBox.setLayout(new qx.ui.layout.Grid(8, 8));
      booleanGroupBox.setWidth(210);
      this.getRoot().add(booleanGroupBox, {left: 330, top: 210});

      // check box
      var checkBox = new qx.ui.form.CheckBox("CheckBox");
      label = new qx.ui.basic.Label("CheckBox:");
      label.setBuddy(checkBox);
      booleanGroupBox.add(label, {row: 0, column: 0});
      booleanGroupBox.add(checkBox, {row: 0, column: 1});

      // radio button
      var radioButton = new qx.ui.form.RadioButton("RadioButton");
      booleanGroupBox.add(new qx.ui.basic.Label("RadioButtons:"), {row: 1, column: 0});
      booleanGroupBox.add(radioButton, {row: 1, column: 1});



      /** **************************************
       * NUMBER INPUT
       * **************************************/

      var numberGroupBox = new qx.ui.groupbox.GroupBox("Number");
      numberGroupBox.setLayout(new qx.ui.layout.Grid(8, 8));
      numberGroupBox.setWidth(210);
      this.getRoot().add(numberGroupBox, {left: 330, top: 310});

      // spinner
      var spinner = new qx.ui.form.Spinner(0, 50, 100);
      label = new qx.ui.basic.Label("Spinner:");
      label.setBuddy(spinner);
      numberGroupBox.add(label, {row: 0, column: 0});
      numberGroupBox.add(spinner, {row: 0, column: 1});

      // slider
      var slider = new qx.ui.form.Slider();
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
