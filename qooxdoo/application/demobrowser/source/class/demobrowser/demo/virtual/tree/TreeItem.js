/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

qx.Class.define("demobrowser.demo.virtual.tree.TreeItem",
{
  extend : qx.ui.tree.VirtualTreeItem,

  properties :
  {
    leadIcon :
    {
      check : "String",
      event: "changeLeadIcon",
      nullable : true
    },

    checked :
    {
      check : "Boolean",
      event: "changeChecked",
      nullable : true
    },

    size :
    {
      check : "String",
      event: "changeSize",
      nullable : true
    },

    date :
    {
      check : "String",
      event: "changeDate",
      nullable : true
    },

    mode :
    {
      check : "String",
      event: "changeMode",
      nullable : true
    }
  },

  members :
  {
    __leadIcon : null,
    __checkbox : null,
    __size : null,
    __date : null,
    __mode : null,

    _addWidgets : function()
    {
      var leadIcon = this.__leadIcon = new qx.ui.basic.Image();
      this.bind("leadIcon", leadIcon, "source");
      leadIcon.setWidth(16);
      this.addWidget(leadIcon);

      // Here's our indentation and tree-lines
      this.addSpacer();
      this.addOpenButton();

      // The standard tree icon follows
      this.addIcon();
      this.setIcon("icon/16/places/user-desktop.png");

      // A checkbox comes right after the tree icon
      var checkbox = this.__checkbox = new qx.ui.form.CheckBox();
      this.bind("checked", checkbox, "value");
      checkbox.bind("value", this, "checked");
      checkbox.setFocusable(false);
      checkbox.setTriState(true);
      checkbox.setMarginRight(4);
      this.addWidget(checkbox);

      // The label
      this.addLabel();

      // All else should be right justified
      this.addWidget(new qx.ui.core.Spacer(), {flex: 1});

      // Add a file size, date and mode
      var text = this.__size = new qx.ui.basic.Label();
      this.bind("size", text, "value");
      text.setWidth(50);
      this.addWidget(text);

      text = this.__date = new qx.ui.basic.Label();
      this.bind("date", text, "value");
      text.setWidth(150);
      this.addWidget(text);

      text = this.__mode = new qx.ui.basic.Label();
      this.bind("mode", text, "value");
      text.setWidth(80);
      this.addWidget(text);
    }
  }
});
