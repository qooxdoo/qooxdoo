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

qx.Class.define("demobrowser.demo.layout.VBoxLayout_5",
{
  extend : demobrowser.demo.util.LayoutApplication,

  members :
  {
    main: function()
    {
      this.base(arguments);

      // one percent child which is not flexible
      var box = new qx.ui.layout.VBox();
      var container = (new qx.ui.container.Composite(box)).set({height: 300, decorator: "black", backgroundColor: "yellow"});

      box.setSpacing(5);

      var w1 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"});
      var w2 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"});
      var w3 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"});

      container.add(w1, { height : "50%" });
      container.add(w2, { flex : 1 });
      container.add(w3, { flex : 1 });

      this.getRoot().add(container, {left:10, top:10});





      // all percent child, using 99% in sum, flex enabled for last child (=> perfect result, last one a bit bigger)
      var box = new qx.ui.layout.VBox();
      var container = (new qx.ui.container.Composite(box)).set({height: 300, decorator: "black", backgroundColor: "yellow"});

      box.setSpacing(5);

      var w1 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"});
      var w2 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"});
      var w3 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"});

      container.add(w1, { height : "33%" });
      container.add(w2, { height : "33%" });
      container.add(w3, { height : "33%", flex : 1 });

      this.getRoot().add(container, {left:130, top:10});






      // one percent child which is not flexible + auto sizing
      var box = new qx.ui.layout.VBox();
      var container = (new qx.ui.container.Composite(box)).set({decorator: "black", backgroundColor: "yellow"});

      box.setSpacing(5);

      var w1 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"});
      var w2 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"});
      var w3 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"});

      container.add(w1, { height : "50%" });
      container.add(w2, { flex : 1 });
      container.add(w3, { flex : 1 });

      this.getRoot().add(container, {left:250, top:10});




      // all child in percents + auto sizing + flex enabled
      var box = new qx.ui.layout.VBox();
      var container = (new qx.ui.container.Composite(box)).set({decorator: "black", backgroundColor: "yellow"});

      box.setSpacing(5);

      var w1 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"});
      var w2 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"});
      var w3 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"});

      container.add(w1, { height : "33%", flex : 1 });
      container.add(w2, { height : "33%", flex : 1 });
      container.add(w3, { height : "33%", flex : 1 });

      this.getRoot().add(container, {left:370, top:10});




      // all child in percents + flex enabled (shrinking)
      var box = new qx.ui.layout.VBox();
      var container = (new qx.ui.container.Composite(box)).set({height : 100, decorator: "black", backgroundColor: "yellow"});

      box.setSpacing(5);

      var w1 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"});
      var w2 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"});
      var w3 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"});

      container.add(w1, { height : "33%", flex : 1 });
      container.add(w2, { height : "33%", flex : 1 });
      container.add(w3, { height : "33%", flex : 1 });

      this.getRoot().add(container, {left:490, top:10});





      // all child in percents + flex enabled (growing)
      var box = new qx.ui.layout.VBox();
      var container = (new qx.ui.container.Composite(box)).set({height : 300, decorator: "black", backgroundColor: "yellow"});

      box.setSpacing(5);

      var w1 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"});
      var w2 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"});
      var w3 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"});

      container.add(w1, { height : "33%", flex : 1 });
      container.add(w2, { height : "33%", flex : 1 });
      container.add(w3, { height : "33%", flex : 1 });

      this.getRoot().add(container, {left:610, top:10});
    }
  }
});
