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
    
    
    var mainPart = new qx.ui.toolbar.Part;
    this.add(mainPart);


    // Add/Remove buttons
    var addBtn = new qx.ui.toolbar.Button(this.tr("Add feed"), "icon/22/actions/dialog-ok.png");
    addBtn.setCommand(controller.getCommand("addFeed"));
    mainPart.add(addBtn);

    var removeBtn = new qx.ui.toolbar.Button(this.tr("Remove feed"), "icon/22/actions/dialog-cancel.png");
    removeBtn.setCommand(controller.getCommand("removeFeed"));
    mainPart.add(removeBtn);


    // Add a sepearator
    mainPart.addSeparator();


    // Reload button
    var reloadBtn = new qx.ui.toolbar.Button(this.tr("Reload"), "icon/22/actions/view-refresh.png");
    var reloadCmd = controller.getCommand("reload");
    reloadBtn.setCommand(reloadCmd);
    reloadBtn.setToolTip(new qx.ui.tooltip.ToolTip(this.tr("Reload the feeds. (%1)", reloadCmd.toString())));
    mainPart.add(reloadBtn);


    // Add a sepearator
    mainPart.addSeparator();


    // Preferences button
    var prefBtn = new qx.ui.toolbar.Button(this.tr("Preferences"), "icon/22/apps/preferences-theme.png");
    prefBtn.setCommand(controller.getCommand("preferences"));
    prefBtn.setToolTip(new qx.ui.tooltip.ToolTip(this.tr("Open preferences window.")));
    mainPart.add(prefBtn);


    // Add a spacer
    this.addSpacer();


    // Info part
    var infoPart = new qx.ui.toolbar.Part;
    this.add(infoPart);

    // About button
    var aboutBtn = new qx.ui.toolbar.Button(this.tr("Help"), "icon/22/actions/help-about.png");
    var aboutCmd = controller.getCommand("about");
    aboutBtn.setCommand(aboutCmd);
    aboutBtn.setToolTip(new qx.ui.tooltip.ToolTip("(" + aboutCmd.toString() + ")"));
    infoPart.add(aboutBtn);
  }
});
