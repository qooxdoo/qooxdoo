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

qx.Class.define("demobrowser.demo.layout.VBox_NegativeMargin",
{
  extend : demobrowser.demo.util.LayoutApplication,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var scroll = new qx.ui.container.Scroll();
      this.getRoot().add(scroll, {edge: 0});

      var root = new qx.ui.container.Composite(new qx.ui.layout.HBox(20)).set({
        padding: 20
      })
      scroll.add(root);


      root.add(this.getBox1());
      root.add(this.getBox2());
      root.add(this.getBox3());
      root.add(this.getBox4());
      root.add(this.getBox5());
      root.add(this.getBox6());
      root.add(this.getBox7());
    },


    getBox1 : function()
    {
      // auto size + negative margins
      var box = new qx.ui.layout.VBox();
      var container = new qx.ui.container.Composite(box).set({
        decorator: "main",
        backgroundColor: "yellow",
        width: 140,
        allowGrowY: false
      });

      var w1 = new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "blue", maxWidth:100, alignX:"left"});
      var w2 = new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "green", maxWidth:100, alignX:"center"});
      var w3 = new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "grey", maxWidth:100, alignX:"right"});

      container.add(w1);
      container.add(w2);
      container.add(w3);

      w2.setMarginTop(-10);
      w3.setMarginTop(-10);

      return container;
    },


    getBox2 : function()
    {
      // auto size + negative margins + collapsing
      var box = new qx.ui.layout.VBox();
      var container = new qx.ui.container.Composite(box).set({
        decorator: "main",
        backgroundColor: "yellow",
        width: 140,
        allowGrowY: false
      });

      var w1 = new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "blue", maxWidth:100, alignX:"left"});
      var w2 = new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "green", maxWidth:100, alignX:"center"});
      var w3 = new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "grey", maxWidth:100, alignX:"right"});

      container.add(w1);
      container.add(w2);
      container.add(w3);

      w2.setMarginTop(-10);
      w2.setMarginBottom(20);
      w3.setMarginTop(-10);

      return container;
    },


    getBox3 : function()
    {
      // auto size + negative margins + flex (growing)
      var box = new qx.ui.layout.VBox();
      var container = new qx.ui.container.Composite(box).set({
        decorator: "main",
        backgroundColor: "yellow",
        width: 140,
        height: 300,
        allowGrowY: false
      });

      var w1 = new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "blue", maxWidth:100, alignX:"left"});
      var w2 = new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "green", maxWidth:100, alignX:"center"});
      var w3 = new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "grey", maxWidth:100, alignX:"right"});

      container.add(w1, { flex : 1 });
      container.add(w2, { flex : 1 });
      container.add(w3, { flex : 1 });

      w2.setMarginTop(-10);
      w3.setMarginTop(-10);

      return container;
    },


    getBox4 : function()
    {
      // auto size + negative margins + different flex (growing)
      var box = new qx.ui.layout.VBox();
      var container = new qx.ui.container.Composite(box).set({
        decorator: "main",
        backgroundColor: "yellow",
        width: 140,
        height: 300,
        allowGrowY: false
      });

      var w1 = new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "blue", maxWidth:100, alignX:"left"});
      var w2 = new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "green", maxWidth:100, alignX:"center"});
      var w3 = new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "grey", maxWidth:100, alignX:"right"});

      container.add(w1, { flex : 1 });
      container.add(w2, { flex : 2 });
      container.add(w3, { flex : 3 });

      w2.setMarginTop(-10);
      w3.setMarginTop(-10);

      return container;
    },


    getBox5 : function()
    {
      // zero height + negative margins + different flex (growing)
      var box = new qx.ui.layout.VBox();
      var container = new qx.ui.container.Composite(box).set({
        decorator: "main",
        backgroundColor: "yellow",
        width: 140,
        height: 300,
        allowGrowY: false
      });

      var w1 = new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "blue", maxWidth:100, alignX:"left"});
      var w2 = new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "green", maxWidth:100, alignX:"center"});
      var w3 = new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "grey", maxWidth:100, alignX:"right"});

      container.add(w1, { flex : 1 });
      container.add(w2, { flex : 2 });
      container.add(w3, { flex : 3 });

      w2.setMarginTop(-10);
      w3.setMarginTop(-10);

      w1.setHeight(0);
      w2.setHeight(0);
      w3.setHeight(0);

      return container;
    },


    getBox6 : function()
    {
      // auto size + negative margins + flex (shrinking)
      var box = new qx.ui.layout.VBox();
      var container = new qx.ui.container.Composite(box).set({
        decorator: "main",
        backgroundColor: "yellow",
        width: 140,
        height: 100,
        allowGrowY: false
      });

      var w1 = new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "blue", maxWidth:100, alignX:"left"});
      var w2 = new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "green", maxWidth:100, alignX:"center"});
      var w3 = new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "grey", maxWidth:100, alignX:"right"});

      container.add(w1, { flex : 1 });
      container.add(w2, { flex : 1 });
      container.add(w3, { flex : 1 });

      w2.setMarginTop(-10);
      w3.setMarginTop(-10);

      return container;
    },


    getBox7 : function()
    {
      // auto size + negative margins + different flex (shrinking)
      var box = new qx.ui.layout.VBox();
      var container = new qx.ui.container.Composite(box).set({
        decorator: "main",
        backgroundColor: "yellow",
        width: 140,
        height: 100,
        allowGrowY: false
      });

      var w1 = new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "blue", maxWidth:100, alignX:"left"});
      var w2 = new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "green", maxWidth:100, alignX:"center"});
      var w3 = new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "grey", maxWidth:100, alignX:"right"});

      container.add(w1, { flex : 1 });
      container.add(w2, { flex : 2 });
      container.add(w3, { flex : 3 });

      w2.setMarginTop(-10);
      w3.setMarginTop(-10);

      return container;
    }
  }
});
