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
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/* ************************************************************************

#asset(qx/icon/${qx.icontheme}/16/devices/*)

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
        top  : 25
      });

      // create a combo box
      var comboBox = new qx.ui.form.ComboBox();

      // fill the combo box with some stuff
      for (var i=1; i<31; i++)
      {
        var tempItem = new qx.ui.form.ListItem("2^ " + i + " = " + Math.pow(2, i));
        comboBox.add(tempItem);
      }

      comboBox.addListener("input", function(e) {
        this.debug("Input: " + e.getData());
      });

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
        top  : 25
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
        top  : 285
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

      // add the combobox to the documents root
      this.getRoot().add(comboBox,
      {
        left : 20,
        top  : 300
      });
    }
  }
});
