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
  extend : qx.ui.tree.VirtualTreeFolder,

  properties :
  {
    leadIcon :
    {
      check : "String",
      apply: "_applyLeadIcon",
      event: "changeLeadIcon",
      nullable : true
    },

    checked :
    {
      check : "Boolean",
      apply: "_applyChecked",
      event: "changeChecked",
      nullable : true
    },
    
    size :
    {
      check : "String",
      apply: "_applySize",
      event: "changeSize",
      nullable : true
    },
    
    date :
    {
      check : "String",
      apply: "_applyDate",
      event: "changeDate",
      nullable : true
    },
    
    mode :
    {
      check : "String",
      apply: "_applyMode",
      event: "changeMode",
      nullable : true
    }
  },

  members :
  {
    _addWidgets : function()
    {
      var leadIcon = this.__leadIcon = new qx.ui.basic.Image();
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
      checkbox.setFocusable(false);
      this.addWidget(checkbox);

      // The label
      this.addLabel();

      // All else should be right justified
      this.addWidget(new qx.ui.core.Spacer(), {flex: 1});

      // Add a file size, date and mode
      var text = this.__size = new qx.ui.basic.Label();
      text.setWidth(50);
      this.addWidget(text);

      text = this.__date = new qx.ui.basic.Label();
      text.setWidth(150);
      this.addWidget(text);

      text = this.__mode = new qx.ui.basic.Label();
      text.setWidth(80);
      this.addWidget(text);
    },
    
    
    _applyLeadIcon : function(value, old) {
      this.__leadIcon.setSource(value);
    },

    
    _applyChecked : function(value, old) {
      this.__checkbox.setValue(value);
    },

    
    _applySize : function(value, old) {
      this.__size.setValue(value);
    },

    
    _applyDate : function(value, old) {
      this.__date.setValue(value);
    },

    
    _applyMode : function(value, old) {
      this.__mode.setValue(value);
    }
  }
});
