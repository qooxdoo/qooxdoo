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

qx.Class.define("demobrowser.demo.ui.Decoration_2",
{
  extend : demobrowser.Demo,

  members :
  {
    main: function()
    {
      this.base(arguments);

      doc = new qx.ui.root.Application(document);
      doc.setTextColor("black");
      doc.setBackgroundColor("#EEE");

      var docLayout = new qx.ui.layout.HBox();
      docLayout.setSpacing(10);

      var container = new qx.ui.core.Widget();
      container.setPadding(20);
      container.setLayout(docLayout);

      doc.add(container, 0, 0);

      var img_arch = "../../../../../framework/source/resource/icon/CrystalClear/48/apps/accessories-archiver.png";
      var img_clip = "../../../../../framework/source/resource/icon/CrystalClear/48/apps/accessories-clipboard.png";
      var img_clock = "../../../../../framework/source/resource/icon/CrystalClear/48/apps/accessories-clock.png";
      var img_date = "../../../../../framework/source/resource/icon/CrystalClear/48/apps/accessories-date.png";

      qx.theme.manager.Color.getInstance().setTheme(qx.theme.classic.Color);
      qx.theme.manager.Decoration.getInstance().setTheme(demobrowser.demo.ui.Decoration_2_Theme1);


      var border = new qx.ui.decoration.Basic(2, "solid", "black");
      var special = new qx.ui.decoration.Basic().set({
        top : [1, "solid", "orange"],
        left : [5, "dotted", "green"],
        bottom : [3, "dashed", "blue"],
        right : [6, "double", "purple"]
      });


      var a1 = new qx.ui.basic.Atom("Toggle special border.", img_arch, 48, 48).set({
        backgroundColor : "gray",
        decorator : border,
        iconPosition : "top",
        padding : 5,
        allowGrowY: false
      })
      docLayout.add(a1);

      var grow = true;
      a1.addListener("click", function() {
        special.setRight(grow ? [10, "solid", "black"] : [6, "double", "purple"]);
        grow = !grow;
      });


      var a2 = new qx.ui.basic.Atom("Juhu", img_clip, 48, 48).set({
        backgroundColor : "gray",
        decorator : special,
        iconPosition : "top",
        padding : 5,
        allowGrowY: false
      })
      docLayout.add(a2);


      var a3 = new qx.ui.basic.Atom("Change Theme", img_clock, 48, 48).set({
        backgroundColor : "gray",
        decorator : "black",
        iconPosition : "top",
        padding : 5,
        allowGrowY: false
      });
      docLayout.add(a3);

      var flag = false;
      a3.addListener("click", function() {
        qx.theme.manager.Decoration.getInstance().setTheme(flag ? demobrowser.demo.ui.Decoration_2_Theme1 : demobrowser.demo.ui.Decoration_2_Theme2);
        flag = !flag;
      });


      var a4 = new qx.ui.basic.Atom("Juhu", img_clock, 48, 48).set({
        backgroundColor : "gray",
        decorator : "special",
        iconPosition : "top",
        padding : 5,
        allowGrowY: false
      });
      docLayout.add(a4);


      var a5 = new qx.ui.basic.Atom("Juhu", img_clock, 48, 48).set({
        //backgroundColor : "gray",
        decorator : "round",
        iconPosition : "top",
        padding : 5,
        allowGrowY: false
      });
      docLayout.add(a5);


      var a6 = new qx.ui.basic.Atom("Juhu", img_clock, 48, 48).set({
        //backgroundColor : "gray",
        decorator : "inset",
        iconPosition : "top",
        padding : 5,
        allowGrowY: false
      });
      docLayout.add(a6);
    }
  }
});
