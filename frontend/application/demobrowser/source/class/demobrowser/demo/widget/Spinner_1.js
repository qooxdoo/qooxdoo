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
     * Martin Wittemann (martinwittemann)

************************************************************************ */

qx.Class.define("demobrowser.demo.widget.Spinner_1",
{
  extend : demobrowser.Demo,

  members :
  {
    main: function()
    {
      this.base(arguments);
      qx.theme.manager.Meta.getInstance().setTheme(qx.theme.Classic);

      var doc = new qx.ui.root.Application(document);
      doc.setBackgroundColor("background");

      var layout = new qx.ui.layout.Grid();
      layout.setRowAlign(0, "left", "bottom");
      layout.setRowAlign(1, "left", "middle");
      layout.setRowAlign(2, "left", "top");
      layout.setHorizontalSpacing(15);
      layout.setVerticalSpacing(3);

      var container = new qx.ui.core.Widget().set({
        layout: layout,
        padding: 10
      });
      doc.add(container, 0, 0);

      var row = 0;

      // ----- Spinner 1 -----
      var s1 = new qx.ui.form.Spinner(0, 50, 100);
      layout.add(s1, 1, row);
      layout.add(new qx.ui.basic.Label("100"), 0, row);
      layout.add(new qx.ui.basic.Label("0"), 2, row++);


      // ----- Spinner 2 -----
      var s2 = new qx.ui.form.Spinner(-30, 30, 30).set({
        wrap: true
      });
      layout.add(s2, 1, row);
      layout.add(new qx.ui.basic.Label("30"), 0, row);
      layout.add(new qx.ui.basic.Label("-30"), 2, row++);


      // ----- Spinner 3 -----
      var s3 = new qx.ui.form.Spinner(-3000, 0, 3000).set({
        incrementAmount: 5,
        width: 200,
        font: qx.bom.Font.fromString("30px sans-serif")
      });
      layout.add(s3, 1, row);
			layout.add(new qx.ui.basic.Label("3000"), 0, row);
			layout.add(new qx.ui.basic.Label("-3000"), 2, row++);


      // ----- Spinner 4 -----
      var s4 = new qx.ui.form.Spinner(100, 0, 200);
      layout.add(s4, 1, row);
			layout.add(new qx.ui.basic.Label("200"), 0, row);
			layout.add(new qx.ui.basic.Label("100"), 2, row++);


      // ----- Spinner 5 -----
      var s5 = new qx.ui.form.Spinner( -200, null, -100);
      layout.add(s5, 1, row);
			layout.add(new qx.ui.basic.Label("-100"), 0, row);
			layout.add(new qx.ui.basic.Label("-200"), 2, row++);


      // ----- Spinner 6 -----
      var s6 = new qx.ui.form.Spinner(-200, null, -100).set({
        enabled: false
      });
			layout.add(s6, 1, row);
      layout.add(new qx.ui.basic.Label("-100"), 0, row);
      layout.add(new qx.ui.basic.Label("-200"), 2, row++);


      // ----- Spinner 7 -----
      var s7 = new qx.ui.form.Spinner(-3000, 0, 3000);
			layout.add(s7, 1, row);
/*
      // Number format Test
      var nf = new qx.util.format.NumberFormat();
      nf.setMaximumFractionDigits(2);
      s7.setNumberFormat(nf);
      s7.getManager().setPrecision(2);
      s7.setSelectTextOnInteract(false);
*/
			layout.add(new qx.ui.basic.Label("3000"), 0, row);
			layout.add(new qx.ui.basic.Label("-3000"), 2, row++);
    }
  }
});
