/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("demobrowser.demo.layout.HBoxLayout_7",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      this.test1();
      this.test2();
      this.test3();
    },

    test1 : function()
    {
      // interactive reversed
      var box = new qx.ui.layout.HBox();
      var container = (new qx.ui.container.Composite(box)).set({decorator: "black", backgroundColor: "yellow", height : 80 });

      var w1 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "blue", maxHeight: 50});
      var w2 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green", maxHeight: 50});
      var w3 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "grey", maxHeight: 50});

      container.add(w1, { align : "top" });
      container.add(w2, { align : "middle" });
      container.add(w3, { align : "bottom" });

      this.getRoot().add(container, {left:10, top:10});

      reversed = true;
      container.addListener("mousedown", function(e)
      {
        box.setReversed(reversed);
        reversed = !reversed;
      });
    },

    test2 : function()
    {
      // interactive margin 1
      var box = new qx.ui.layout.HBox();
      var container = (new qx.ui.container.Composite(box)).set({decorator: "black", backgroundColor: "yellow", height : 80 });

      var w1 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "blue", maxHeight: 50});
      var w2 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green", maxHeight: 50});
      var w3 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "grey", maxHeight: 50});

      container.add(w1, { align : "top" });
      container.add(w2, { align : "middle" });
      container.add(w3, { align : "bottom" });

      w1.setMarginLeft(10);
      w2.setMarginLeft(10);
      w3.setMarginLeft(10);

      this.getRoot().add(container, {left:10, top:100});

      before = true;
      container.addListener("mousedown", function(e)
      {
        w1.setMarginLeft(before ? 20 : 10);
        w2.setMarginLeft(before ? 0 : 10);

        before = !before;
      });
    },

    test3 : function()
    {
      // interactive margin 2
      var box = new qx.ui.layout.HBox();
      var container = (new qx.ui.container.Composite(box)).set({decorator: "black", backgroundColor: "yellow", height : 80 });

      var w1 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "blue", maxHeight: 50});
      var w2 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green", maxHeight: 50});
      var w3 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "grey", maxHeight: 50});

      container.add(w1, { align : "top" });
      container.add(w2, { align : "middle" });
      container.add(w3, { align : "bottom" });

      w1.setMarginLeft(10);
      w2.setMarginLeft(10);
      w3.setMarginLeft(10);

      this.getRoot().add(container, {left:10, top:190});

      large = true;
      container.addListener("mousedown", function(e)
      {
        w1.setMarginLeft(large ? 30 : 10);
        w2.setMarginLeft(large ? 30 : 10);
        w3.setMarginLeft(large ? 30 : 10);

        large = !large;
      });
    }
  }
});
