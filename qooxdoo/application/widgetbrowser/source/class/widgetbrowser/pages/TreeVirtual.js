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

qx.Class.define("widgetbrowser.pages.TreeVirtual",
{
  extend: widgetbrowser.pages.AbstractPage,

  construct: function()
  {
    this.base(arguments);

    this.initWidgets();
  },

  members :
  {

    initWidgets: function()
    {
      var widgets = this._widgets;

      var tree = new qx.ui.treevirtual.TreeVirtual("TreeVirtual");
      widgets.push(tree);
      tree.setWidth(300);
      tree.setHeight(300);
      this.__setupTreeDataModel(tree);
      this.add(tree);
    },

    __setupTreeDataModel: function(tree) {
      var dataModel = tree.getDataModel();

      var te2 = dataModel.addBranch(
        null, "Inbox", true, false
      );

      var te = dataModel.addBranch(te2, "Spam", false);

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