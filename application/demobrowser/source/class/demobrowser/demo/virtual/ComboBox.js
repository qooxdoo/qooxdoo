/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

************************************************************************ */

qx.Class.define("demobrowser.demo.virtual.ComboBox",
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
     * some templates.
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
      var comboBox = new qx.ui.form.VirtualComboBox();

      //create a simple model
      var rawData = [];
      for (var i=1; i<401; i++)
      {
        rawData.push("2^ " + i + " = " + Math.pow(2, i));
      }
      var model = qx.data.marshal.Json.createModel(rawData);
      comboBox.setModel(model);

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
      var comboBox = new qx.ui.form.VirtualComboBox();

      // create the model
      var rawData = [];
      for (var i=1; i<31; i++)
      {
        rawData.push({
          label : i + "'s Icon",
          icon : "icon/16/places/folder.png"
        });
      }
      var model = qx.data.marshal.Json.createModel(rawData);
      comboBox.setModel(model);
      comboBox.setLabelPath("label");
      comboBox.setIconPath("icon");

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
      var comboBox = new qx.ui.form.VirtualComboBox().set({width: 200});

      var items = ["... &gt; (as literal HTML entity)",
                   "... &gt; (as Richtext)",
                   "<b>Bold Text</b>",
                   "<u>Underlined Text</u>",
                   "<i>Italic Text</i>",
                   "HTML entities: &laquo; &lt; &amp; &gt; &raquo;"];

      // create the model
      var model = qx.data.marshal.Json.createModel(items);
      comboBox.setModel(model);

      // Set the created list item's "rich" property
      var delegate = {
        configureItem : function(item)
        {
          item.setRich(true);
        }
      }

      comboBox.setDelegate(delegate);

      // Provide a formatting function to convert the displayed value back to
      // plain text
      comboBox.setDefaultFormat(function(data) {
        if (data) {
          data = qx.lang.String.stripTags(data);
          data = qx.bom.String.unescape(data);
        }
        return data;
      });

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
      var label = new qx.ui.basic.Label("Sorted and filtered model");
      label.setFont("bold");

      this.getRoot().add(label,
      {
        left : 20,
        top  : 280
      });

      // create a combo box
      var comboBox = new qx.ui.form.VirtualComboBox();

      //create a simple model
      var rawData = [];
      for (var i=1; i<100; i++)
      {
        rawData.push("Item " + i);
      }
      var model = qx.data.marshal.Json.createModel(rawData);
      comboBox.setModel(model);

      var delegate = {
        // Inverts the order
        sorter : function(a, b) {
          return a < b ? 1 : a > b ? -1 : 0;
        },
        // Remove even-numbered items
        filter : function(item) {
          var num = parseInt(/([0-9]+)/.exec(item)[1], 10);
          return num % 2 ? true : false;
        }
      }

      comboBox.setDelegate(delegate);

      // add the combobox to the documents root
      this.getRoot().add(comboBox,
      {
        left : 20,
        top  : 300
      });
    }


  }
});
