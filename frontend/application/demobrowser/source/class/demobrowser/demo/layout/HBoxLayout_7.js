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
  extend : demobrowser.demo.util.LayoutApplication,

  members :
  {
    main: function()
    {
      this.base(arguments);

      // auto size + disabled y grow
      var box = new qx.ui.layout.HBox();
      var container = (new qx.ui.container.Composite(box)).set({decorator: "black", backgroundColor: "yellow"});

      box.setSpacing(5);

      var w1 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"});
      var w2 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"});
      var w3 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"});

      container.add(w1);
      container.add(w2);
      container.add(w3);

      w1.setAllowGrowY(false);
      w2.setAllowGrowY(false);
      w3.setAllowGrowY(false);

      w1.setMarginTop(20);
      w3.setMarginBottom(30);

      this.getRoot().add(container, {left:10, top:10});




      // auto size + enabled y grow
      var box = new qx.ui.layout.HBox();
      var container = (new qx.ui.container.Composite(box)).set({decorator: "black", backgroundColor: "yellow"});

      box.setSpacing(5);

      var w1 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"});
      var w2 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"});
      var w3 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"});

      container.add(w1);
      container.add(w2);
      container.add(w3);

      w1.setMarginTop(20);
      w3.setMarginBottom(30);

      this.getRoot().add(container, {left:10, top:110});




      // auto size + static height + middle aligned + disabled y grow (no effect)
      var box = new qx.ui.layout.HBox();
      var container = (new qx.ui.container.Composite(box)).set({decorator: "black", backgroundColor: "yellow", height:100});

      box.setSpacing(5);
      box.setAlignY("middle");

      var w1 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"});
      var w2 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"});
      var w3 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"});

      container.add(w1);
      container.add(w2);
      container.add(w3);

      w1.setAllowGrowY(false);
      w2.setAllowGrowY(false);
      w3.setAllowGrowY(false);

      w1.setMarginTop(20);
      w3.setMarginBottom(30);

      this.getRoot().add(container, {left:10, top:220});




      // auto size + static height + middle aligned + enabled y grow
      var box = new qx.ui.layout.HBox();
      var container = (new qx.ui.container.Composite(box)).set({decorator: "black", backgroundColor: "yellow", height:100});

      box.setSpacing(5);
      box.setAlignY("middle");

      var w1 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"});
      var w2 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"});
      var w3 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"});

      container.add(w1);
      container.add(w2);
      container.add(w3);

      w1.setMarginTop(20);

      w3.setMarginTop(5);
      w3.setMinHeight(50);
      w3.setMarginBottom(20);

      this.getRoot().add(container, {left:10, top:340});




      // auto size + static height + middle aligned + enabled y grow + huge marginBottom
      var box = new qx.ui.layout.HBox();
      var container = (new qx.ui.container.Composite(box)).set({decorator: "black", backgroundColor: "yellow", height:100});

      box.setSpacing(5);
      box.setAlignY("middle");

      var w1 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"});
      var w2 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"});
      var w3 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"});

      container.add(w1);
      container.add(w2);
      container.add(w3);

      w1.setMarginTop(20);

      w3.setMarginTop(5);
      w3.setMinHeight(50);
      w3.setMarginBottom(200);

      this.getRoot().add(container, {left:10, top:460});
    }
  }
});
