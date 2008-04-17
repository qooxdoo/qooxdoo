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

qx.Class.define("demobrowser.demo.layout.VBoxLayout_2",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      // auto size + negative margins
      var box = new qx.ui.layout.VBox();
      var container = (new qx.ui.core.Composite(box)).set({decorator: "black", backgroundColor: "yellow", width:180});

      var w1 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "blue", maxWidth:100});
      var w2 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green", maxWidth:100});
      var w3 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "grey", maxWidth:100});

      container.add(w1, { align : "left" });
      container.add(w2, { marginTop : -10, align : "center" });
      container.add(w3, { marginTop : -10, align : "right" });

      this.getRoot().add(container, {left:10, top:10});




      // auto size + negative margins + collapsing
      var box = new qx.ui.layout.VBox();
      var container = (new qx.ui.core.Composite(box)).set({decorator: "black", backgroundColor: "yellow", width:180});

      var w1 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "blue", maxWidth:100});
      var w2 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green", maxWidth:100});
      var w3 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "grey", maxWidth:100});

      container.add(w1, { align : "left" });
      container.add(w2, { marginTop : -10, marginBottom : 20, align : "center" });
      container.add(w3, { marginTop : -10, align : "right" });

      this.getRoot().add(container, {left:210, top:10});




      // auto size + negative margins + flex
      var box = new qx.ui.layout.VBox();
      var container = (new qx.ui.core.Composite(box)).set({decorator: "black", backgroundColor: "yellow", width:180, height: 300});

      var w1 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "blue", maxWidth:100});
      var w2 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green", maxWidth:100});
      var w3 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "grey", maxWidth:100});

      container.add(w1, { flex : 1, align : "left" });
      container.add(w2, { flex : 1, marginTop : -10, align : "center" });
      container.add(w3, { flex : 1, marginTop : -10, align : "right" });

      this.getRoot().add(container, {left:410, top:10});





      // auto size + negative margins + different flex
      var box = new qx.ui.layout.VBox();
      var container = (new qx.ui.core.Composite(box)).set({decorator: "black", backgroundColor: "yellow", width:180, height: 300});

      var w1 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "blue", maxWidth:100});
      var w2 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green", maxWidth:100});
      var w3 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "grey", maxWidth:100});

      container.add(w1, { flex : 1, align : "left" });
      container.add(w2, { flex : 2, marginTop : -10, align : "center" });
      container.add(w3, { flex : 3, marginTop : -10, align : "right" });

      this.getRoot().add(container, {left:610, top:10});



      // auto size + negative margins + different flex (using height)
      var box = new qx.ui.layout.VBox();
      var container = (new qx.ui.core.Composite(box)).set({decorator: "black", backgroundColor: "yellow", width:180, height: 300});

      var w1 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "blue", maxWidth:100});
      var w2 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green", maxWidth:100});
      var w3 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "grey", maxWidth:100});

      container.add(w1, { height : "1*", align : "left" });
      container.add(w2, { height : "2*", marginTop : -10, align : "center" });
      container.add(w3, { height : "3*", marginTop : -10, align : "right" });

      this.getRoot().add(container, {left:810, top:10});
    }
  }
});
