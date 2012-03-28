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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#asset(qx/icon/${qx.icontheme}/16/actions/*)
#asset(qx/icon/${qx.icontheme}/16/apps/utilities-help.png)

************************************************************************ */
qx.Class.define("showcase.page.htmleditor.Content",
{
  extend : showcase.page.AbstractDesktopContent,


  construct : function(page) {
    this.base(arguments, page);
  },


  members : {
    __htmlArea : null,
    __editorComponent : null,


    _addWindowContent : function(win) {
      win.set({
        layout: new qx.ui.layout.Canvas(),
        width: 540,
        height: 400,
        caption: "Editor"
      });

      var demoContent = '<p>qooxdoo (pronounced [ku:ksdu:]) is a comprehensive and innovative Ajax application framework. Leveraging object-oriented JavaScript allows developers to build impressive cross-browser applications. No HTML, CSS nor DOM knowledge is needed. qooxdoo includes a platform-independent development tool chain, a state-of-the-art GUI toolkit and an advanced client-server communication layer. It is Open Source under an LGPL (GNU Lesser General Public License) / EPL (Eclipse Public License) dual <a href="http://qooxdoo.org/license" class="wikilink1" title="license" target="_blank">license</a>.</p>';

      this.__htmlArea = new qx.ui.embed.HtmlArea(demoContent, null, "blank.html");
      this.__htmlArea.set({
        width: 540,
        height: 370,
        margin: 5
      });

      var vb = new qx.ui.layout.VBox(0);
      var vbContainer = new qx.ui.container.Composite(vb).set({
        width: 540,
        height: 370,
        backgroundColor: "white"
      });

      var menuBar = this.__setupMenuBar();
      vbContainer.add(menuBar);

      var toolbar = this.__setupToolbar();

      // Add toolbar and HtmlArea widget
      vbContainer.add(toolbar);
      vbContainer.add(this.__htmlArea, {flex: 1});

      win.add(vbContainer, {edge: 0});
    },


    /**
     * Handler method for font color
     *
     * @param e {qx.event.type.Event} event instance
     */
    __fontColorHandler : function(e)
    {
      var result = window.prompt("Color (Hex): ", "#");
      this.setTextColor(result);
    },


    /**
     * Handler method for text background color
     *
     * @param e {qx.event.type.Event} event instance
     */
    __textBackgroundColorHandler : function(e)
    {
      var result = window.prompt("BgColor (Hex): ", "#");
      this.setTextBackgroundColor(result);
    },


    /**
     * Handler method for inserting images
     *
     * @param e {qx.event.type.Event} event instance
     */
    __insertImageHandler : function(e)
    {
      var attributes = { src    : qx.util.ResourceManager.getInstance().toUri("htmlarea/image/qooxdoo_logo.png"),
                         border : 0,
                         title  : "qooxdoo logo",
                         alt    : "qooxdoo logo" };

      this.insertImage(attributes);
    },

    /**
     * Handler method for inserting tables
     *
     * @param e {qx.event.type.Event} event instance
     */
    __insertTableHandler : function(e)
    {
      var table = "<table border='1'>" +
                    "<tbody>" +
                      "<tr>" +
                        "<td>First Row, First cell</td>" +
                        "<td>First Row, Second cell</td>" +
                      "</tr>" +
                      "<tr>" +
                        "<td>Second Row, First cell</td>" +
                        "<td>Second Row, Second cell</td>" +
                      "</tr>" +
                    "</tbody>" +
                  "</table>";
      this.insertHtml(table);
    },


    /**
     * Handler method for inserting links
     *
     * @param e {qx.event.type.Event} event instance
     */
    __insertLinkHandler : function(e)
    {
      var createLinkWindow = new qx.ui.window.Window("Insert Hyperlink");
      createLinkWindow.setLayout(new qx.ui.layout.VBox(20));
      createLinkWindow.set({ width: 400, showMaximize: false, showMinimize: false });

      var textField = new qx.ui.form.TextField("http://");
      createLinkWindow.add(textField);

      var hBoxLayout = new qx.ui.layout.HBox(10);
      hBoxLayout.setAlignX("right");
      var buttonContainer = new qx.ui.container.Composite(hBoxLayout);

      var okButton = new qx.ui.form.Button("OK");
      okButton.setWidth(60);
      okButton.addListener("execute", function(e) {
        this.insertHyperLink(textField.getValue());
        createLinkWindow.close();
      }, this);
      buttonContainer.add(okButton);

      var cancelButton = new qx.ui.form.Button("Cancel");
      cancelButton.setWidth(60);
      cancelButton.addListener("execute", function(e) {
        createLinkWindow.close();
      }, this);
      buttonContainer.add(cancelButton);

      createLinkWindow.add(buttonContainer);

      createLinkWindow.center();
      createLinkWindow.open();

      this.__editorComponent.saveRange();
    },


    /**
     * Handler method for inserting HTML code
     *
     * @param e {qx.event.type.Event} event instance
     */
    __insertHTMLHandler : function(e)
    {
      var result = window.prompt("HTML Code:", "");
      this.insertHtml(result);
    },


    /* ***************************************
     *
     *            Toolbar info
     *
     * ***************************************
     */

    /**
     * Creates the "font-family" toolbar dropdown
     *
     * @return {qx.ui.form.SelectBox} select box button
     */
    __fontFamilyToolbarEntry : function()
    {
      var button = new qx.ui.form.SelectBox;
      button.set({ toolTipText: "Change Font Family",
                   focusable: false,
                   keepFocus: true,
                   width: 120,
                   height: 16,
                   margin: [ 4, 0 ] });
      button.add(new qx.ui.form.ListItem(""));

      var entries = ["Tahoma", "Verdana", "Times New Roman", "Arial",
                     "Arial Black", "Courier New", "Courier", "Georgia",
                     "Impact", "Comic Sans MS", "Lucida Console" ];

      var entry;
      for (var i=0, j=entries.length;i<j;i++)
      {
        entry = new qx.ui.form.ListItem(entries[i]);
        entry.set({ focusable : false,
                    keepFocus : true,
                    font: qx.bom.Font.fromString("12px " + entries[i]) });
        button.add(entry);
      }

      button.addListener("changeSelection", function(e)
      {
        var value = e.getData()[0].getLabel();
        if (value != "") {
          this.setFontFamily(value);
          button.setSelection([ button.getChildren()[0] ]);
        }
      }, this.__htmlArea);

      return button;
    },


    /**
     * Creates the "font-size" toolbar dropdown
     *
     * @return {qx.ui.form.SelectBox} select box button
     */
    __fontSizeToolbarEntry : function()
    {
      var button = new qx.ui.form.SelectBox;
      button.set({ toolTipText: "Change Font Size",
                   focusable: false,
                   keepFocus: true,
                   width: 50,
                   height: 16,
                   margin: [ 4, 0 ] });
      button.add(new qx.ui.form.ListItem(""));

      var entry;
      for (var i=1;i<=7;i++)
      {
        entry = new qx.ui.form.ListItem(i+"");
        entry.set({ focusable : false,
                    keepFocus : true });
        button.add(entry);
      }

      button.addListener("changeSelection", function(e)
      {
        var value = e.getData()[0].getLabel();
        if (value != "") {
          this.setFontSize(value);
          button.setSelection([ button.getChildren()[0] ]);
        }
      }, this.__htmlArea);

      return button;
    },


    /**
     * Toolbar entries
     *
     * @return {Array} toolbar entries
     */
    __getToolbarEntries : function()
    {
      return [
        {
          bold:                { text: "Format Bold", image: "icon/16/actions/format-text-bold.png", action: this.__htmlArea.setBold },
          italic:              { text: "Format Italic", image: "icon/16/actions/format-text-italic.png", action: this.__htmlArea.setItalic },
          underline:           { text: "Format Underline", image: "icon/16/actions/format-text-underline.png", action: this.__htmlArea.setUnderline },
          strikethrough:       { text: "Format Strikethrough", image: "icon/16/actions/format-text-strikethrough.png", action: this.__htmlArea.setStrikeThrough },
          removeFormat:        { text: "Remove Format", image: "icon/16/actions/edit-clear.png", action: this.__htmlArea.removeFormat }
        },

        {
          alignLeft:           { text: "Align Left", image: "icon/16/actions/format-justify-left.png", action: this.__htmlArea.setJustifyLeft },
          alignCenter:         { text: "Align Center", image: "icon/16/actions/format-justify-center.png", action: this.__htmlArea.setJustifyCenter },
          alignRight:          { text: "Align Right", image: "icon/16/actions/format-justify-right.png", action: this.__htmlArea.setJustifyRight },
          alignJustify:        { text: "Align Justify", image: "icon/16/actions/format-justify-fill.png", action: this.__htmlArea.setJustifyFull }
        },

        {
          indent:              { text: "Indent More", image: "icon/16/actions/format-indent-more.png", action: this.__htmlArea.insertIndent },
          outdent:             { text: "Indent Less", image: "icon/16/actions/format-indent-less.png", action: this.__htmlArea.insertOutdent }
        },

        {
          ol:                  { text: "Insert Ordered List", image: "showcase/htmleditor/format-list-ordered.png", action: this.__htmlArea.insertOrderedList },
          ul:                  { text: "Inserted Unordered List", image: "showcase/htmleditor/format-list-unordered.png", action: this.__htmlArea.insertUnorderedList }
        },

        {
          undo:                { text: "Undo Last Change", image: "icon/16/actions/edit-undo.png", action: this.__htmlArea.undo },
          redo:                { text: "Redo Last Undo Step", image: "icon/16/actions/edit-redo.png", action: this.__htmlArea.redo }
        }
      ];
    },


    /**
     * Creates the toolbar entries
     *
     * @return {qx.ui.toolbarToolBar} toolbar widget
     */
    __setupToolbar : function()
    {
      var toolbar = new qx.ui.toolbar.ToolBar;

      // Put together toolbar entries
      var button;
      var toolbarEntries = this.__getToolbarEntries();
      for (var i=0, j=toolbarEntries.length; i<j; i++)
      {
        var part = new qx.ui.toolbar.Part;
        toolbar.add(part);

        for (var entry in toolbarEntries[i])
        {
          var infos = toolbarEntries[i][entry];

          if(infos.custom) {
            button = infos.custom.call(this);
          }
          else
          {
            button = new qx.ui.toolbar.Button(null, infos.image);
            button.set({ focusable : false,
                         keepFocus : true,
                         center : true,
                         toolTipText : infos.text ? infos.text : "" });
            button.addListener("execute", infos.action, this.__htmlArea);
          }
          part.add(button);
        }
      }

      return toolbar;
    },

    /**
     * @lint ignoreDeprecated(alert)
     */
    debugRadio : function(e) {
      alert("This command is not implemented!");
    },

    /**
     * @lint ignoreDeprecated(alert)
     */
    debugCommand : function(e) {
      alert("This command is not implemented!");
    },

    /**
     * @lint ignoreDeprecated(alert)
     */
    debugButton : function(e) {
      alert("This command is not implemented!");
    },

    /**
     * @lint ignoreDeprecated(alert)
     */
    debugCheckBox : function(e) {
      alert("This command is not implemented!");
    },


    createCommands : function()
    {
      this._newCommand = new qx.ui.core.Command("Ctrl+N");
      this._newCommand.addListener("execute", this.debugCommand);

      this._openCommand = new qx.ui.core.Command("Ctrl+O");
      this._openCommand.addListener("execute", this.debugCommand);

      this._saveCommand = new qx.ui.core.Command("Ctrl+S");
      this._saveCommand.addListener("execute", this.debugCommand);

      this._undoCommand = new qx.ui.core.Command("Ctrl+Z");
      this._undoCommand.addListener("execute", this.debugCommand);

      this._redoCommand = new qx.ui.core.Command("Ctrl+R");
      this._redoCommand.addListener("execute", this.debugCommand);

      this._cutCommand = new qx.ui.core.Command("Ctrl+X");
      this._cutCommand.addListener("execute", this.debugCommand);

      this._copyCommand = new qx.ui.core.Command("Ctrl+C");
      this._copyCommand.addListener("execute", this.debugCommand);

      this._pasteCommand = new qx.ui.core.Command("Ctrl+P");
      this._pasteCommand.addListener("execute", this.debugCommand);

      this._pasteCommand.setEnabled(false);
    },


    __setupMenuBar : function()
    {
      this.createCommands();

      var menubar = new qx.ui.menubar.MenuBar().set({
        decorator: new qx.ui.decoration.Single().set({
          backgroundRepeat : "scale",
          bottom: [1, "solid", "border-separator"]
        })
      });

      var fileMenu = new qx.ui.menubar.Button("File", null, this.getFileMenu());
      var editMenu = new qx.ui.menubar.Button("Edit", null, this.getEditMenu());
      var searchMenu = new qx.ui.menubar.Button("Search", null, this.getSearchMenu());
      var viewMenu = new qx.ui.menubar.Button("View", null, this.getViewMenu());
      var formatMenu = new qx.ui.menubar.Button("Format", null, this.getFormatMenu());
      var helpMenu = new qx.ui.menubar.Button("Help", null, this.getHelpMenu());

      menubar.add(fileMenu);
      menubar.add(editMenu);
      menubar.add(searchMenu);
      menubar.add(viewMenu);
      menubar.add(formatMenu);
      menubar.add(new qx.ui.core.Spacer(), {flex: 1});
      menubar.add(helpMenu);

      return menubar;
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

      closeButton.addListener("execute", this.debugButton);
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

      rulerButton.addListener("changeValue", this.debugCheckBox);
      numbersButton.addListener("changeValue", this.debugCheckBox);
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

      tabsCheckbox.setValue(true);
      statusCheckbox.setValue(true);
      macroCheckbox.setValue(true);

      tabsCheckbox.addListener("changeValue", this.debugCheckBox);
      statusCheckbox.addListener("changeValue", this.debugCheckBox);
      treeCheckbox.addListener("changeValue", this.debugCheckBox);
      macroCheckbox.addListener("changeValue", this.debugCheckBox);
      tagCheckbox.addListener("changeValue", this.debugCheckBox);
      consoleCheckbox.addListener("changeValue", this.debugCheckBox);

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

      langGroup.addListener("changeSelection", this.debugRadio);

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
    }
  }
});