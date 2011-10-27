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
     * Martin Wittemann (martinwitttemann)

************************************************************************ */

/* ************************************************************************

#asset(qx/icon/${qx.icontheme}/16/actions/*)
#asset(qx/icon/${qx.icontheme}/22/actions/*)
#asset(qx/icon/${qx.icontheme}/32/actions/*)
#asset(qx/icon/${qx.icontheme}/48/actions/*)

************************************************************************ */

qx.Class.define("demobrowser.demo.widget.ToolBar",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      // create a container for the main layout and set the main layout
      var mainContainer = new qx.ui.container.Composite(new qx.ui.layout.VBox(20));
      mainContainer.setPadding(20);

      // add the scroll container to the root
      this.getRoot().add(mainContainer, { edge: 0 } );

      ///////////////////////////////////////////////////////////////
      // Toolbar stuff
      ///////////////////////////////////////////////////////////////

      // create the toolbar
      toolbar = new qx.ui.toolbar.ToolBar();
      toolbar.setSpacing(5);
      mainContainer.add(toolbar);

      // create and add Part 1 to the toolbar
      var part1 = new qx.ui.toolbar.Part();
      var newButton = new qx.ui.toolbar.Button("New", "icon/22/actions/document-new.png");
      var copyButton = new qx.ui.toolbar.Button("Copy", "icon/22/actions/edit-copy.png");
      var cutButton = new qx.ui.toolbar.Button("Cut", "icon/22/actions/edit-cut.png");
      var pasteButton = new qx.ui.toolbar.Button("Paste", "icon/22/actions/edit-paste.png");
      part1.add(newButton);
      part1.add(new qx.ui.toolbar.Separator());
      part1.add(copyButton);
      part1.add(cutButton);
      part1.add(pasteButton);
      toolbar.add(part1);

      // create and add Part 2 to the toolbar
      var part2 = new qx.ui.toolbar.Part();
      var checkBtn = new qx.ui.toolbar.CheckBox("Toggle", "icon/22/actions/format-text-underline.png");
      part2.add(checkBtn);
      toolbar.add(part2);

      // create and add Part 3 to the toolbar
      var part3 = new qx.ui.toolbar.Part();
      var radioButton1 = new qx.ui.toolbar.RadioButton("Left", "icon/22/actions/format-justify-left.png");
      var radioButton2 = new qx.ui.toolbar.RadioButton("Center", "icon/22/actions/format-justify-center.png");
      var radioButton3 = new qx.ui.toolbar.RadioButton("Right", "icon/22/actions/format-justify-right.png");
      part3.add(radioButton1);
      part3.add(radioButton2);
      part3.add(radioButton3);
      toolbar.add(part3);

      // Manager for part 3 (Radio example)
      var radioGroup = new qx.ui.form.RadioGroup(radioButton1, radioButton2, radioButton3);
      radioGroup.setAllowEmptySelection(true);

      toolbar.addSpacer();

      // add a widget which signals that something has been removed
      var overflow = new qx.ui.toolbar.MenuButton("More...");
      toolbar.add(overflow);
      toolbar.setOverflowIndicator(overflow);

      // create Help Button and add it to the toolbar
      var helpButton = new qx.ui.toolbar.Button("Help", "icon/22/actions/help-contents.png");
      toolbar.add(helpButton);

      var buttons = [ newButton, copyButton, cutButton, pasteButton, checkBtn, radioButton1, radioButton2, radioButton3, helpButton ];

      // set priorities for overflow handling
      toolbar.setRemovePriority(part1, 4);
      toolbar.setRemovePriority(part3, 3);
      toolbar.setRemovePriority(part2, 2);

      // create overflow menu
      var overflowMenu = new qx.ui.menu.Menu();
      overflow.setMenu(overflowMenu);
      var newButton = new qx.ui.menu.Button("New", "icon/16/actions/document-new.png");
      var sep1 = new qx.ui.menu.Separator();
      var copyButton = new qx.ui.menu.Button("Copy", "icon/16/actions/edit-copy.png");
      var cutButton = new qx.ui.menu.Button("Cut", "icon/16/actions/edit-cut.png");
      var pasteButton = new qx.ui.menu.Button("Paste", "icon/16/actions/edit-paste.png");
      overflowMenu.add(newButton);
      overflowMenu.add(sep1);
      overflowMenu.add(copyButton);
      overflowMenu.add(cutButton);
      overflowMenu.add(pasteButton);

      var sep2 = new qx.ui.menu.Separator();
      var radioButton1 = new qx.ui.menu.RadioButton("Left");
      var radioButton2 = new qx.ui.menu.RadioButton("Center");
      var radioButton3 = new qx.ui.menu.RadioButton("Right");
      radioButton1.setIcon("icon/16/actions/format-justify-left.png");
      radioButton2.setIcon("icon/16/actions/format-justify-center.png");
      radioButton3.setIcon("icon/16/actions/format-justify-right.png");
      overflowMenu.add(sep2);
      overflowMenu.add(radioButton1);
      overflowMenu.add(radioButton2);
      overflowMenu.add(radioButton3);

      // hide all menu items
      var menuItem = overflowMenu.getChildren();
      for (var i = 0; i < menuItem.length; i++) {
        menuItem[i].setVisibility("excluded");
      };

      var showHideHandler = function(item, visibility) {
        var items = [];
        if (item == part1) {
          items.push(newButton, sep1, copyButton, cutButton, pasteButton);
        } else if (item == part3) {
          items.push(sep2, radioButton1, radioButton2, radioButton3);
        }

        for (var i = 0; i < items.length; i++) {
          items[i].setVisibility(visibility)
        };
      }

      // handler for showind and hiding toobar items
      toolbar.addListener("showItem", function(e) {
        showHideHandler(e.getData(), "excluded");
      }, this);

      toolbar.addListener("hideItem", function(e) {
        showHideHandler(e.getData(), "visible");
      }, this);


      ///////////////////////////////////////////////////////////////
      // Control stuff
      ///////////////////////////////////////////////////////////////
      // Create and add the grid
      var controlGrid = new qx.ui.layout.Grid();
      controlGrid.setSpacing(10);
      var controlContainer = new qx.ui.container.Composite(controlGrid);
      mainContainer.add(controlContainer);


      //////////////////////// icon size stuff
      // create the buttons
      var size22Button = new qx.ui.form.RadioButton("22px");
      size22Button.setValue(true);
      var size32Button = new qx.ui.form.RadioButton("32px");
      var size48Button = new qx.ui.form.RadioButton("48px");

      // create the radio manager and add the buttons
      var sizeManager = new qx.ui.form.RadioGroup();
      sizeManager.add(size22Button, size32Button, size48Button);

      // add the buttons to the grid
      controlContainer.add(new qx.ui.basic.Label("Icon Size:"), {row:0, column:0});
      controlContainer.add(size22Button, {row:0, column:1});
      controlContainer.add(size32Button, {row:0, column:2});
      controlContainer.add(size48Button, {row:0, column:3});

      // register the handler
      sizeManager.addListener("changeSelection", function(e)
      {
        var value = e.getData()[0];
        var button, size, url;
        for (var i=0; i<buttons.length; i++)
        {
          button = buttons[i];
          url = button.getIcon();

          if (value == size22Button) {
            size = 22;
          } else if (value == size32Button) {
            size = 32;
          } else if (value == size48Button) {
            size = 48;
          }

          url = url.replace(/22|32|48/g, size);
          button.setIcon(url);
        }
      }, this);


      //////////////////////// Show stuff
      // create the buttons
      var showBothButton = new qx.ui.form.RadioButton("Label and Icon");
      showBothButton.setValue(true);
      var showIconButton = new qx.ui.form.RadioButton("Icon only");
      var showLabelButton = new qx.ui.form.RadioButton("Label only");

      // create the radio manager and add the buttons
      var showManager = new qx.ui.form.RadioGroup();
      showManager.add(showBothButton, showIconButton, showLabelButton);

      // add the buttons to the grid
      controlContainer.add(new qx.ui.basic.Label("Show:"), {row:1, column:0});
      controlContainer.add(showBothButton, {row:1, column:1});
      controlContainer.add(showIconButton, {row:1, column:2});
      controlContainer.add(showLabelButton, {row:1, column:3});

      // register the handler
      showManager.addListener("changeSelection", function(e)
      {
        if (e.getData()[0] == showBothButton) {
          toolbar.setShow("both");
        } else if (e.getData()[0] == showIconButton) {
          toolbar.setShow("icon");
        } else if (e.getData()[0] == showLabelButton) {
          toolbar.setShow("label");
        }
      }, this);

      //////////////////////// Overflow handling stuff
      // create the checkbox
      var enabledOverflowBox = new qx.ui.form.CheckBox("on");

      // add the buttons to the grid
      controlContainer.add(new qx.ui.basic.Label("Overflow handling:"), {row:2, column:0});
      controlContainer.add(enabledOverflowBox, {row:2, column:1});

      enabledOverflowBox.bind("value", toolbar, "overflowHandling");
      enabledOverflowBox.bind("value", showManager, "enabled", {converter:
        function(data) {return !data;}
      });
    }
  }
});
