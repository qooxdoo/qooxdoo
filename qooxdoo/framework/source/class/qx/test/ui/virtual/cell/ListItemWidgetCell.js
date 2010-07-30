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
   * Christian Hagendorn (chris_schmidt)

************************************************************************ */

/* ************************************************************************

#asset(qx/icon/Tango/22/emotes/face-angel.png)

************************************************************************ */

qx.Class.define("qx.test.ui.virtual.cell.ListItemWidgetCell",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    __cell : null,

    setUp : function() {
      this.__cell = new qx.ui.virtual.cell.ListItemWidgetCell();
    },

    tearDown : function() {
      this.__cell.dispose();
      this.__cell = null;
    },

    testCreateWidget : function()
    {
      var item = this.__cell._createWidget();
      this.assertInterface(item, qx.ui.form.ListItem);
    },

    testEvent : function()
    {
      var that = this;
      this.assertEventFired(this.__cell, "created", function() {
        that.__cell._createWidget();
      }, function(e) {
        that.assertInterface(e.getData(), qx.ui.form.ListItem);
      });
    },

    testUpdateData : function()
    {
      var item = new qx.ui.form.ListItem();
      var data = {
        label: "label 1",
        icon: "qx/icon/22/emotes/face-angel.png"
      };

      this.__cell.updateData(item, data)
      this.assertEquals(data.label, item.getLabel());
      this.assertEquals(data.icon, item.getIcon());
    },

    testUpdateEmptyData : function()
    {
      var item = new qx.ui.form.ListItem();

      this.__cell.updateData(item)
      this.assertNull(item.getLabel());
      this.assertNull(item.getIcon());
    }
  }
});
