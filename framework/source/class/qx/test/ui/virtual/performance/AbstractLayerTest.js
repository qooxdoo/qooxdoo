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
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */

qx.Class.define("qx.test.ui.virtual.performance.AbstractLayerTest", 
{
  extend : qx.test.ui.LayoutTestCase,

  construct : function()
  {
    this.downAmount = 500;
    this.upAmount = 500;
    this.leftAmount = 500;
    this.rightAmount = 500;

    this.base(arguments);
  },

  members :
  {
    
    setUp : function()
    {
      this.scroller = new qx.ui.virtual.core.Scroller(1000, 500, 20, 40);
      this.scroller.getPane().addLayer(this.getLayer());

      this.getRoot().add(this.scroller);
      qx.ui.core.queue.Manager.flush();
    },

    tearDown : function()
    {
      this.getRoot().remove(this.scroller);
      this.scroller.dispose();
    },


    getLayer : function()
    {
      // throw an exception if the method is called on the abstract class
      throw new Error("Abstract method call (getLayer) in 'AbstractLayerTest'!");
    },

    scrollDown : function()
    {
      var start = this.__beforeAction();
      this.scroller.scrollToY(this.downAmount);
      this.__afterAction(start, "scrollDown");
    },


    scrollLeft : function(amount)
    {
      var start = this.__beforeAction();
      this.scroller.scrollToX(this.downAmount);
      this.__afterAction(start, "scrollLeft");
    },


    scrollRight : function(amount)
    {
      var start = this.__beforeAction();
      this.scroller.scrollToX(-this.downAmount);
      this.__afterAction(start, "scrollLeft");
    },


    scrollUp : function(amount)
    {
      var start = this.__beforeAction();
      this.scroller.scrollToY(-this.downAmount);
      this.__afterAction(start, "scrollLeft");
    },

    __beforeAction : function()
    {
      qx.ui.core.queue.Manager.flush();
      return new Date();
    },
    
    __afterAction : function(start, name)
    {
      qx.ui.core.queue.Manager.flush();
      var end = new Date() - start;

      this.debug(name + " took " + end + "ms.")
    }

  }

});
