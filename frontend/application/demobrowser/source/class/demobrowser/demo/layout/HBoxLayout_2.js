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

qx.Class.define("demobrowser.demo.layout.HBoxLayout_2",
{
  extend : demobrowser.demo.util.LayoutApplication,

  members :
  {
    main: function()
    {
      this.base(arguments);

      // auto size + negative margins
      var container = new qx.ui.container.Composite(new qx.ui.layout.HBox()).set({
        decorator: "black",
        backgroundColor: "yellow",
        height:80}
      );

      var w1 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "blue", maxHeight: 50, alignY:"top"});
      var w2 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green", maxHeight: 50, alignY:"middle"});
      var w3 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "grey", maxHeight: 50, alignY:"bottom"});

      container.add(w1);
      container.add(w2);
      container.add(w3);

      w2.setMarginLeft(-10);
      w3.setMarginLeft(-10);

      this.getRoot().add(container, {left:10, top:10});




      // auto size + negative margins + collapsing
      var box = new qx.ui.layout.HBox();
      var container = (new qx.ui.container.Composite(box)).set({decorator: "black", backgroundColor: "yellow", height:80});

      var w1 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "blue", maxHeight: 50, alignY:"top"});
      var w2 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green", maxHeight: 50, alignY:"middle"});
      var w3 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "grey", maxHeight: 50, alignY:"bottom"});

      container.add(w1);
      container.add(w2);
      container.add(w3);

      w2.setMarginLeft(-10);
      w2.setMarginRight(20);
      w3.setMarginLeft(-10);

      this.getRoot().add(container, {left:10, top:100});




      // auto size + negative margins + flex (growing)
      var box = new qx.ui.layout.HBox();
      var container = (new qx.ui.container.Composite(box)).set({decorator: "black", backgroundColor: "yellow", height:80, width: 500});

      var w1 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "blue", maxHeight: 50, alignY:"top"});
      var w2 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green", maxHeight: 50, alignY:"middle"});
      var w3 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "grey", maxHeight: 50, alignY:"bottom"});

      container.add(w1, { flex : 1 });
      container.add(w2, { flex : 1 });
      container.add(w3, { flex : 1 });

      w2.setMarginLeft(-10);
      w3.setMarginLeft(-10);

      this.getRoot().add(container, {left:10, top:190});




      // auto size + negative margins + different flex (growing)
      var box = new qx.ui.layout.HBox();
      var container = (new qx.ui.container.Composite(box)).set({decorator: "black", backgroundColor: "yellow", height:80, width: 500});

      var w1 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "blue", maxHeight: 50, alignY:"top"});
      var w2 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green", maxHeight: 50, alignY:"middle"});
      var w3 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "grey", maxHeight: 50, alignY:"bottom"});

      container.add(w1, { flex : 1 });
      container.add(w2, { flex : 2 });
      container.add(w3, { flex : 3 });

      w2.setMarginLeft(-10);
      w3.setMarginLeft(-10);

      this.getRoot().add(container, {left:10, top:280});




      // zero width + negative margins + different flex (growing)
      var box = new qx.ui.layout.HBox();
      var container = (new qx.ui.container.Composite(box)).set({decorator: "black", backgroundColor: "yellow", height:80, width: 500});

      var w1 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "blue", maxHeight: 50, alignY:"top"});
      var w2 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green", maxHeight: 50, alignY:"middle"});
      var w3 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "grey", maxHeight: 50, alignY:"bottom"});

      container.add(w1, { flex : 1 });
      container.add(w2, { flex : 2 });
      container.add(w3, { flex : 3 });

      w2.setMarginLeft(-10);
      w3.setMarginLeft(-10);

      w1.setWidth(0);
      w2.setWidth(0);
      w3.setWidth(0);

      this.getRoot().add(container, {left:10, top:370});




      // auto size + negative margins + flex (shrinking)
      var box = new qx.ui.layout.HBox();
      var container = (new qx.ui.container.Composite(box)).set({decorator: "black", backgroundColor: "yellow", height:80, width: 200});

      var w1 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "blue", maxHeight: 50, alignY:"top"});
      var w2 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green", maxHeight: 50, alignY:"middle"});
      var w3 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "grey", maxHeight: 50, alignY:"bottom"});

      container.add(w1, { flex : 1 });
      container.add(w2, { flex : 1 });
      container.add(w3, { flex : 1 });

      w2.setMarginLeft(-10);
      w3.setMarginLeft(-10);

      this.getRoot().add(container, {left:10, top:460});




      // auto size + negative margins + different flex (shrinking)
      var box = new qx.ui.layout.HBox();
      var container = (new qx.ui.container.Composite(box)).set({decorator: "black", backgroundColor: "yellow", height:80, width: 200});

      var w1 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "blue", maxHeight: 50, alignY:"top"});
      var w2 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green", maxHeight: 50, alignY:"middle"});
      var w3 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "grey", maxHeight: 50, alignY:"bottom"});

      container.add(w1, { flex : 1});
      container.add(w2, { flex : 2 });
      container.add(w3, { flex : 3 });

      w2.setMarginLeft(-10);
      w3.setMarginLeft(-10);

      this.getRoot().add(container, {left:10, top:550});
    }
  }
});
