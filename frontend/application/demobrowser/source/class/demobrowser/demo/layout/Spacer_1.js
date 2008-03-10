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

qx.Class.define("demobrowser.demo.layout.Spacer_1",
{
  extend : qx.application.Standalone,
  include : [demobrowser.MDemoApplication],

  members :
  {
    main: function()
    {
      this.base(arguments);

      // Call demo mixin init
      this.initDemo();

      qx.theme.manager.Meta.getInstance().setTheme(qx.theme.Classic);

      doc = new qx.ui.root.Application(document);

      doc.add(this.getSpacerWithoutFlex(), 10, 10);
      doc.add(this.getSpacerWithFlex(), 10, 70);
      doc.add(this.getAddSpacer(), 10, 140);
      doc.add(this.getAddRemoveSpacer(), 10, 210);
    },


    getSpacerWithoutFlex : function()
    {
      // spacer without flex
      var box1 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "yellow"});
      var layout1 = new qx.ui.layout.HBox();

      layout1.setSpacing(5);
      layout1.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"}));
      layout1.add(new qx.ui.core.Spacer(30, 40));
      layout1.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"}));
      layout1.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"}));

      box1.setLayout(layout1);
      return box1;
    },

    getSpacerWithFlex : function()
    {
      // spacer with flex
      var box1 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "yellow", minHeight: 60, width: 500});
      var layout1 = new qx.ui.layout.HBox();

      layout1.setSpacing(5);
      layout1.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green", maxHeight: 40}), { align : "top" });
      layout1.add(new qx.ui.core.Spacer(30, 40), {flex: 1});
      layout1.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green", maxHeight: 40}), { align : "middle" });
      layout1.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green", maxHeight: 40}), { align : "bottom" });
      box1.setLayout(layout1);
      return box1;
    },

    getAddSpacer : function()
    {
      // addSpacer
      var box1 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "yellow", minHeight: 60, width: 500});
      var layout1 = new qx.ui.layout.HBox();

      layout1.setSpacing(5);
      layout1.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green", maxHeight: 40}), { align : "top" });
      layout1.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green", maxHeight: 40}), { align : "middle" });
      layout1.addSpacer();
      layout1.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green", maxHeight: 40}), { align : "bottom" });

      box1.setLayout(layout1);
      return box1;
    },

    getAddRemoveSpacer : function()
    {
      // addSpacer and remove
      var box1 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "yellow", minHeight: 60, width: 500});
      var layout1 = new qx.ui.layout.HBox();

      layout1.setSpacing(5);
      layout1.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green", maxHeight: 40}), { align : "top" });
      layout1.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green", maxHeight: 40}), { align : "middle" });
      var spacer = layout1.addSpacer();
      layout1.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green", maxHeight: 40}), { align : "bottom" });

      layout1.remove(spacer);
      box1.setLayout(layout1);
      return box1;
    }
  }
});
