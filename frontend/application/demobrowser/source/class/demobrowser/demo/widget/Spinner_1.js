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
        
        var doc = new qx.ui.root.Application(document);
				
				
				var s1 = new qx.ui.form.Spinner(0, 50, 100);   
				doc.add(s1, 20, 30);
				
        var l1 = new qx.ui.basic.Label("100");
        doc.add(l1, 20, 20);
        var l2 = new qx.ui.basic.Label("0");
        doc.add(l2, 20, 60);
/*    
    
        var s2 = new qx.ui.form.Spinner;
    
        s2.set({
          left: 100,
          top: 36,
          value: 30,
          min: -30,
          max: 30,
          wrap: true
        });
    
        d.add(s2);
    
        d.add( (new qx.ui.basic.Label("30").set({left:100, top:20})) );
        d.add( (new qx.ui.basic.Label("-30").set({left:100, top:60})) );
    
        var s3 = new qx.ui.form.Spinner;
    
        s3.set({
          left: 180,
          top: 36,
          value: 0,
          min: -3000,
          max: 3000,
          incrementAmount: 5
        });
    
        d.add(s3);
    
        d.add( (new qx.ui.basic.Label("3000").set({left:180, top:20})) );
        d.add( (new qx.ui.basic.Label("-3000").set({left:180, top:60})) );
    
    
        var s4 = new qx.ui.form.Spinner;
    
        s4.set({
          left: 260,
          top: 36,
          value: 0,
          min: 100,
          max: 200
        });
    
        d.add(s4);
    
        d.add( (new qx.ui.basic.Label("200").set({left:260, top:20})) );
        d.add( (new qx.ui.basic.Label("100").set({left:260, top:60})) );
    
    
        var s5 = new qx.ui.form.Spinner( -200, null, -100);
    
        s5.set({
          left: 340,
          top: 36
        });
    
        d.add(s5);
    
        d.add( (new qx.ui.basic.Label("-100").set({left:340, top:20})) );
        d.add( (new qx.ui.basic.Label("-200").set({left:340, top:60})) );
    
        d.add(new qx.ui.form.Spinner(-200, null, -100).set({
          left: 420,
          top: 36,
          enabled: false
        }));

        var s6 = new qx.ui.form.Spinner;

        s6.set({
          max: 3000,
          min: -3000,
          left: 420,
          top: 36
        });
        var nf = new qx.util.format.NumberFormat();
        nf.setMaximumFractionDigits(2);
        s6.setNumberFormat(nf);
        s6.getManager().setPrecision(2);
        s6.setSelectTextOnInteract(false);
        
        d.add(s6);

        d.add( (new qx.ui.basic.Label("3000").set({left:420, top:20})) );
        d.add( (new qx.ui.basic.Label("-3000").set({left:420, top:60})) );
*/
    }
  }
});
