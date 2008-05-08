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
     * Fabian Jakobs (fjakobs)
     * Sebastian Werner (wpbasti)
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/* ************************************************************************

#embed(qx.icontheme/16/apps/preferences-theme.png)
#asset(qx/icon/Oxygen/16/apps/preferences-theme.png)

************************************************************************ */

qx.Class.define("feedreader.view.PreferenceWindow",
{
  extend : qx.ui.window.Window,

  construct : function()
  {
    this.base(arguments, "Preferences", "icon/16/apps/preferences-theme.png");

    // set the properties of the window
    this.set(
    {
      modal         : true,
      showMinimize  : false,
      showMaximize  : false,
      allowMaximize : false
    });

    // Create the content with a helper
    this._addContent();
  },

  members :
  {

    /**
     * Adds the content of the window.
     */
    _addContent : function()
    {
      // set the layout of the window
      this.setLayout(new qx.ui.layout.VBox());

      // create and add a groupbox
      var groupBox = new qx.ui.groupbox.GroupBox("Theme");
      groupBox.setMargin(5);
      this.add(groupBox);
      groupBox.setLayout(new qx.ui.layout.VBox());

      // create the radio buttons for the themes
      var button_classic = new qx.ui.form.RadioButton("Classic");
      button_classic.setChecked(true);
      var button_modern = new qx.ui.form.RadioButton("Modern");

      // create and apply the radio manager
      var radioManager = new qx.ui.core.RadioManager();
      radioManager.add(button_modern, button_classic);

      // add the buttons to the groupbox
      groupBox.add(button_classic);
      groupBox.add(button_modern);

      // register the listener for the theme changes
      radioManager.addListener("change", function(e) {
        if (e.getValue() == button_classic) {
          alert("Apply classic theme.");
        } else if (e.getValue() == button_modern) {
          alert("Apply modern theme.");
        }
      }, this);
    }
  }
});
