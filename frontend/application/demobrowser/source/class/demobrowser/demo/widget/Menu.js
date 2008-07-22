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
#asset(qx/icon/${qx.icontheme}/16/apps/help-browser.png)

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

      this.createCommands();

      container.add(this.getButton1(), {left: 20, top: 20});
      container.add(this.getBar1(), {left: 20, top: 100});
    },


    createCommands : function()
    {
      this._newCommand = new qx.event.Command("Ctrl+N");

      this._undoCommand = new qx.event.Command("Ctrl+Z");
      this._redoCommand = new qx.event.Command("Ctrl+R");

      this._cutCommand = new qx.event.Command("Ctrl+X");
      this._copyCommand = new qx.event.Command("Ctrl+C");
      this._pasteCommand = new qx.event.Command("Ctrl+P");

      this._pasteCommand.setEnabled(false);
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

      var menu = new qx.ui.menu.Menu();

      menu.add(new qx.ui.menu.Button("Undo", "icon/16/actions/edit-undo.png", this._undoCommand));
      menu.add(new qx.ui.menu.Button("Redo", "icon/16/actions/edit-redo.png", this._redoCommand));
      menu.addSeparator();
      menu.add(new qx.ui.menu.Button("Cut", "icon/16/actions/edit-cut.png", this._cutCommand));
      menu.add(new qx.ui.menu.Button("Copy", "icon/16/actions/edit-copy.png", this._copyCommand));
      menu.add(new qx.ui.menu.Button("Paste", "icon/16/actions/edit-paste.png", this._pasteCommand));
      menu.addSeparator();
      menu.add(new qx.ui.menu.Button("Options", "icon/16/actions/system-search.png", null, optionMenu));
      menu.add(new qx.ui.menu.Button("Actions", "icon/16/actions/contact-new.png", null, actionMenu));
      menu.addSeparator();
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
      toolbar.setWidth(600);

      var basicPart = new qx.ui.toolbar.Part;
      var menuPart = new qx.ui.toolbar.Part;
      var helpPart = new qx.ui.toolbar.Part;
      var searchPart = new qx.ui.toolbar.Part;

      toolbar.add(basicPart);
      toolbar.add(menuPart);
      toolbar.addSpacer();
      toolbar.add(searchPart);
      toolbar.add(helpPart);

      var newButton = new qx.ui.toolbar.Button(null, "icon/16/actions/document-new.png", this._newCommand);
      var openButton = new qx.ui.toolbar.Button(null, "icon/16/actions/document-open.png", this._openCommand);
      var saveButton = new qx.ui.toolbar.Button(null, "icon/16/actions/document-save.png", this._saveCommand);

      basicPart.add(newButton);
      basicPart.add(openButton);
      basicPart.add(saveButton);


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


      var searchField = new qx.ui.form.TextField;
      searchField.setFont("small");
      searchField.setDecorator("inset-thin");
      searchField.setAlignY("middle");
      searchPart.add(searchField);


      var helpMenu = new qx.ui.toolbar.MenuButton("Help");
      helpMenu.setMenu(this.getHelpMenu());
      helpPart.add(helpMenu);

      return toolbar;
    },

    getFileMenu : function()
    {
      var menu = new qx.ui.menu.Menu;

      var newButton = new qx.ui.menu.Button("New", "icon/16/actions/document-new.png", this._newCommand);
      var openButton = new qx.ui.menu.Button("Open", "icon/16/actions/document-open.png");
      var closeButton = new qx.ui.menu.Button("Close");
      var saveButton = new qx.ui.menu.Button("Save", "icon/16/actions/document-save.png");
      var saveAsButton = new qx.ui.menu.Button("Save as...", "icon/16/actions/document-save-as.png");
      var printButton = new qx.ui.menu.Button("Print", "icon/16/actions/document-print.png");
      var exitButton = new qx.ui.menu.Button("Exit", "icon/16/actions/application-exit.png");

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

      var undoButton = new qx.ui.menu.Button("Undo", "icon/16/actions/edit-undo.png", this._undoCommand);
      var redoButton = new qx.ui.menu.Button("Redo", "icon/16/actions/edit-redo.png", this._redoCommand);
      var cutButton = new qx.ui.menu.Button("Cut", "icon/16/actions/edit-cut.png", this._cutCommand);
      var copyButton = new qx.ui.menu.Button("Copy", "icon/16/actions/edit-copy.png", this._copyCommand);
      var pasteButton = new qx.ui.menu.Button("Paste", "icon/16/actions/edit-paste.png", this._pasteCommand);

      menu.add(undoButton);
      menu.add(redoButton);
      menu.addSeparator();
      menu.add(cutButton);
      menu.add(copyButton);
      menu.add(pasteButton);

      return menu;
    },

    getSearchMenu : function()
    {
      var menu = new qx.ui.menu.Menu;

      var searchButton = new qx.ui.menu.Button("Search...", "icon/16/actions/system-search.png");
      var nextButton = new qx.ui.menu.Button("Search next...");
      var previousButton = new qx.ui.menu.Button("Search previous...");
      var replaceButton = new qx.ui.menu.Button("Replace");
      var searchFilesButton = new qx.ui.menu.Button("Search in files", "icon/16/actions/system-search.png");
      var replaceFilesButton = new qx.ui.menu.Button("Replace in files");

      menu.add(searchButton);
      menu.add(nextButton);
      menu.add(previousButton);
      menu.add(replaceButton);
      menu.addSeparator();
      menu.add(searchFilesButton);
      menu.add(replaceFilesButton);

      return menu;
    },

    getViewMenu : function()
    {
      var menu = new qx.ui.menu.Menu;

      var panesButton = new qx.ui.menu.Button("Panes", null, null, this.getPanesMenu());
      var syntaxButton = new qx.ui.menu.Button("Syntax", null, null, this.getSyntaxMenu());
      var rulerButton = new qx.ui.menu.Button("Show ruler");
      var numbersButton = new qx.ui.menu.Button("Show line numbers");
      var asciiButton = new qx.ui.menu.Button("ASCII table");

      menu.add(panesButton);
      menu.add(syntaxButton);
      menu.addSeparator();
      menu.add(rulerButton);
      menu.add(numbersButton);
      menu.addSeparator();
      menu.add(asciiButton);

      return menu;
    },

    getPanesMenu : function()
    {
      var menu = new qx.ui.menu.Menu;

      var statusButton = new qx.ui.menu.Button("Show tabs");
      var tabsButton = new qx.ui.menu.Button("Show status bar");

      var treeButton = new qx.ui.menu.Button("Show tree");
      var macroButton = new qx.ui.menu.Button("Show macros");
      var tagButton = new qx.ui.menu.Button("Show tags");
      var consoleButton = new qx.ui.menu.Button("Show console");

      menu.add(statusButton);
      menu.add(tabsButton);
      menu.addSeparator();
      menu.add(treeButton);
      menu.add(macroButton);
      menu.add(tagButton);
      menu.add(consoleButton);

      return menu;
    },

    getSyntaxMenu : function()
    {
      var menu = new qx.ui.menu.Menu;

      var htmlButton = new qx.ui.menu.Button("HTML");
      var xmlButton = new qx.ui.menu.Button("XML");
      var jsButton = new qx.ui.menu.Button("JavaScript");
      var cdialectButton = new qx.ui.menu.Button("C Dialect", null, null, this.getSyntaxCMenu());
      var perlButton = new qx.ui.menu.Button("Perl");
      var pythonButton = new qx.ui.menu.Button("Python");

      menu.add(htmlButton);
      menu.add(xmlButton);
      menu.add(jsButton);
      menu.add(cdialectButton);
      menu.add(perlButton);
      menu.add(pythonButton);

      return menu;
    },

    getSyntaxCMenu : function()
    {
      var menu = new qx.ui.menu.Menu;

      var cButton = new qx.ui.menu.Button("C");
      var csharpButton = new qx.ui.menu.Button("C Sharp");
      var objcButton = new qx.ui.menu.Button("Objective C");
      var cplusButton = new qx.ui.menu.Button("C Plus Plus");

      menu.add(cButton);
      menu.add(csharpButton);
      menu.add(objcButton);
      menu.add(cplusButton);

      return menu;
    },

    getFormatMenu : function()
    {
      var menu = new qx.ui.menu.Menu;

      var paragraphButton = new qx.ui.menu.Button("Paragraph", null, null, this.getParagraphMenu());
      var spacesButton = new qx.ui.menu.Button("Tabs to spaces");
      var tabsButton = new qx.ui.menu.Button("Spaces to tabs");
      var upperButton = new qx.ui.menu.Button("Uppercase");
      var lowerButton = new qx.ui.menu.Button("Lowercase");
      var capitalsButton = new qx.ui.menu.Button("Capitals");
      var ansiButton = new qx.ui.menu.Button("OEM to ANSI");
      var oemButton = new qx.ui.menu.Button("ANSI to OEM");

      menu.add(paragraphButton)
      menu.add(spacesButton);
      menu.add(tabsButton);
      menu.addSeparator();
      menu.add(upperButton);
      menu.add(lowerButton);
      menu.add(capitalsButton);
      menu.addSeparator();
      menu.add(ansiButton);
      menu.add(oemButton);

      return menu;
    },

    getParagraphMenu : function()
    {
      var menu = new qx.ui.menu.Menu;

      var leftButton = new qx.ui.menu.Button("Left aligned", "icon/16/actions/format-justify-left.png");
      var rightButton = new qx.ui.menu.Button("Right aligned", "icon/16/actions/format-justify-right.png");
      var centeredButton = new qx.ui.menu.Button("Centered", "icon/16/actions/format-justify-center.png");
      var justifyButton = new qx.ui.menu.Button("Justified", "icon/16/actions/format-justify-fill.png");

      menu.add(leftButton);
      menu.add(rightButton);
      menu.add(centeredButton);
      menu.add(justifyButton);

      return menu;
    },

    getHelpMenu : function()
    {
      var menu = new qx.ui.menu.Menu;

      var topicsButton = new qx.ui.menu.Button("Topics", "icon/16/apps/help-browser.png");
      var quickButton = new qx.ui.menu.Button("Quickstart");

      var onlineButton = new qx.ui.menu.Button("Online Forum");
      var infoButton = new qx.ui.menu.Button("Info...");

      menu.add(topicsButton);
      menu.add(quickButton);
      menu.addSeparator();
      menu.add(onlineButton);
      menu.addSeparator();
      menu.add(infoButton);

      return menu;
    }
  }
});
