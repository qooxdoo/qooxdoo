/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

qx.Class.define("qx.test.ui.selection.TabView", {
  extend: qx.test.ui.selection.AbstractSingleSelectonTest,

  members: {
    __radioButtons: null,

    setUp() {
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

    tearDown() {
      super.tearDown();
      this._widget.destroy();
      this._widget = null;
      this._selection = null;
      this._notInSelection = null;
      this.flush();
    },

    _getChildren() {
      if (this._widget != null) {
        return this._widget.getChildren();
      } else {
        return [];
      }
    },

    testAddAtIndex() {
      var index = parseInt(this._widget.getChildren().length / 2);
      var page = new qx.ui.tabview.Page("insertedPage_" + index);
      this._widget.addAt(page, index);
      this.assertEquals(
        page.getLabel(),
        this._widget.getChildren()[index].getLabel()
      );
    },

    testAddPage() {
      var page = new qx.ui.tabview.Page("insertedPage_Last");
      this._widget.add(page);
      this.assertEquals(
        page.getLabel(),
        this._widget
          .getChildren()
          [this._widget.getChildren().length - 1].getLabel()
      );
    },

    testAddAtLastIndex() {
      var index = this._widget.getChildren().length;
      var page = new qx.ui.tabview.Page("insertedPage_" + index);
      this._widget.addAt(page, index);
      this.assertEquals(
        page.getLabel(),
        this._widget.getChildren()[index].getLabel()
      );

      this.assertEquals(
        page.getLabel(),
        this._widget
          .getChildren()
          [this._widget.getChildren().length - 1].getLabel()
      );
    },

    testBeforeChangeSelection() {
      var pages = this._widget.getChildren();
      var selected = this._selection[0];
      var events = [];
      var veto = true;

      this._widget.addListener("beforeChangeSelection", e => {
        events.push([e.getData(), e.getOldData()]);
        if (veto) {
          e.preventDefault();
        }
      });

      pages[2].getButton().execute();
      this.assertArrayEquals([pages[2]], events[0][0]);
      this.assertArrayEquals([selected], events[0][1]);
      this.assertArrayEquals([selected], this._widget.getSelection());
      this.assertFalse(pages[2].getButton().getValue());
      this.assertTrue(selected.getButton().getValue());
      this.assertTrue(selected.isVisible());

      this._widget.setSelection([pages[3]]);
      this.assertArrayEquals([pages[3]], events[1][0]);
      this.assertArrayEquals([selected], this._widget.getSelection());

      veto = false;
      pages[2].getButton().execute();
      this.assertArrayEquals([pages[2]], this._widget.getSelection());
      this.assertTrue(pages[2].getButton().getValue());
    },

    _createTestElement(name) {
      return new qx.ui.tabview.Page(name);
    }
  }
});
