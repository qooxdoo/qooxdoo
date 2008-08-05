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

#asset(qx/icon/Tango/22/actions/dialog-ok.png)
#asset(qx/icon/Tango/22/actions/dialog-cancel.png)
#asset(qx/icon/Tango/22/actions/view-refresh.png)
#asset(qx/icon/Tango/22/apps/preferences-theme.png)
#asset(qx/icon/Tango/22/actions/help-about.png)

#asset(qx/icon/Oxygen/22/actions/dialog-ok.png)
#asset(qx/icon/Oxygen/22/actions/dialog-cancel.png)
#asset(qx/icon/Oxygen/22/actions/view-refresh.png)
#asset(qx/icon/Oxygen/22/apps/preferences-theme.png)
#asset(qx/icon/Oxygen/22/actions/help-about.png)

************************************************************************ */

/**
 * The main tool bar widget
 */
qx.Class.define("feedreader.view.ToolBar",
{
  extend : qx.ui.toolbar.ToolBar,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param controller {feedreader.Application} The main application class
   */
  construct : function(controller)
  {
    this.base(arguments);


    // Add/Remove buttons
    var addBtn = new qx.ui.toolbar.Button(this.tr("Add feed"), "icon/22/actions/dialog-ok.png");
    addBtn.setCommand(controller.getCommand("addFeed"));
    this.add(addBtn);

    var removeBtn = new qx.ui.toolbar.Button(this.tr("Remove feed"), "icon/22/actions/dialog-cancel.png");
    removeBtn.setCommand(controller.getCommand("removeFeed"));
    this.add(removeBtn);


    // Add a sepearator
    this.add(new qx.ui.toolbar.Separator());


    // Reload button
    var reloadBtn = new qx.ui.toolbar.Button(this.tr("Reload"), "icon/22/actions/view-refresh.png");
    var reloadCmd = controller.getCommand("reload");
    reloadBtn.setCommand(reloadCmd);
    reloadBtn.setToolTip(new qx.ui.tooltip.ToolTip(this.tr("Reload the feeds. (%1)", reloadCmd.toString())));
    this.add(reloadBtn);


    // Add a sepearator
    this.add(new qx.ui.toolbar.Separator());


    // Preferences button
    var prefBtn = new qx.ui.toolbar.Button(this.tr("Preferences"), "icon/22/apps/preferences-theme.png");
    prefBtn.setCommand(controller.getCommand("preferences"));
    prefBtn.setToolTip(new qx.ui.tooltip.ToolTip(this.tr("Open preferences window.")));
    this.add(prefBtn);


    // Add a spacer
    this.addSpacer();


    // About button
    var about_btn = new qx.ui.toolbar.Button(this.tr("Help"), "icon/22/actions/help-about.png");
    var aboutCmd = controller.getCommand("about");
    about_btn.setCommand(aboutCmd);
    about_btn.setToolTip(new qx.ui.tooltip.ToolTip("(" + aboutCmd.toString() + ")"));
    this.add(about_btn);
  }
});
