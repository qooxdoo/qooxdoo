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
#ignore(demobrowser.demo.ui.CustomRenderer)
************************************************************************ */

/**
 * @lint ignoreDeprecated(alert)
 */
qx.Class.define("demobrowser.demo.ui.FormRendererCustom",
{
  extend : qx.application.Standalone,

  members :
  {
    main : function()
    {
      this.base(arguments);

      // create the form
      var form = new qx.ui.form.Form();

      // add the first headline
      form.addGroupHeader("Registration");

      // add user name
      var userName = new qx.ui.form.TextField();
      userName.setRequired(true);
      form.add(userName, "Name");
      // add password
      var password = new qx.ui.form.TextField();
      password.setRequired(true);
      form.add(password, "Password");

      // add the second header
      form.addGroupHeader("Contact");

      // add some additional widgets
      form.add(
        new qx.ui.form.TextField(), "Email", qx.util.Validate.email(), "email",
        null, {placeholder: "abc@def.gh"}
      );
      form.add(
        new qx.ui.form.TextField(), "Phone", null, "phone", null,
        {placeholder: "+01 234 56789"}
      );

      // third group
      form.addGroupHeader("Personal Information");

      // add some additional widgets
      form.add(new qx.ui.form.TextField(), "Country");
      form.add(
        new qx.ui.form.TextArea(), "Bio", null, "bio", null,
        {placeholder: "Please tell us some details about you..."}
      );

      // send button with validation
      var sendButton = new qx.ui.form.Button("Send");
      sendButton.addListener("execute", function() {
        if (form.validate()) {
          alert("send...");
        }
      }, this);
      form.addButton(sendButton);

      // reset button
      var resetButton = new qx.ui.form.Button("Reset");
      resetButton.addListener("execute", function() {
        form.reset();
      }, this);
      form.addButton(resetButton);

      // create the form and add it to the document
      var formView = new demobrowser.demo.ui.CustomRenderer(form);
      this.getRoot().add(formView, {left: 10, top: 10});
    }
  }
});

/*
 * PLEASE NOTE:
 * For demonstration purposes the following class is added to the same file as
 * the application class. For a regular qooxdoo application each class must live
 * in a file of its own. You may neglect any warnings when generating this demo.
 */
// create the custom renderer which aligns the groups horizontally
qx.Class.define("demobrowser.demo.ui.CustomRenderer", {
  extend : qx.ui.form.renderer.Single,
  members : {
    __column : 0,
    __maxRow : 0,

    addItems : function(items, names, title, options) {
      var row = 0;
      // add the header
      if (title != null) {
        this._add(
          this._createHeader(title), {
            row: row, column: this.__column, colSpan: 2
          }
        );
        row++;
      }

      // add the items
      for (var i = 0; i < items.length; i++) {
        var label = this._createLabel(names[i], items[i]);
        this._add(label, {row: row, column: this.__column});
        var item = items[i];
        label.setBuddy(item);
        if (item instanceof qx.ui.form.RadioGroup) {
          item = this._createWidgetForRadioGroup(item);
        }
        this._add(item, {row: row, column: this.__column + 1});
        // use the options
        if (options[i] && options[i].placeholder) {
          item.setPlaceholder(options[i].placeholder);
        }

        row++;
      }
      this.__column += 2;
      // save the max row height for the buttons
      this.__maxRow < row ? this.__maxRow = row : null;
    },

    addButton : function(button) {
      if (this._buttonRow == null) {
        // create button row
        this._buttonRow = new qx.ui.container.Composite();
        this._buttonRow.setMarginTop(5);
        var hbox = new qx.ui.layout.HBox();
        hbox.setAlignX("right");
        hbox.setSpacing(5);
        this._buttonRow.setLayout(hbox);
        // add the button row
        this._add(this._buttonRow, {
          row: this.__maxRow, column: 0, colSpan: this.__column
        });
      }

      // add the button
      this._buttonRow.add(button);
    }
  }
});
