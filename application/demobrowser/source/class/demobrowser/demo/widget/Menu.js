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
#asset(qx/icon/${qx.icontheme}/16/apps/utilities-help.png)
#asset(qx/icon/${qx.icontheme}/22/apps/preferences-users.png)

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

      container.add(this.getMenuButton(), {left: 20, top: 20});
      container.add(this.getSplitButton(), {left: 150, top: 20});
      container.add(this.getMenuBar(), {left: 20, top: 100});
      container.add(this.getList(), {left: 20, top: 200});
    },


    debugRadio : function(e) {
      this.debug("Change selection: " + e.getData().getLabel());
    },

    debugCommand : function(e) {
      this.debug("Execute command: " + this.getShortcut());
    },

    debugButton : function(e) {
      this.debug("Execute button: " + this.getLabel());
    },

    debugCheckBox : function(e) {
      this.debug("Change checked: " + this.getLabel() + " = " + e.getData());
    },


    createCommands : function()
    {
      this._newCommand = new qx.event.Command("Ctrl+N");
      this._newCommand.addListener("execute", this.debugCommand);

      this._openCommand = new qx.event.Command("Ctrl+O");
      this._openCommand.addListener("execute", this.debugCommand);

      this._saveCommand = new qx.event.Command("Ctrl+S");
      this._saveCommand.addListener("execute", this.debugCommand);

      this._undoCommand = new qx.event.Command("Ctrl+Z");
      this._undoCommand.addListener("execute", this.debugCommand);

      this._redoCommand = new qx.event.Command("Ctrl+R");
      this._redoCommand.addListener("execute", this.debugCommand);

      this._cutCommand = new qx.event.Command("Ctrl+X");
      this._cutCommand.addListener("execute", this.debugCommand);

      this._copyCommand = new qx.event.Command("Ctrl+C");
      this._copyCommand.addListener("execute", this.debugCommand);

      this._pasteCommand = new qx.event.Command("Ctrl+P");
      this._pasteCommand.addListener("execute", this.debugCommand);

      this._pasteCommand.setEnabled(false);
    },


    getMenuButton : function()
    {
      // create sub menus

      var optionMenu = new qx.ui.menu.Menu;

      optionMenu.add(new qx.ui.menu.RadioButton("Option 1"));
      optionMenu.add(new qx.ui.menu.RadioButton("Option 2"));
      optionMenu.add(new qx.ui.menu.RadioButton("Option 3"));

      var actionMenu = new qx.ui.menu.Menu;

      actionMenu.add(new qx.ui.menu.RadioButton("Action 1"));
      actionMenu.add(new qx.ui.menu.RadioButton("Action 2"));
      actionMenu.add(new qx.ui.menu.RadioButton("Action 3"));


      // create radio groups
      var groupOptions = new qx.ui.form.RadioGroup;
      groupOptions.add.apply(groupOptions, optionMenu.getChildren());
      groupOptions.addListener("changeSelected", this.debugRadio);

      var groupActions = new qx.ui.form.RadioGroup;
      groupActions.add.apply(groupActions, actionMenu.getChildren());
      groupActions.addListener("changeSelected", this.debugRadio);


      // create main menu and buttons
      var menu = new qx.ui.menu.Menu();

      var undoButton = new qx.ui.menu.Button("Undo", "icon/16/actions/edit-undo.png", this._undoCommand);
      var redoButton = new qx.ui.menu.Button("Redo", "icon/16/actions/edit-redo.png", this._redoCommand);

      var cutButton = new qx.ui.menu.Button("Cut", "icon/16/actions/edit-cut.png", this._cutCommand);
      var copyButton = new qx.ui.menu.Button("Copy", "icon/16/actions/edit-copy.png", this._copyCommand);
      var pasteButton = new qx.ui.menu.Button("Paste", "icon/16/actions/edit-paste.png", this._pasteCommand);

      var searchButton = new qx.ui.menu.Button("Options", "icon/16/actions/system-search.png", null, optionMenu);
      var actionsButton = new qx.ui.menu.Button("Actions", "icon/16/actions/contact-new.png", null, actionMenu);

      var printButton = new qx.ui.menu.Button("Print", "icon/16/actions/document-print.png");

      // add execute listeners
      undoButton.addListener("execute", this.debugButton);
      redoButton.addListener("execute", this.debugButton);
      cutButton.addListener("execute", this.debugButton);
      copyButton.addListener("execute", this.debugButton);
      pasteButton.addListener("execute", this.debugButton);
      searchButton.addListener("execute", this.debugButton);
      actionsButton.addListener("execute", this.debugButton);
      printButton.addListener("execute", this.debugButton);

      // add buttons to menu
      menu.add(undoButton);
      menu.add(redoButton);
      menu.addSeparator();
      menu.add(cutButton);
      menu.add(copyButton);
      menu.add(pasteButton);
      menu.addSeparator();
      menu.add(searchButton);
      menu.add(actionsButton);
      menu.addSeparator();
      menu.add(printButton);

      // Create opener button
      var button = new qx.ui.form.MenuButton("Menu Button", "icon/22/apps/preferences-users.png", menu);
      return button;
    },



    getSplitButton : function()
    {
      var menu = new qx.ui.menu.Menu;

      var site1 = new qx.ui.menu.Button("Website 1");
      var site2 = new qx.ui.menu.Button("Website 2");
      var site3 = new qx.ui.menu.Button("Website 3");

      menu.setMinWidth(120);

      site1.addListener("execute", this.debugButton);
      site2.addListener("execute", this.debugButton);
      site3.addListener("execute", this.debugButton);

      menu.add(site1);
      menu.add(site2);
      menu.add(site3);

      // Create opener button
      var button = new qx.ui.form.SplitButton("Split Button", "icon/22/apps/preferences-users.png", menu);
      button.addListener("execute", this.debugButton);
      return button;
    },


    getMenuBar : function()
    {
      var frame = new qx.ui.container.Composite(new qx.ui.layout.Grow);
      frame.setDecorator("main");

      var toolbar = new qx.ui.toolbar.ToolBar;
      toolbar.setWidth(600);
      frame.add(toolbar);

      var basicPart = new qx.ui.toolbar.Part;
      var menuPart = new qx.ui.toolbar.Part;
      var helpPart = new qx.ui.toolbar.Part;

      toolbar.add(basicPart);
      toolbar.add(menuPart);
      toolbar.addSpacer();
      toolbar.add(helpPart);

      var backButton = new qx.ui.toolbar.SplitButton("Back", "icon/16/actions/go-previous.png", this.getBackMenu());
      var forwardButton = new qx.ui.toolbar.SplitButton("Next", "icon/16/actions/go-next.png", this.getForwardMenu());

      var newButton = new qx.ui.toolbar.Button("New", "icon/16/actions/document-new.png", this._newCommand);
      var openButton = new qx.ui.toolbar.Button("Open", "icon/16/actions/document-open.png", this._openCommand);
      var saveButton = new qx.ui.toolbar.Button("Save", "icon/16/actions/document-save.png", this._saveCommand);

      backButton.addListener("execute", this.debugButton);
      forwardButton.addListener("execute", this.debugButton);
      newButton.addListener("execute", this.debugButton);
      openButton.addListener("execute", this.debugButton);
      saveButton.addListener("execute", this.debugButton);

      basicPart.add(backButton);
      basicPart.add(forwardButton);
      basicPart.addSeparator();
      basicPart.add(newButton);
      basicPart.add(openButton);
      basicPart.add(saveButton);

      basicPart.setShow("icon");


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


      var helpMenu = new qx.ui.toolbar.MenuButton("Help");
      helpMenu.setMenu(this.getHelpMenu());
      helpPart.add(helpMenu);

      return frame;
    },

    getBackMenu : function()
    {
      var menu = new qx.ui.menu.Menu;

      var button1 = new qx.ui.menu.Button("Line 313");
      var button2 = new qx.ui.menu.Button("Line 1039");
      var button3 = new qx.ui.menu.Button("Line 12");
      var button4 = new qx.ui.menu.Button("Line 26");

      button1.addListener("execute", this.debugButton);
      button2.addListener("execute", this.debugButton);
      button3.addListener("execute", this.debugButton);
      button4.addListener("execute", this.debugButton);

      menu.add(button1);
      menu.add(button2);
      menu.add(button3);
      menu.add(button4);

      return menu;
    },

    getForwardMenu : function()
    {
      var menu = new qx.ui.menu.Menu;

      var button1 = new qx.ui.menu.Button("Line 431");
      var button2 = new qx.ui.menu.Button("Line 30");

      button1.addListener("execute", this.debugButton);
      button2.addListener("execute", this.debugButton);

      menu.add(button1);
      menu.add(button2);

      return menu;
    },

    getFileMenu : function()
    {
      var menu = new qx.ui.menu.Menu;

      var newButton = new qx.ui.menu.Button("New", "icon/16/actions/document-new.png", this._newCommand);
      var openButton = new qx.ui.menu.Button("Open", "icon/16/actions/document-open.png", this._openCommand);
      var closeButton = new qx.ui.menu.Button("Close");
      var saveButton = new qx.ui.menu.Button("Save", "icon/16/actions/document-save.png", this._saveCommand);
      var saveAsButton = new qx.ui.menu.Button("Save as...", "icon/16/actions/document-save-as.png");
      var printButton = new qx.ui.menu.Button("Print", "icon/16/actions/document-print.png");
      var exitButton = new qx.ui.menu.Button("Exit", "icon/16/actions/application-exit.png");

      newButton.addListener("execute", this.debugButton);
      openButton.addListener("execute", this.debugButton);
      closeButton.addListener("execute", this.debugButton);
      saveButton.addListener("execute", this.debugButton);
      saveAsButton.addListener("execute", this.debugButton);
      printButton.addListener("execute", this.debugButton);
      exitButton.addListener("execute", this.debugButton);

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

      undoButton.addListener("execute", this.debugButton);
      redoButton.addListener("execute", this.debugButton);
      cutButton.addListener("execute", this.debugButton);
      copyButton.addListener("execute", this.debugButton);
      pasteButton.addListener("execute", this.debugButton);

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

      previousButton.setEnabled(false);

      searchButton.addListener("execute", this.debugButton);
      nextButton.addListener("execute", this.debugButton);
      previousButton.addListener("execute", this.debugButton);
      replaceButton.addListener("execute", this.debugButton);
      searchFilesButton.addListener("execute", this.debugButton);
      replaceFilesButton.addListener("execute", this.debugButton);

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
      var rulerButton = new qx.ui.menu.CheckBox("Show ruler");
      var numbersButton = new qx.ui.menu.CheckBox("Show line numbers");
      var asciiButton = new qx.ui.menu.Button("ASCII table");

      rulerButton.addListener("changeChecked", this.debugCheckBox);
      numbersButton.addListener("changeChecked", this.debugCheckBox);
      asciiButton.addListener("execute", this.debugButton);

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

      var tabsCheckbox = new qx.ui.menu.CheckBox("Show tabs");
      var statusCheckbox = new qx.ui.menu.CheckBox("Show status bar");

      var treeCheckbox = new qx.ui.menu.CheckBox("Show tree");
      var macroCheckbox = new qx.ui.menu.CheckBox("Show macros");
      var tagCheckbox = new qx.ui.menu.CheckBox("Show tags");
      var consoleCheckbox = new qx.ui.menu.CheckBox("Show console");

      tabsCheckbox.setChecked(true);
      statusCheckbox.setChecked(true);
      macroCheckbox.setChecked(true);

      tabsCheckbox.addListener("changeChecked", this.debugCheckBox);
      statusCheckbox.addListener("changeChecked", this.debugCheckBox);
      treeCheckbox.addListener("changeChecked", this.debugCheckBox);
      macroCheckbox.addListener("changeChecked", this.debugCheckBox);
      tagCheckbox.addListener("changeChecked", this.debugCheckBox);
      consoleCheckbox.addListener("changeChecked", this.debugCheckBox);

      menu.add(statusCheckbox);
      menu.add(tabsCheckbox);
      menu.addSeparator();
      menu.add(treeCheckbox);
      menu.add(macroCheckbox);
      menu.add(tagCheckbox);
      menu.add(consoleCheckbox);

      return menu;
    },

    getSyntaxMenu : function()
    {
      var menu = new qx.ui.menu.Menu;

      var htmlButton = new qx.ui.menu.RadioButton("HTML");
      var xmlButton = new qx.ui.menu.RadioButton("XML");
      var jsButton = new qx.ui.menu.RadioButton("JavaScript");
      var cdialectButton = new qx.ui.menu.Button("C Dialect", null, null, this.getSyntaxCMenu());
      var perlButton = new qx.ui.menu.RadioButton("Perl");
      var pythonButton = new qx.ui.menu.RadioButton("Python");

      menu.add(htmlButton);
      menu.add(xmlButton);
      menu.add(jsButton);
      menu.add(cdialectButton);
      menu.add(perlButton);
      menu.add(pythonButton);

      // Configure and fill radio group
      var langGroup = new qx.ui.form.RadioGroup;
      langGroup.add(htmlButton, xmlButton, jsButton, perlButton, pythonButton);
      langGroup.add.apply(langGroup, cdialectButton.getMenu().getChildren());

      langGroup.addListener("changeSelected", this.debugRadio);

      return menu;
    },

    getSyntaxCMenu : function()
    {
      var menu = new qx.ui.menu.Menu;

      var cButton = new qx.ui.menu.RadioButton("C");
      var csharpButton = new qx.ui.menu.RadioButton("C Sharp");
      var objcButton = new qx.ui.menu.RadioButton("Objective C");
      var cplusButton = new qx.ui.menu.RadioButton("C Plus Plus");

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

      spacesButton.addListener("execute", this.debugButton);
      tabsButton.addListener("execute", this.debugButton);
      upperButton.addListener("execute", this.debugButton);
      lowerButton.addListener("execute", this.debugButton);
      capitalsButton.addListener("execute", this.debugButton);
      ansiButton.addListener("execute", this.debugButton);
      oemButton.addListener("execute", this.debugButton);

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

      leftButton.addListener("execute", this.debugButton);
      rightButton.addListener("execute", this.debugButton);
      centeredButton.addListener("execute", this.debugButton);
      justifyButton.addListener("execute", this.debugButton);

      menu.add(leftButton);
      menu.add(rightButton);
      menu.add(centeredButton);
      menu.add(justifyButton);

      return menu;
    },

    getHelpMenu : function()
    {
      var menu = new qx.ui.menu.Menu;

      var topicsButton = new qx.ui.menu.Button("Topics", "icon/16/apps/utilities-help.png");
      var quickButton = new qx.ui.menu.Button("Quickstart");
      var onlineButton = new qx.ui.menu.Button("Online Forum");
      var infoButton = new qx.ui.menu.Button("Info...");

      topicsButton.addListener("execute", this.debugButton);
      quickButton.addListener("execute", this.debugButton);
      onlineButton.addListener("execute", this.debugButton);
      infoButton.addListener("execute", this.debugButton);

      menu.add(topicsButton);
      menu.add(quickButton);
      menu.addSeparator();
      menu.add(onlineButton);
      menu.addSeparator();
      menu.add(infoButton);

      return menu;
    },

    getList : function()
    {
      var list = new qx.ui.form.List;
      list.setContextMenu(this.getContextMenu());

      for (var i=0; i<20; i++) {
        list.add(new qx.ui.form.ListItem("Item " + i));
      }

      return list;
    },

    getContextMenu : function()
    {
      var menu = new qx.ui.menu.Menu;

      var cutButton = new qx.ui.menu.Button("Cut", "icon/16/actions/edit-cut.png", this._cutCommand);
      var copyButton = new qx.ui.menu.Button("Copy", "icon/16/actions/edit-copy.png", this._copyCommand);
      var pasteButton = new qx.ui.menu.Button("Paste", "icon/16/actions/edit-paste.png", this._pasteCommand);

      cutButton.addListener("execute", this.debugButton);
      copyButton.addListener("execute", this.debugButton);
      pasteButton.addListener("execute", this.debugButton);

      menu.add(cutButton);
      menu.add(copyButton);
      menu.add(pasteButton);

      return menu;
    }
  }
});
