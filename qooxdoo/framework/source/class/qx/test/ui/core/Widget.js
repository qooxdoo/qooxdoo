/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
qx.Class.define("qx.test.ui.core.Widget",
{
  extend : qx.test.ui.LayoutTestCase,

  members :
  {
    testIsSeeableDepth0AfterFlush : function()
    {
      var w = new qx.ui.core.Widget();
      this.getRoot().add(w);
      this.flush();

      this.assertTrue(w.isSeeable());

      w.hide();
      this.flush();

      this.assertFalse(w.isSeeable());

      w.destroy();
    },


    testIsSeeableDepth1AfterFlush : function()
    {
      var c = new qx.ui.container.Composite();
      var l = new qx.ui.layout.Canvas();
      c.setLayout(l);
      this.getRoot().add(c);
      var w = new qx.ui.core.Widget();
      c.add(w);
      this.flush();

      this.assertTrue(w.isSeeable());

      c.hide();
      this.flush();

      this.assertFalse(w.isSeeable());

      l.dispose();
      w.destroy();
      c.destroy();
    },


    testIsSeeableDepth2AfterFlush : function()
    {
      var cc = new qx.ui.container.Composite();
      var ll = new qx.ui.layout.Canvas();
      cc.setLayout(ll);
      this.getRoot().add(cc);

      var c = new qx.ui.container.Composite();
      var l = new qx.ui.layout.Canvas();
      c.setLayout(l);
      cc.add(c);

      var w = new qx.ui.core.Widget();
      c.add(w);
      this.flush();

      this.assertTrue(w.isSeeable());

      cc.hide();
      this.flush();

      this.assertFalse(w.isSeeable());

      ll.dispose();
      cc.destroy();
      l.dispose();
      w.destroy();
      c.destroy();
    },


    testIsSeeableDepth0 : function() {
      var w = new qx.ui.core.Widget();
      this.getRoot().add(w);

      this.assertTrue(w.isSeeable());
      w.hide();
      this.assertFalse(w.isSeeable());

      w.destroy();
    },


    testIsSeeableDepth1 : function()
    {
      var c = new qx.ui.container.Composite();
      var l = new qx.ui.layout.Canvas();
      c.setLayout(l);
      this.getRoot().add(c);
      var w = new qx.ui.core.Widget();
      c.add(w);

      this.assertTrue(w.isSeeable());
      c.hide();
      this.assertFalse(w.isSeeable());

      l.dispose();
      w.destroy();
      c.destroy();
    },


    testIsSeeableDepth2 : function()
    {
      var cc = new qx.ui.container.Composite();
      var ll = new qx.ui.layout.Canvas();
      cc.setLayout(ll);
      this.getRoot().add(cc);

      var c = new qx.ui.container.Composite();
      var l = new qx.ui.layout.Canvas();
      c.setLayout(l);
      cc.add(c);

      var w = new qx.ui.core.Widget();
      c.add(w);

      this.assertTrue(w.isSeeable());
      cc.hide();
      this.assertFalse(w.isSeeable());

      ll.dispose();
      cc.destroy();
      l.dispose();
      w.destroy();
      c.destroy();
    },

    testIsSeeableDepth0AfterFlushExclude : function()
    {
      var w = new qx.ui.core.Widget();
      this.getRoot().add(w);
      this.flush();

      this.assertTrue(w.isSeeable());

      w.exclude();
      this.flush();

      this.assertFalse(w.isSeeable());

      w.destroy();
    },


    testIsSeeableNotInRoot : function()
    {
      var w = new qx.ui.core.Widget();
      this.assertFalse(w.isSeeable());
      w.destroy();
    },
    
    
    testGetShadowElement : function()
    {
      var w = new qx.ui.core.Widget();
      this.assertNull(w.getShadowElement());
      
      w.setShadow("shadow-window");
      this.assertInstance(w.getShadowElement(), qx.html.Decorator);
      this.assertEquals("shadow-window", w.getShadowElement().getId());
      
      w.destroy();      
    }
  }
});
