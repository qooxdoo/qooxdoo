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

qx.Class.define("qx.test.ui.tree.TreeFolder", 
{
  extend : qx.test.ui.LayoutTestCase,
  
  members :
  {
    ICON_CLOSED : "qx/icon/Oxygen/16/places/folder.png",
    ICON_OPENED : "qx/icon/Oxygen/16/places/folder-open.png",
    __tree : null,
    __item : null,

    setUp : function() 
    {
      var tree = this.__tree = new qx.ui.tree.Tree();
      var item = this.__item = new qx.ui.tree.TreeFolder("A");
      tree.setRoot(item);

      var aa = new qx.ui.tree.TreeFolder("AA");
      var ab = new qx.ui.tree.TreeFolder("AB");
      item.add(aa, ab);
    },

    testIconClosed : function() {
      var item = this.__item;
      item.setIcon(this.ICON_CLOSED);

      this.assertIcon(item, this.ICON_CLOSED);
    },

    testIconClosedWhenToggled : function() {
      var item = this.__item;
      item.setIcon(this.ICON_CLOSED);

      item.setOpen(true);
      item.setOpen(false);

      this.assertIcon(item, this.ICON_CLOSED);
    },

    testIconOpened : function() {
      var item = this.__item;
      item.setIconOpened(this.ICON_OPENED);
      item.setOpen(true);

      this.assertIcon(item, this.ICON_OPENED);
    },

    testIconOpenedWhenToggled : function() {
      var item = this.__item;
      item.setIconOpened(this.ICON_OPENED);
      item.setOpen(true);

      item.setOpen(false);
      item.setOpen(true);

      this.assertIcon(item, this.ICON_OPENED);
    },

    // Opened icon should not be set to closed icon when icon property is set
    testSetIconNotInterfereWithCurrent : function() {
      var item = this.__item;
      item.setOpen(true);

      item.setIconOpened(this.ICON_OPENED);
      item.setIcon(this.ICON_CLOSED);

      this.assertIcon(item, this.ICON_OPENED);
    },

    // Closed icon should not be set to opened icon when iconOpened property is set
    testSetIconOpenedNotInterfereWithCurrent : function() {
      var item = this.__item;
      item.setOpen(false);

      item.setIcon(this.ICON_CLOSED);
      item.setIconOpened(this.ICON_OPENED);

      this.assertIcon(item, this.ICON_CLOSED);
    },

    assertIcon : function(item, expected) {
      this.assertEquals(expected, item.getChildControl('icon').getSource(),
        "Unexpected source for icon child control");
    },

    tearDown : function() 
    {
      this.__tree.dispose();
      this.__item.dispose();
    }
  }
});
