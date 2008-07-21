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
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#asset(qx/icon/${qx.icontheme}/16/actions/*)

************************************************************************ */

qx.Class.define("demobrowser.demo.widget.Menu",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var container = new qx.ui.container.Composite(new qx.ui.layout.Canvas);
      container.setPadding(20);
      this.getRoot().add(container);

      container.add(this.getButton1(), {left: 20, top: 20});
      container.add(this.getBar1(), {left: 20, top: 100});
    },


    getButton1 : function()
    {
      var button = new qx.ui.form.Button("Menu Test");


      var optionMenu = new qx.ui.menu.Menu;

      optionMenu.add(new qx.ui.menu.Button("Option 1"));
      optionMenu.add(new qx.ui.menu.Button("Option 2"));
      optionMenu.add(new qx.ui.menu.Button("Option 3"));

      var actionMenu = new qx.ui.menu.Menu;

      actionMenu.add(new qx.ui.menu.Button("Action 1"));
      actionMenu.add(new qx.ui.menu.Button("Action 2"));
      actionMenu.add(new qx.ui.menu.Button("Action 3"));



      var cutCommand = new qx.event.Command("Ctrl+X");
      var copyCommand = new qx.event.Command("Ctrl+C");
      var pasteCommand = new qx.event.Command("Ctrl+P");


      var menu = new qx.ui.menu.Menu();

      menu.add(new qx.ui.menu.Button("Revert", "icon/16/actions/edit-undo.png"));
      menu.add(new qx.ui.menu.Button("Recover", "icon/16/actions/edit-redo.png"));
      menu.add(new qx.ui.menu.Separator);
      menu.add(new qx.ui.menu.Button("Cut", "icon/16/actions/edit-cut.png", cutCommand));
      menu.add(new qx.ui.menu.Button("Copy", "icon/16/actions/edit-copy.png", copyCommand));
      menu.add(new qx.ui.menu.Button("Paste", "icon/16/actions/edit-paste.png", pasteCommand));
      menu.add(new qx.ui.menu.Separator);
      menu.add(new qx.ui.menu.Button("Options", "icon/16/actions/system-search.png", null, optionMenu));
      menu.add(new qx.ui.menu.Button("Actions", "icon/16/actions/contact-new.png", null, actionMenu));
      menu.add(new qx.ui.menu.Separator);
      menu.add(new qx.ui.menu.Button("Print", "icon/16/actions/document-print.png"));

      button.addListener("execute", function(e)
      {
        menu.show();
        menu.activate();

        var buttonLocation = this.getContainerLocation();
        menu.moveTo(buttonLocation.left, buttonLocation.bottom);
      });

      return button;
    },


    getBar1 : function()
    {
      var toolbar = new qx.ui.toolbar.ToolBar;

      var basicPart = new qx.ui.toolbar.Part;
      var menuPart = new qx.ui.toolbar.Part;
      var helpPart = new qx.ui.toolbar.Part;

      toolbar.add(basicPart);
      toolbar.add(menuPart);
      toolbar.add(helpPart);

      var newButton = new qx.ui.toolbar.Button(null, "icon/16/actions/document-new.png");
      var openButton = new qx.ui.toolbar.Button(null, "icon/16/actions/document-open.png");
      var recentButton = new qx.ui.toolbar.Button(null, "icon/16/actions/document-open-recent.png");
      var saveButton = new qx.ui.toolbar.Button(null, "icon/16/actions/document-save.png");
      var saveAsButton = new qx.ui.toolbar.Button(null, "icon/16/actions/document-save-as.png");

      basicPart.add(newButton);
      basicPart.add(openButton);
      basicPart.add(recentButton);
      basicPart.add(saveButton);
      basicPart.add(saveAsButton);


      var fileMenu = new qx.ui.toolbar.MenuButton("File");
      var editMenu = new qx.ui.toolbar.MenuButton("Edit");
      var searchMenu = new qx.ui.toolbar.MenuButton("Search");
      var viewMenu = new qx.ui.toolbar.MenuButton("View");
      var formatMenu = new qx.ui.toolbar.MenuButton("Format");

      fileMenu.setMenu(this.getFileMenu());
      editMenu.setMenu(this.getEditMenu());
      searchMenu.setMenu(this.getSearchMenu());
      viewMenu.setMenu(this.getViewMenu());
      formatMenu.setMenu(this.getFormatMenu());

      menuPart.add(fileMenu);
      menuPart.add(editMenu);
      menuPart.add(searchMenu);
      menuPart.add(viewMenu);
      menuPart.add(formatMenu);

      return toolbar;
    },

    getFileMenu : function()
    {
      var menu = new qx.ui.menu.Menu;

      var newButton = new qx.ui.menu.Button("New");
      var openButton = new qx.ui.menu.Button("Open");
      var closeButton = new qx.ui.menu.Button("Close");
      var saveButton = new qx.ui.menu.Button("Save");
      var saveAsButton = new qx.ui.menu.Button("Save As");
      var printButton = new qx.ui.menu.Button("Print");
      var exitButton = new qx.ui.menu.Button("Exit");

      menu.add(newButton);
      menu.add(openButton);
      menu.add(closeButton);
      menu.add(saveButton);
      menu.add(saveAsButton);
      menu.add(printButton);
      menu.add(exitButton);

      return menu;
    },

    getEditMenu : function()
    {
      var menu = new qx.ui.menu.Menu;

      var newButton = new qx.ui.menu.Button("New");
      var openButton = new qx.ui.menu.Button("Open");
      var closeButton = new qx.ui.menu.Button("Close");
      var saveButton = new qx.ui.menu.Button("Save");
      var saveAsButton = new qx.ui.menu.Button("Save As");
      var printButton = new qx.ui.menu.Button("Print");
      var exitButton = new qx.ui.menu.Button("Exit");

      menu.add(newButton);
      menu.add(openButton);
      menu.add(closeButton);
      menu.add(saveButton);
      menu.add(saveAsButton);
      menu.add(printButton);
      menu.add(exitButton);

      return menu;
    },

    getSearchMenu : function()
    {
      var menu = new qx.ui.menu.Menu;

      var newButton = new qx.ui.menu.Button("New");
      var openButton = new qx.ui.menu.Button("Open");
      var closeButton = new qx.ui.menu.Button("Close");
      var saveButton = new qx.ui.menu.Button("Save");
      var saveAsButton = new qx.ui.menu.Button("Save As");
      var printButton = new qx.ui.menu.Button("Print");
      var exitButton = new qx.ui.menu.Button("Exit");

      menu.add(newButton);
      menu.add(openButton);
      menu.add(closeButton);
      menu.add(saveButton);
      menu.add(saveAsButton);
      menu.add(printButton);
      menu.add(exitButton);

      return menu;
    },

    getViewMenu : function()
    {
      var menu = new qx.ui.menu.Menu;

      var newButton = new qx.ui.menu.Button("New");
      var openButton = new qx.ui.menu.Button("Open");
      var closeButton = new qx.ui.menu.Button("Close");
      var saveButton = new qx.ui.menu.Button("Save");
      var saveAsButton = new qx.ui.menu.Button("Save As");
      var printButton = new qx.ui.menu.Button("Print");
      var exitButton = new qx.ui.menu.Button("Exit");

      menu.add(newButton);
      menu.add(openButton);
      menu.add(closeButton);
      menu.add(saveButton);
      menu.add(saveAsButton);
      menu.add(printButton);
      menu.add(exitButton);

      return menu;
    },

    getFormatMenu : function()
    {
      var menu = new qx.ui.menu.Menu;

      var newButton = new qx.ui.menu.Button("New");
      var openButton = new qx.ui.menu.Button("Open");
      var closeButton = new qx.ui.menu.Button("Close");
      var saveButton = new qx.ui.menu.Button("Save");
      var saveAsButton = new qx.ui.menu.Button("Save As");
      var printButton = new qx.ui.menu.Button("Print");
      var exitButton = new qx.ui.menu.Button("Exit");

      menu.add(newButton);
      menu.add(openButton);
      menu.add(closeButton);
      menu.add(saveButton);
      menu.add(saveAsButton);
      menu.add(printButton);
      menu.add(exitButton);

      return menu;
    }
  }
});
