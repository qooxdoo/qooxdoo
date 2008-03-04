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
    main: function() {

        this.base(arguments);
        qx.theme.manager.Meta.getInstance().setTheme(qx.theme.Classic);
        
        var doc = new qx.ui.root.Application(document);
        doc.setBackgroundColor("#EEEEEE");

        // ----- Spinner 1 -----
        var s1 = new qx.ui.form.Spinner(0, 50, 100);   
        doc.add(s1, 20, 36);
				// labels for spinner 1
        var l1 = new qx.ui.basic.Label("100");
        doc.add(l1, 20, 20);
        var l2 = new qx.ui.basic.Label("0");
        doc.add(l2, 20, 60);  
        // ----------------------
    
        // ----- Spinner 2 -----
        var s2 = new qx.ui.form.Spinner(-30, 30, 30);
        s2.set({
          wrap: true
        });
        doc.add(s2, 100, 36);
        // labels for spinner 2
        var l3 = new qx.ui.basic.Label("30");
        doc.add(l3, 100, 20);
        var l4 = new qx.ui.basic.Label("-30");
        doc.add(l4, 100, 60);
        // ----------------------


        // ----- Spinner 3 -----
        var s3 = new qx.ui.form.Spinner(-3000, 0, 3000);
        s3.set({
          incrementAmount: 5
        });
        doc.add(s3, 180, 36);
        // labels for spinner 3
        var l5 = new qx.ui.basic.Label("3000");
				doc.add(l5, 180, 20);
        var l6 = new qx.ui.basic.Label("-3000");
				doc.add(l6, 180, 60);
        // ----------------------
    
        // ----- Spinner 4 -----    
        var s4 = new qx.ui.form.Spinner(100, 0, 200);
        doc.add(s4, 260, 36);
        // labels for spinner 4
        var l7 = new qx.ui.basic.Label("200");
				doc.add(l7, 260, 20);
        var l8 = new qx.ui.basic.Label("100");
				doc.add(l8, 260, 60);
        // ----------------------
    
        // ----- Spinner 5 -----    
        var s5 = new qx.ui.form.Spinner( -200, null, -100);
        doc.add(s5, 340, 36);
        // labels for spinner 5
        var l9 = new qx.ui.basic.Label("-100");
				doc.add(l9, 340, 20);
        var l10 = new qx.ui.basic.Label("-200");
				doc.add(l10, 340, 60);
        // ----------------------

        // ----- Spinner 6 -----        
        var s6 = new qx.ui.form.Spinner(-200, null, -100);
				s6.set({
          enabled: false
        });
				doc.add(s6, 420, 36);
        // labels for spinner 6
        var l9 = new qx.ui.basic.Label("-100");
        doc.add(l9, 420, 20);
        var l10 = new qx.ui.basic.Label("-200");
        doc.add(l10, 420, 60);				
        // ----------------------

        // ----- Spinner 7 -----        
        var s7 = new qx.ui.form.Spinner(-3000, 0, 3000);
				doc.add(s7, 500, 36);
/*
        // Number format Test				
        var nf = new qx.util.format.NumberFormat();
        nf.setMaximumFractionDigits(2);
        s7.setNumberFormat(nf);
        s7.getManager().setPrecision(2);
        s7.setSelectTextOnInteract(false);
*/
        // labels for spinner 7
        var l11 = new qx.ui.basic.Label("3000");
				doc.add(l11, 500, 20);
        var l12 = new qx.ui.basic.Label("-3000");
				doc.add(l12, 500, 60);
        // ----------------------
				
    }
  }
});
