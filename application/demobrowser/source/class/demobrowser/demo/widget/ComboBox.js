/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */

qx.Class.define("demobrowser.demo.widget.ComboBox",
{
  extend : qx.application.Standalone,

  members :
  {
    /**
     * TODOC
     *
     * @return {void}
     */
    main : function()
    {
      this.base(arguments);

      // examlpe 1: default combo box with 30 text items
      this._createDefaultExample();

      // example 2: combo box with text and icons
      this._createIconExample();

      // example 3: wide combo box with a large list
      this._createWideExample();

      // example 4: combo combo box with HTML (rich) text
      this._createHtmlExample();
    },


    /**
     * Creates a default example.
     * This means that a regular combobox will be created and filled with
     * some tempaltes.
     *
     * @return {void}
     */
    _createDefaultExample : function()
    {
      // create and add the describing label
      var label = new qx.ui.basic.Label("Default");
      label.setFont("bold");

      this.getRoot().add(label,
      {
        left : 20,
        top  : 20
      });

      // create a combo box
      var comboBox = new qx.ui.form.ComboBox();

      // fill the combo box with some stuff
      for (var i=1; i<31; i++)
      {
        var tempItem = new qx.ui.form.ListItem("2^ " + i + " = " + Math.pow(2, i));
        comboBox.add(tempItem);
      }

      comboBox.addListener("changeValue", function(e) {
        this.debug("ChangeValue: " + e.getData());
      });

      // add the combobox to the documents root
      this.getRoot().add(comboBox,
      {
        left : 20,
        top  : 40
      });
    },


    /**
     * Creates a icon example.
     * This means that a combobox will be created and filled with
     * some icons and text. in the textfield of the combo box is only
     * the text displayed.
     *
     * @return {void}
     */
    _createIconExample : function()
    {
      // create and add the describing label
      var label = new qx.ui.basic.Label("With icons");
      label.setFont("bold");

      this.getRoot().add(label,
      {
        left : 160,
        top  : 20
      });

      // create a combo box
      var comboBox = new qx.ui.form.ComboBox();

      // fill the combo box with some stuff
      for (var i=1; i<31; i++)
      {
        var tempItem = new qx.ui.form.ListItem(i + "'s Icon", "icon/16/places/folder.png");
        comboBox.add(tempItem);
      }

      // add the combobox to the documents root
      this.getRoot().add(comboBox,
      {
        left : 160,
        top  : 40
      });
    },

    /**
     * Creates a HTML example.
     * This means that a combobox will be created and filled with
     * some text, that contain HTML tags and entities.
     *
     * @return {void}
     */
    _createHtmlExample : function()
    {
      // create and add the describing label
      var label = new qx.ui.basic.Label("With HTML (rich) text");
      label.setFont("bold");

      this.getRoot().add(label,
      {
        left : 300,
        top  : 20
      });

      // create a combo box
      var comboBox = new qx.ui.form.ComboBox().set({width: 200});

      var items = ["... &gt; (as literal HTML entity)",
                   "... &gt; (as Richtext)",
                   "<b>Bold Text</b>",
                   "<u>Underlined Text</u>",
                   "<i>Italic Text</i>",
                   "HTML entities: &laquo; &lt; &amp; &gt; &raquo;"];

      // fill the combo box with some stuff
      for (var i = 0; i < items.length; i++)
      {
        var tempItem = new qx.ui.form.ListItem(items[i]);

        if (i > 0) {
          tempItem.setRich(true);
        }

        comboBox.add(tempItem);
      }

      // add the combobox to the documents root
      this.getRoot().add(comboBox,
      {
        left : 300,
        top  : 40
      });
    },

    /**
     * TODOC
     *
     * @return {void}
     */
    _createWideExample : function()
    {
      // create and add the describing label
      var label = new qx.ui.basic.Label("Wide, long list");
      label.setFont("bold");

      this.getRoot().add(label,
      {
        left : 20,
        top  : 280
      });

      // create a combo box
      var comboBox = new qx.ui.form.ComboBox();
      comboBox.setWidth(300);

      // fill the combo box with some stuff
      for (var i=1; i<101; i++)
      {
        var tempItem = new qx.ui.form.ListItem(i + "'s Item");
        comboBox.add(tempItem);
      }
      comboBox.setValue(comboBox.getChildrenContainer().getSelectables()[0].getLabel());

      // add the combobox to the documents root
      this.getRoot().add(comboBox,
      {
        left : 20,
        top  : 300
      });
    }


  }
});
