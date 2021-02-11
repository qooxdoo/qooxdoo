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

/**
 *
 * @asset(qx/icon/Oxygen/22/emotes/*)
 */

qx.Class.define("qx.test.ui.tree.TreeFolder",
{
  extend : qx.test.ui.LayoutTestCase,

  members :
  {
    icon_closed : "qx/icon/Oxygen/22/emotes/face-plain.png",
    icon_opened : "qx/icon/Oxygen/22/emotes/face-smile.png",
    __tree : null,
    __root : null,
    __aa   : null,
    __ab   : null,
    __item : null,

    setUp : function()
    {
      // Build tree that looks like this:
      //
      // A ("root")
      // - AA ("item")
      // - BB
      var tree = this.__tree = new qx.ui.tree.Tree();
      var root = this.__root = new qx.ui.tree.TreeFolder("A");
      tree.setRoot(root);
      root.setOpen(true);
      var aa = this.__aa = new qx.ui.tree.TreeFolder("AA");
      var ab = this.__ab = new qx.ui.tree.TreeFolder("AB");
      root.add(aa, ab);

      // Reference to "aa" as "item"
      this.__item = this.__aa;

      // Render to set theme values
      this.getRoot().add(tree);
      this.flush();
    },

    //
    // Icon for when "closed" with all variations of "icon" and "iconClosed" property
    //

    testIconWhenClosed : function() {
      var item = this.__item;
      this.flush();

      this.__assertIcon(item, this.__themeValueIcon(item));
    },

    testIconWhenClosedWithIcon: function() {
      var item = this.__item;
      item.setIcon(this.icon_closed);
      this.flush();

      this.__assertIcon(item, this.icon_closed);
    },

    testIconWhenClosedWithIconOpened: function() {
      var item = this.__item;
      item.setIconOpened(this.icon_opened);
      this.flush();

      this.__assertIcon(item, this.__themeValueIcon(item));
    },

    testIconWhenClosedWithIconAndIconOpened: function() {
      var item = this.__item;
      item.setIcon(this.icon_closed);
      item.setIconOpened(this.icon_opened);
      this.flush();

      this.__assertIcon(item, this.icon_closed);
    },

    //
    // Icon when "opened" with all variations of "icon" and "iconClosed" property
    //

    testIconWhenOpened : function() {
      var item = this.__item;
      item.setOpen(true);
      this.flush();

      this.__assertIcon(item, this.__themeValueIconOpened(item));
    },

    testIconWhenOpenedWithIcon : function() {
      var item = this.__item;
      item.setOpen(true);
      item.setIcon(this.icon_closed);
      this.flush();

      // At first thought, you probably think this is correct...
      //
      // Expect theme value of iconOpened
      // this.__assertIcon(item, this.__themeValueIconOpened(item));

      // ... however, to ensure backwards-compatibility with the old behaviour
      //     before the property "openIcon" was introduced
      //
      // Expect user-defined value of property "icon"
      this.__assertIcon(item, this.icon_closed);
    },

    testIconWhenOpenedWithIconOpened: function() {
      var item = this.__item;
      item.setOpen(true);
      item.setIconOpened(this.icon_opened);
      this.flush();

      this.__assertIcon(item, this.icon_opened);
    },

    testIconWhenOpenedWithIconAndIconOpened: function() {
      var item = this.__item;
      item.setOpen(true);
      item.setIcon(this.icon_closed);
      item.setIconOpened(this.icon_opened);
      this.flush();

      this.__assertIcon(item, this.icon_opened);
    },

    //
    // Icon when "opened", then "closed" with all variations of "icon" and
    // "iconClosed" property
    //

    testIconWhenOpenedThenClosed: function() {
      var item = this.__item;
      item.setOpen(true);
      item.setOpen(false);
      this.flush();

      this.__assertIcon(item, this.__themeValueIcon(item));
    },

    testIconWhenOpenedThenClosedWithIcon: function() {
      var item = this.__item;
      item.setIcon(this.icon_closed);
      item.setOpen(true);
      item.setOpen(false);
      this.flush();

      this.__assertIcon(item, this.icon_closed);
    },

    testIconWhenOpenedThenClosedWithIconOpened: function() {
      var item = this.__item;
      item.setIconOpened(this.icon_closed);
      item.setOpen(true);
      item.setOpen(false);
      this.flush();

      this.__assertIcon(item, this.__themeValueIcon(item));
    },

    testIconWhenOpenedThenClosedWithIconAndIconOpened: function() {
      var item = this.__item;
      item.setIcon(this.icon_closed);
      item.setIconOpened(this.icon_opened);
      item.setOpen(true);
      item.setOpen(false);
      this.flush();

      this.__assertIcon(item, this.icon_closed);
    },

    //
    // Icon when "closed", then "opened" with all variations of "icon" and
    // "iconClosed" property
    //

    testIconWhenClosedThenOpened: function() {
      var item = this.__item;
      item.setOpen(false);
      item.setOpen(true);
      this.flush();

      this.__assertIcon(item, this.__themeValueIconOpened(item));
    },

    testIconWhenClosedThenOpenedWithIcon: function() {
      var item = this.__item;
      item.setIcon(this.icon_closed);
      item.setOpen(false);
      item.setOpen(true);
      this.flush();

      // At first thought, you probably think this is correct...
      //
      // Expect theme value of iconOpened
      // this.__assertIcon(item, this.__themeValueIconOpened(item));

      // ... however, to ensure backwards-compatibility with the old behaviour
      //     before the property "openIcon" was introduced
      //
      // Expect user-defined value of property "icon"
      this.__assertIcon(item, this.icon_closed);
    },

    testIconWhenClosedThenOpenedWithIconOpened: function() {
      var item = this.__item;
      item.setIconOpened(this.icon_opened);
      item.setOpen(false);
      item.setOpen(true);
      this.flush();

      this.__assertIcon(item, this.icon_opened);
    },

    testIconWhenClosedThenOpenedWithIconAndIconOpened: function() {
      var item = this.__item;
      item.setIcon(this.icon_closed);
      item.setIconOpened(this.icon_opened);
      item.setOpen(false);
      item.setOpen(true);
      this.flush();

      this.__assertIcon(item, this.icon_opened);
    },


    testRemoveAll: function(){
      var removed = this.__root.removeAll();

      this.assertEquals(2, removed.length);
      this.assertEquals(this.__aa, removed[0]);
      this.assertEquals(this.__ab, removed[1]);
    },

    //
    // Helper methods
    //

    __themeValueIcon : function(item) {
      return qx.util.PropertyUtil.getThemeValue(item, "icon");
    },

    __themeValueIconOpened : function(item) {
      return qx.util.PropertyUtil.getThemeValue(item, "iconOpened");
    },

    __assertIcon : function(item, expected) {
      this.assertEquals(expected, item.getChildControl("icon").getSource(),
        "Unexpected source for icon child control");
    },

    tearDown : function()
    {
      this.base(arguments);
      this.__tree.destroy();
      this.__root.destroy();
      this.__aa.destroy();
      this.__ab.destroy();
    }
  }
});
