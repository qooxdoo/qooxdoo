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
     * Martin Wittemann (martinwittemann)

************************************************************************ */
qx.Class.define("qx.test.ui.core.Placement",
{
  extend : qx.test.ui.LayoutTestCase,

  members :
  {
    __nogo : null,

    setUp : function() {
      this.__nogo = new qx.ui.core.Widget().set({
        backgroundColor: "red",
        width: 100,
        height: 300
      });
      this.getRoot().add(this.__nogo, {left: 150});

      // set the always visible element
      qx.ui.core.MPlacement.setVisibleElement(this.__nogo);
    },

    tearDown : function() {
      this.base(arguments);
      qx.ui.core.MPlacement.setVisibleElement(null);
      this.__nogo.destroy();
    },

    __testAlwaysVisibleElement : function(w)
    {
      // force an addition to the dom!
      w.show();
      w.hide();
       // modify the placed widget
       w.setWidth(100);
       w.setVisibility("visible");
       // render the widgets
       this.flush();

       // move and flush
       w.moveTo(100, 0);
       this.flush();

       // the right position of the widget should be left of the nogo
       var bounds = w.getBounds();
       var right = bounds.left + bounds.width;
       this.assertEquals(150, right);
       this.assertEquals(50, bounds.left);
    },


    testVisibleWithPopoup : function() {
      var w = new qx.ui.popup.Popup();
      this.__testAlwaysVisibleElement(w);
      w.destroy();
    },

    testVisibleWithMenu : function() {
      var w = new qx.ui.menu.Menu();
      this.__testAlwaysVisibleElement(w);
      w.destroy();
    },


    __testAlwaysVisibleElementTooBig : function(w)
    {
       // force an addition to the dom!
       w.show();
       w.hide();
       // modify the placed widget
       w.setWidth(200);
       w.setVisibility("visible");
       // render the widgets
       this.flush();

       // move and flush
       w.moveTo(100, 0);
       this.flush();

       // The widget should be moved to the left border of the screen and still
       // overlap the visible item
       var bounds = w.getBounds();
       var right = bounds.left + bounds.width;
       this.assertEquals(200, right);
       this.assertEquals(0, bounds.left);
    },


    testVisibleWithPopoupTooBig : function() {
      var w = new qx.ui.popup.Popup();
      this.__testAlwaysVisibleElementTooBig(w);
      w.destroy();
    },

    testVisibleWithMenuTooBig : function() {
      var w = new qx.ui.menu.Menu();
      this.__testAlwaysVisibleElementTooBig(w);
      w.destroy();
    },


    __testAlwaysVisibleElementAbove : function(w)
    {
       // force an addition to the dom!
       w.show();
       w.hide();
       this.__nogo.setLayoutProperties({top: 100});

       // modify the placed widget
       w.setWidth(100);
       w.setVisibility("visible");
       // render the widgets
       this.flush();

       // move and flush
       w.moveTo(100, 0);
       this.flush();

       // Positions should be as set
       var bounds = w.getBounds();
       var right = bounds.left + bounds.width;
       this.assertEquals(200, right);
       this.assertEquals(100, bounds.left);
    },


    testVisibleWithPopoupAbove : function() {
      var w = new qx.ui.popup.Popup();
      this.__testAlwaysVisibleElementAbove(w);
      w.destroy();
    },

    testVisibleWithMenuAbove : function() {
      var w = new qx.ui.menu.Menu();
      this.__testAlwaysVisibleElementAbove(w);
      w.destroy();
    },


    __testAlwaysVisibleElementBelow : function(w)
    {
       // force an addition to the dom!
       w.show();
       w.hide();
       // modify the placed widget
       w.setWidth(100);
       w.setVisibility("visible");
       // render the widgets
       this.flush();

       // move and flush
       w.moveTo(100, 400);
       this.flush();

       // Positions should be as set
       var bounds = w.getBounds();
       var right = bounds.left + bounds.width;
       this.assertEquals(200, right);
       this.assertEquals(100, bounds.left);
    },


    testVisibleWithPopoupBelow : function() {
      var w = new qx.ui.popup.Popup();
      this.__testAlwaysVisibleElementBelow(w);
      w.destroy();
    },

    testVisibleWithMenuBelow : function() {
      var w = new qx.ui.menu.Menu();
      this.__testAlwaysVisibleElementBelow(w);
      w.destroy();
    }
  }
});
