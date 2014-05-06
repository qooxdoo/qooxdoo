/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christopher Zuendorf (czuendorf)

************************************************************************ */

qx.Class.define("qx.test.mobile.dialog.Menu",
{
  extend : qx.test.mobile.MobileTestCase,

  members :
  {
    testInit : function()
    {
      // SMOKE TEST for menu.
      var model = new qx.data.Array(["item1","item2","item3"]);
      var model2 = new qx.data.Array(["item4","item5","item6"]);

      var menu = new qx.ui.mobile.dialog.Menu(model);
      menu.setSelectedIndex(2);

      menu.setItems(model2);
      menu.setSelectedIndex(1);
    },


    testSetListHeight : function()
    {
      var model = new qx.data.Array(["item1","item2","item3"]);

      var menu = new qx.ui.mobile.dialog.Menu(model);

      var visibleItems = 2;

      menu.setVisibleListItems(visibleItems);
      menu.show();

      var expected = menu.getSelectionList().getListItemHeight() * visibleItems;

      var listHeight = qx.bom.element.Style.get(menu._getListScroller().getContentElement(),"height");

      listHeight = Math.floor(parseFloat(listHeight,10) * 100);
      expected = Math.floor(expected * 100);

      this.assertEquals(listHeight, expected);
    },


    testMaxListHeight : function() {
      var model = new qx.data.Array(["item1","item2","item3","item1","item2","item3",
                                    "item1","item2","item3","item1","item2","item3"]);

      var menu = new qx.ui.mobile.dialog.Menu(model);

      menu.setVisibleListItems(100000);
      menu.show();

      var parentHeight = qx.bom.element.Style.get(qx.ui.mobile.dialog.Popup.ROOT.getContentElement(),"height");

      var listHeight = qx.bom.element.Style.get(menu._getListScroller().getContentElement(),"height");
      this.assertEquals(listHeight,parseInt(parentHeight)*0.75+"px");
    }
  }

});
