/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

qx.Class.define("qx.test.ui.selection.TabView",
{
  extend : qx.test.ui.selection.AbstractSingleSelectonTest,

  members :
  {
    __radioButtons : null,

    setUp : function()
    {
      var length = 10;
      this._notInSelection = [];
      this._mode = "one";

      this._widget = new qx.ui.tabview.TabView();
      this.getRoot().add(this._widget);

      for (var i = 0; i < length; i++) {
        var item = new qx.ui.tabview.Page("Page" + i);
        this._widget.add(item);

        if (i == 5) {
          this._widget.setSelection([item]);
          this._selection = [item];
        } else {
          this._notInSelection.push(item);
        }
      }

      this.flush();
    },

    tearDown : function()
    {
      this.base(arguments);
      this._widget.destroy();
      this._widget = null;
      this._selection = null;
      this._notInSelection = null;
      this.flush();
    },

    _getChildren : function()
    {
      if (this._widget != null) {
        return this._widget.getChildren();
      } else {
        return [];
      }
    },

    testAddAtIndex : function()
    {
      var index = parseInt(this._widget.getChildren().length/2);
      var page = new qx.ui.tabview.Page("insertedPage_" + index);
      this._widget.addAt(page, index);
      this.assertEquals(page.getLabel(),this._widget.getChildren()[index].getLabel());
    },

    testAddPage : function()
    {
      var page = new qx.ui.tabview.Page("insertedPage_Last");
      this._widget.add(page);
      this.assertEquals(page.getLabel(),this._widget.getChildren()[this._widget.getChildren().length-1].getLabel());
    },

    testAddAtLastIndex : function()
    {
      var index = this._widget.getChildren().length;
      var page = new qx.ui.tabview.Page("insertedPage_" + index);
      this._widget.addAt(page, index);
      this.assertEquals(page.getLabel(),this._widget.getChildren()[index].getLabel());
      this.assertEquals(page.getLabel(),this._widget.getChildren()[this._widget.getChildren().length-1].getLabel());
    },

    _createTestElement : function(name) {
      return new qx.ui.tabview.Page(name);
    }
  }
});