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

#asset(qx/icon/Oxygen/22/actions/*)

************************************************************************ */

qx.Class.define("demobrowser.demo.widget.ToolBar_1",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var mainLayout = new qx.ui.layout.HBox();
      mainLayout.setSpacing(10);

      var container = new qx.ui.core.Widget();
      container.setPadding(20);
      container.setLayout(mainLayout);

      this.getRoot().add(container, 0, 30, 0);

      // create the toolbar
      toolbar = new qx.ui.toolbar.ToolBar();
      mainLayout.add(toolbar, {flex: 1});

      // Part 1
      var part1 = new qx.ui.toolbar.Part();
      part1.add(new qx.ui.toolbar.Button("New", "icon/22/actions/document-new.png"));
      part1.add(new qx.ui.toolbar.Separator());
      part1.add(new qx.ui.toolbar.Button("Copy", "icon/22/actions/edit-copy.png"));
      part1.add(new qx.ui.toolbar.Button("Cut", "icon/22/actions/edit-cut.png"));
      part1.add(new qx.ui.toolbar.Button("Paste", "icon/22/actions/edit-paste.png"));
      toolbar.add(part1);

      // Part 2
      var part2 = new qx.ui.toolbar.Part();
      part2.add(new qx.ui.toolbar.Button("Up", "icon/22/actions/go-up.png"));
      part2.add(new qx.ui.toolbar.Button("Down", "icon/22/actions/go-down.png"));
      toolbar.add(part2);

      // Part 3
      var part3 = new qx.ui.toolbar.Part();
      part3.add(new qx.ui.toolbar.CheckBox("Toggle", "icon/22/actions/format-text-underline.png"));
      toolbar.add(part3);

      // Part 4
      var part4 = new qx.ui.toolbar.Part();
      var radioButton1 = new qx.ui.toolbar.RadioButton("Left", "icon/22/actions/format-justify-left.png");
      var radioButton2 = new qx.ui.toolbar.RadioButton("Justify", "icon/22/actions/format-justify-fill.png");
      var radioButton3 = new qx.ui.toolbar.RadioButton("Right", "icon/22/actions/format-justify-right.png");
      part4.add(radioButton1);
      part4.add(radioButton2);
      part4.add(radioButton3);
      toolbar.add(part4);

      var manager = new qx.ui.core.RadioManager();
      manager.add(radioButton1);
      manager.add(radioButton2);
      manager.add(radioButton3);

    }
  }
});
