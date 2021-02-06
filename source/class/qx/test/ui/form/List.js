/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tristan Koch (tristankoch)

************************************************************************ */

qx.Class.define("qx.test.ui.form.List",
{
  extend : qx.test.ui.LayoutTestCase,

  members :
  {
    __list : null,

    setUp : function()
    {
      var list = this.__list = new qx.ui.form.List();
      var items = ["AAA", "BBB", "CCC"];
      items.forEach(function(item) {
        item = new qx.ui.form.ListItem(item);
        list.add(item);
      });

      this.getRoot().add(list);
      this.flush();
    },

    "test: find regular item": function() {
      var list = this.__list;
      var found = list.findItem("AAA");
      this.assertInstance(found, qx.ui.form.ListItem, "Item not found");
    },

    "test: find rich-text item": function() {
      var list = this.__list;
      var item = new qx.ui.form.ListItem("<b>Bold</b>").set({rich: true});
      list.add(item);
      this.flush();

      var found = list.findItem("Bold");
      this.assertInstance(found, qx.ui.form.ListItem, "Item not found");
    },

    "test: get container for list items" : function()
    {
      var container = this.__list._createListItemContainer();

      this.assertInstance(container, qx.ui.container.Composite, "Wrong return value of '_createListItemContainer'");
      container.dispose();
    },

    tearDown : function()
    {
      this.base(arguments);
      this.__list.destroy();
    }
  }
});
