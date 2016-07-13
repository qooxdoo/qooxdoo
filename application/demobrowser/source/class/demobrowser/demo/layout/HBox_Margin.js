/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * @tag noPlayground
 */
qx.Class.define("demobrowser.demo.layout.HBox_Margin",
{
  extend : demobrowser.demo.util.LayoutApplication,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var scroll = new qx.ui.container.Scroll();
      this.getRoot().add(scroll, {edge: 0});

      var root = new qx.ui.container.Composite(new qx.ui.layout.VBox(20)).set({
        padding: 20
      })
      scroll.add(root);


      root.add(this.getBox1());
      root.add(this.getBox2());
      root.add(this.getBox3());
      root.add(this.getBox4());
      root.add(this.getBox5());
    },


    getBox1 : function()
    {
      // auto size + disabled y grow
      var box = new qx.ui.layout.HBox();
      var container = new qx.ui.container.Composite(box).set({
        decorator: "main",
        backgroundColor: "yellow",
        allowGrowX: false
      });

      box.setSpacing(5);

      var w1 = new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "green"});
      var w2 = new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "green"});
      var w3 = new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "green"});

      container.add(w1);
      container.add(w2);
      container.add(w3);

      w1.setAllowGrowY(false);
      w2.setAllowGrowY(false);
      w3.setAllowGrowY(false);

      w1.setMarginTop(20);
      w3.setMarginBottom(30);

      return container;
    },


    getBox2 : function()
    {
      // auto size + enabled y grow
      var box = new qx.ui.layout.HBox();
      var container = new qx.ui.container.Composite(box).set({
        decorator: "main",
        backgroundColor: "yellow",
        allowGrowX: false
      });

      box.setSpacing(5);

      var w1 = new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "green"});
      var w2 = new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "green"});
      var w3 = new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "green"});

      container.add(w1);
      container.add(w2);
      container.add(w3);

      w1.setMarginTop(20);
      w3.setMarginBottom(30);

      return container;
    },


    getBox3 : function()
    {
      // auto size + static height + middle aligned + disabled y grow (no effect)
      var box = new qx.ui.layout.HBox();
      var container = new qx.ui.container.Composite(box).set({
        decorator: "main",
        backgroundColor: "yellow",
        height: 100,
        allowGrowX: false
      });

      box.setSpacing(5);
      box.setAlignY("middle");

      var w1 = new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "green"});
      var w2 = new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "green"});
      var w3 = new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "green"});

      container.add(w1);
      container.add(w2);
      container.add(w3);

      w1.setAllowGrowY(false);
      w2.setAllowGrowY(false);
      w3.setAllowGrowY(false);

      w1.setMarginTop(20);
      w3.setMarginBottom(30);

      return container;
    },


    getBox4 : function()
    {
      // auto size + static height + middle aligned + enabled y grow
      var box = new qx.ui.layout.HBox();
      var container = new qx.ui.container.Composite(box).set({
        decorator: "main",
        backgroundColor: "yellow",
        height: 100,
        allowGrowX: false
      });

      box.setSpacing(5);
      box.setAlignY("middle");

      var w1 = new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "green"});
      var w2 = new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "green"});
      var w3 = new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "green"});

      container.add(w1);
      container.add(w2);
      container.add(w3);

      w1.setMarginTop(20);

      w3.setMarginTop(5);
      w3.setMinHeight(50);
      w3.setMarginBottom(20);

      return container;
    },


    getBox5 : function()
    {
      // auto size + static height + middle aligned + enabled y grow + huge marginBottom
      var box = new qx.ui.layout.HBox();
      var container = new qx.ui.container.Composite(box).set({
        decorator: "main",
        backgroundColor: "yellow",
        height: 100,
        allowGrowX: false
      });

      box.setSpacing(5);
      box.setAlignY("middle");

      var w1 = new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "green"});
      var w2 = new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "green"});
      var w3 = new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "green"});

      container.add(w1);
      container.add(w2);
      container.add(w3);

      w1.setMarginTop(20);

      w3.setMarginTop(5);
      w3.setMinHeight(50);
      w3.setMarginBottom(200);

      return container;
    }
  }
});
