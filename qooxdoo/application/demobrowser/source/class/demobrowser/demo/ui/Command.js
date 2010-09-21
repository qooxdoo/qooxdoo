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

#asset(qx/icon/${qx.icontheme}/16/actions/document-save.png)

************************************************************************ */

/**
 * @lint ignoreDeprecated(alert)
 * @tag showcase
 */
qx.Class.define("demobrowser.demo.ui.Command",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      // create and configure the command
      var command = new qx.ui.core.Command("CTRL+S");
      command.setLabel("Save");
      command.setIcon("icon/16/actions/document-save.png");
      command.setToolTipText("Save the current file.");
      command.addListener("execute", function() {
        alert("Saving...");
      }, this);

      // create a window
      var win = new qx.ui.window.Window("Editor");
      win.setLayout(new qx.ui.layout.VBox(0));
      win.setWidth(400);
      win.setHeight(300);
      win.setContentPadding(0);
      win.moveTo(30, 10);
      win.open();

      // add a menu bar
      var menubar = new qx.ui.menubar.MenuBar();
      win.add(menubar);
      var menubutton = new qx.ui.menubar.Button("File");
      menubar.add(menubutton);
      var menu = new qx.ui.menu.Menu();
      menubutton.setMenu(menu);
      var menuSaveButton = new qx.ui.menu.Button();
      menuSaveButton.setCommand(command);
      menu.add(menuSaveButton);

      // add a toolbar
      var toolbar = new qx.ui.toolbar.ToolBar();
      win.add(toolbar);
      var tbutton = new qx.ui.toolbar.Button();
      tbutton.setCommand(command);
      tbutton.setShow("icon");
      toolbar.add(tbutton);

      // add a container for the content
      var content = new qx.ui.container.Composite();
      content.setLayout(new qx.ui.layout.VBox());
      win.add(content, {flex: 1});

      // add a textarea
      var textarea = new qx.ui.form.TextArea();
      content.add(textarea, {flex: 1});

      // add a save button
      var saveButton = new qx.ui.form.Button();
      saveButton.setCommand(command);
      saveButton.setShow("label");
      content.add(saveButton);


      /**
       * Description
       */
      var desc = "You can see three buttons in this window:\n" +
                 "  Button in the menu\n" +
                 "  Button in the toolbar\n" +
                 "  Button in the content at the bottom\n" +
                 "Each of the buttons is configured using the same command " +
                 "and have the same execute listener.";
      textarea.setValue(desc);
    }
  }
});
