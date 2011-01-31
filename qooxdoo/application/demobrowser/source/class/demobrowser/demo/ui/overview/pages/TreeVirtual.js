/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tristan Koch (tristankoch)

************************************************************************ */

/**
 * Demonstrates qx.ui.treevirtual(...):
 *
 * TreeVirtual
 *
 */

qx.Class.define("demobrowser.demo.ui.overview.pages.TreeVirtual",
{
  extend: qx.ui.tabview.Page,

  include : demobrowser.demo.ui.overview.MControls,

  construct: function()
  {
    this.base(arguments);

    this.setLabel("TreeVirtual");
    this.setLayout(new qx.ui.layout.Canvas());

    this.__container = new qx.ui.container.Composite(new qx.ui.layout.Canvas());
    this.add(this.__container, {top: 40});

    this._initWidgets();
    this._initControls(this.__widgets, {});
  },

  members :
  {
    __widgets: null,

    __container: null,

    _initWidgets: function()
    {
      var widgets = this.__widgets = new qx.type.Array();

      var tree = new qx.ui.treevirtual.TreeVirtual("TreeVirtual");
      tree.setWidth(300);
      tree.setHeight(300);
      this.__setupTreeDataModel(tree);
      this.__container.add(tree);
    },

    __setupTreeDataModel: function(tree) {
      var dataModel = tree.getDataModel();

      var te2 = dataModel.addBranch(
        null, "Inbox", true, false
      );

      te = dataModel.addBranch(te2, "Spam", false);

      for (var i = 1; i < 3000; i++)
      {
        dataModel.addLeaf(te, "Spam Message #" + i);
      }

      dataModel.addBranch(te2, "Sent", true);
      dataModel.addBranch(te2, "Trash", true);
      dataModel.addBranch(te2, "Data", true);
      dataModel.addBranch(te2, "Edit", true);

      dataModel.setData();
    }
  }
});