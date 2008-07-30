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

qx.Class.define("demobrowser.demo.layout.VBoxLayout_7",
{
  extend : demobrowser.demo.util.LayoutApplication,

  members :
  {
    main: function()
    {
      this.base(arguments);

      // auto size + disabled y grow
      var box = new qx.ui.layout.VBox();
      var container = (new qx.ui.container.Composite(box)).set({decorator: "black", backgroundColor: "yellow"});

      box.setSpacing(5);

      var w1 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"});
      var w2 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"});
      var w3 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"});

      container.add(w1);
      container.add(w2);
      container.add(w3);

      w1.setAllowGrowX(false);
      w2.setAllowGrowX(false);
      w3.setAllowGrowX(false);

      w1.setMarginLeft(20);
      w3.setMarginRight(30);

      this.getRoot().add(container, {left:10, top:10});




      // auto size + enabled y grow
      var box = new qx.ui.layout.VBox();
      var container = (new qx.ui.container.Composite(box)).set({decorator: "black", backgroundColor: "yellow"});

      box.setSpacing(5);

      var w1 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"});
      var w2 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"});
      var w3 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"});

      container.add(w1);
      container.add(w2);
      container.add(w3);

      w1.setMarginLeft(20);
      w3.setMarginRight(30);

      this.getRoot().add(container, {left:170, top:10});




      // auto size + static height + middle aligned + disabled x grow
      var box = new qx.ui.layout.VBox();
      var container = (new qx.ui.container.Composite(box)).set({decorator: "black", backgroundColor: "yellow", width:150});

      box.setSpacing(5);
      box.setAlignX("center");

      var w1 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"});
      var w2 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"});
      var w3 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"});

      container.add(w1);
      container.add(w2);
      container.add(w3);

      w1.setAllowGrowX(false);
      w2.setAllowGrowX(false);
      w3.setAllowGrowX(false);

      w1.setMarginLeft(20);
      w3.setMarginRight(30);

      this.getRoot().add(container, {left:330, top:10});




      // auto size + static height + middle aligned + enabled x grow
      var box = new qx.ui.layout.VBox();
      var container = (new qx.ui.container.Composite(box)).set({decorator: "black", backgroundColor: "yellow", width:150});

      box.setSpacing(5);
      box.setAlignX("center");

      var w1 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"});
      var w2 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"});
      var w3 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"});

      container.add(w1);
      container.add(w2);
      container.add(w3);

      w1.setMarginLeft(20);

      w3.setMarginLeft(5);
      w3.setMinWidth(50);
      w3.setMarginRight(20);

      this.getRoot().add(container, {left:510, top:10});




      // auto size + static height + middle aligned + enabled x grow + huge marginRight
      var box = new qx.ui.layout.VBox();
      var container = (new qx.ui.container.Composite(box)).set({decorator: "black", backgroundColor: "yellow", width:150});

      box.setSpacing(5);
      box.setAlignX("center");

      var w1 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"});
      var w2 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"});
      var w3 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"});

      container.add(w1);
      container.add(w2);
      container.add(w3);

      w1.setMarginLeft(20);

      w3.setMarginLeft(5);
      w3.setMinWidth(50);
      w3.setMarginRight(200);

      this.getRoot().add(container, {left:690, top:10});
    }
  }
});
