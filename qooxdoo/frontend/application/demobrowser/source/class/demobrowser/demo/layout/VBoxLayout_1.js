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

qx.Class.define("demobrowser.demo.layout.VBoxLayout_1",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      // auto size
      var box = new qx.ui.layout.VBox();
      var container = (new qx.ui.container.Composite(box)).set({decorator: "black", backgroundColor: "yellow"});

      box.setSpacing(5);

      container.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"}));
      container.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"}));
      container.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"}));

      this.getRoot().add(container, {left:10, top:10});


      // container wider, horizontal alignment
      var box = new qx.ui.layout.VBox();
      var container = (new qx.ui.container.Composite(box)).set({decorator: "black", backgroundColor: "yellow", minWidth: 60});

      box.setSpacing(5);

      container.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green", maxWidth: 40, alignX:"left"}));
      container.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green", maxWidth: 40, alignX:"center"}));
      container.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green", maxWidth: 40, alignX:"right"}));

      this.getRoot().add(container, {left:130, top:10});


      // container higher, vertical alignment = bottom
      var box = new qx.ui.layout.VBox();
      var container = (new qx.ui.container.Composite(box)).set({decorator: "black", backgroundColor: "yellow", height: 300});

      box.setSpacing(5);
      box.setAlign("bottom");

      container.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"}));
      container.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"}));
      container.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"}));

      this.getRoot().add(container, {left:210, top:10});


      // container higher, vertical alignment = middle
      var box = new qx.ui.layout.VBox();
      var container = (new qx.ui.container.Composite(box)).set({decorator: "black", backgroundColor: "yellow", height: 300});

      box.setSpacing(5);
      box.setAlign("middle");

      container.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"}));
      container.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"}));
      container.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"}));

      this.getRoot().add(container, {left:330, top:10});


      // auto size + vertical margins
      var box = new qx.ui.layout.VBox();
      var container = (new qx.ui.container.Composite(box)).set({decorator: "black", backgroundColor: "yellow"});

      box.setSpacing(5);

      var w1 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"})
      var w2 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"})
      var w3 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"})

      container.add(w1, { marginBottom : 10 });
      container.add(w2, { marginTop : 20, marginBottom : 10 });
      container.add(w3, { marginBottom : 10 });

      this.getRoot().add(container, {left:450, top:10});




      // manual height + vertical margins + alignment=bottom
      var box = new qx.ui.layout.VBox();
      var container = (new qx.ui.container.Composite(box)).set({decorator: "black", backgroundColor: "yellow", height: 300});

      box.setSpacing(5);
      box.setAlign("bottom");

      var w1 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"})
      var w2 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"})
      var w3 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"})

      container.add(w1, { marginBottom : 10 });
      container.add(w2, { marginTop : 20, marginBottom : 10 });
      container.add(w3, { marginBottom : 10 });

      this.getRoot().add(container, {left:570, top:10});



      // manual height + vertical margins + alignment=middle
      var box = new qx.ui.layout.VBox();
      var container = (new qx.ui.container.Composite(box)).set({decorator: "black", backgroundColor: "yellow", height: 300});

      box.setSpacing(5);
      box.setAlign("middle");

      var w1 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"})
      var w2 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"})
      var w3 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"})

      container.add(w1, { marginBottom : 10 });
      container.add(w2, { marginTop : 20, marginBottom : 10 });
      container.add(w3, { marginBottom : 10 });

      this.getRoot().add(container, {left:690, top:10});
    }
  }
});
