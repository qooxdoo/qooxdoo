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
  type : "abstract",

  construct : function()
  {
    this.downAmount = 500;
    this.rightAmount = 500;
    
    this.horizontalIter = 6;
    this.verticalIter = 6;

    this.base(arguments);
  },

  members :
  {
    
    setUp : function()
    {
      this.scroller = new qx.ui.virtual.core.Scroller(1000, 500, 20, 40).set({
        width: 1000,
        height: 1000
      });
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


    testScrollVertical : function(amount)
    {
      var down = this.downAmount;
      this.profile("scroll vertical", function() 
      {
        this.scroller.scrollToY(down);
        down += this.downAmount;
      }, this, this.verticalIter);
    },


    testScrollHorizontal : function(amount)
    {
      var right = this.rightAmount;
      this.profile("scroll horizontal", function()
      {
        this.scroller.scrollToX(right);
        right += this.rightAmount;
      }, this, this.horizontalIter);
    },

    
    profile : function(name, fcn, context, count)
    {
      var times = [];
      //console.profile(name + " " + this.classname);
      for (var i=0,l=count; i<l; i++)
      {
        //var start = this.__beforeAction();
        var start = new Date();
        fcn.call(context);
        this.flush();
        var duration = new Date() - start;
        
        times.push(duration);
        //this.__afterAction(start, name);
      }
      this.warn(name + " took: " + times.sort().join("ms ") + "ms");
      //console.profileEnd(name + " " + this.classname);
    },

    
    __beforeAction : function()
    {
      this.flush();
      return new Date();
    },
    
    
    __afterAction : function(start, name)
    {      
      var end = new Date() - start;
      this.debug(name + " took " + end + "ms.")
    }

  }

});
