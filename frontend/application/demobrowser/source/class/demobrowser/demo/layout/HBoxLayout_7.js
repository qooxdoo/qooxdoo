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
  extend : demobrowser.Demo,

  members :
  {
    main: function()
    {
      this.base(arguments);
      qx.theme.manager.Meta.getInstance().setTheme(qx.theme.Classic);

      doc = new qx.ui.root.Application(document);

      this.test1(doc);
      this.test2(doc);
      this.test3(doc);
    },

    test1 : function(doc)
    {
      // interactive reversed
      var box = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "yellow", height : 80 });
      var layout = new qx.ui.layout.HBox();

      var w1 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "blue", maxHeight: 50});
      var w2 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green", maxHeight: 50});
      var w3 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "grey", maxHeight: 50});

      layout.add(w1, { align : "top" });
      layout.add(w2, { align : "middle" });
      layout.add(w3, { align : "bottom" });

      box.setLayout(layout);
      doc.add(box, 10, 10);

      reversed = true;
      box.addListener("mousedown", function(e)
      {
        layout.setReversed(reversed);
        reversed = !reversed;
      });
    },

    test2 : function(doc)
    {
      // interactive margin 1
      var box = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "yellow", height : 80 });
      var layout = new qx.ui.layout.HBox();

      var w1 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "blue", maxHeight: 50});
      var w2 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green", maxHeight: 50});
      var w3 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "grey", maxHeight: 50});

      layout.add(w1, { align : "top", marginLeft : 10 });
      layout.add(w2, { align : "middle", marginLeft : 10 });
      layout.add(w3, { align : "bottom", marginLeft : 10 });

      box.setLayout(layout);
      doc.add(box, 10, 100);

      before = true;
      box.addListener("mousedown", function(e)
      {
        layout.addLayoutProperty(w1, "marginLeft", before ? 20 : 10);
        layout.addLayoutProperty(w2, "marginLeft", before ? 0 : 10);

        before = !before;
      });
    },

    test3 : function(doc)
    {
      // interactive margin 2
      var box = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "yellow", height : 80 });
      var layout = new qx.ui.layout.HBox();

      var w1 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "blue", maxHeight: 50});
      var w2 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green", maxHeight: 50});
      var w3 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "grey", maxHeight: 50});

      layout.add(w1, { align : "top", marginLeft : 10 });
      layout.add(w2, { align : "middle", marginLeft : 10 });
      layout.add(w3, { align : "bottom", marginLeft : 10 });

      box.setLayout(layout);
      doc.add(box, 10, 190);

      large = true;
      box.addListener("mousedown", function(e)
      {
        layout.addLayoutProperty(w1, "marginLeft", large ? 30 : 10);
        layout.addLayoutProperty(w2, "marginLeft", large ? 30 : 10);
        layout.addLayoutProperty(w3, "marginLeft", large ? 30 : 10);

        large = !large;
      });
    }
  }
});
