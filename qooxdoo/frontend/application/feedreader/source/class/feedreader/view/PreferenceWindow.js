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

#asset(qx/icon/Tango/16/apps/preferences-theme.png)
#asset(qx/icon/Oxygen/16/apps/preferences-theme.png)

************************************************************************ */

/**
 * The feed reader preference window
 */
qx.Class.define("feedreader.view.PreferenceWindow",
{
  extend : qx.ui.window.Window,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments, this.tr("Preferences"), "icon/16/apps/preferences-theme.png");

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




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Adds the content of the window.
     */
    _addContent : function()
    {
      // Set the layout of the window
      this.setLayout(new qx.ui.layout.VBox());

      // Create and add a groupbox
      var groupBox = new qx.ui.groupbox.GroupBox(this.tr("Theme"));
      groupBox.setMargin(10, 4);
      groupBox.setMinWidth(150);
      groupBox.setLayout(new qx.ui.layout.VBox());
      this.add(groupBox);

      // Create the radio buttons for the themes
      var button_classic = new qx.ui.form.RadioButton(this.tr("Classic"));
      button_classic.setValue(qx.theme.Classic.name);

      var button_modern = new qx.ui.form.RadioButton(this.tr("Modern"));
      button_modern.setValue(qx.theme.Modern.name);
      button_modern.setChecked(true);

      // Create and apply the radio manager
      var radioManager = new qx.ui.core.RadioManager();
      radioManager.add(button_modern, button_classic);

      // Add the buttons to the groupbox
      groupBox.add(button_classic);
      groupBox.add(button_modern);

      // Register the listener for the theme changes
      radioManager.addListener("change", this._onThemeChange, this);
    },


    /**
     * Event handler. Called on a selcetion change on the radio buttons.
     *
     * @param e {qx.event.type.Event} The event object
     */
    _onThemeChange : function(e)
    {
      var mgr = qx.theme.manager.Meta.getInstance();
      var clazz = qx.Theme.getByName(e.getData().getValue());
      mgr.setTheme(clazz);
    }
  }
});
