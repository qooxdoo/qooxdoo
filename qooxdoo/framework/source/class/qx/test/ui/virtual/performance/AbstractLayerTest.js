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
    this.base(arguments);

    this.rowCount = 30;
    this.rowHeight = 20;
    this.colCount = 20;
    this.colWidth = 40;
  },

  members :
  {
    ITERATIONS : 2, // was 24

    setUp : function()
    {
      this.layer = this.getLayer().set({
        width: 1000,
        height: 1000
      });

      this.getRoot().add(this.layer);
      this.flush();

      this.rowSizes = [];
      for (var i=0; i<this.rowCount; i++) {
        this.rowSizes.push(this.rowHeight);
      }

      this.colSizes = [];
      for (var i=0; i<this.colCount; i++) {
        this.colSizes.push(this.colWidth);
      }
    },


    tearDown : function()
    {
      this.layer.destroy();
    },


    getLayer : function()
    {
      // throw an exception if the method is called on the abstract class
      throw new Error("Abstract method call (getLayer) in 'AbstractLayerTest'!");
    },


    testFullUpdateSameWindow : function()
    {
      this.profile("fullUpdate (same window)", function()
      {
        this.layer.fullUpdate(0, 0, this.rowSizes, this.colSizes);
      }, this, this.ITERATIONS);
    },


    testFullUpdateScrollDown : function()
    {
      var startRow = 0;

      this.profile("fullUpdate (scroll)", function()
      {
        this.layer.fullUpdate(startRow, 0, this.rowSizes, this.colSizes);
        startRow ++;
      }, this, this.ITERATIONS);
    },


    testUpdateLayerWindowScrollDown : function()
    {
      var startRow = 0;

      this.profile("scroll down 10 lines", function()
      {
        this.layer.updateLayerWindow(startRow, 0, this.rowSizes, this.colSizes);
        startRow += 10;
      }, this, this.ITERATIONS);
    },


    testUpdateLayerWindowScrollRight : function()
    {
      var startCol = 0;

      this.profile("scroll right 10 columns", function()
      {
        this.layer.updateLayerWindow(0, startCol, this.rowSizes, this.colSizes);
        startCol += 10;
      }, this, this.ITERATIONS);
    },



    testUpdateLayerData : function()
    {
      this.layer.fullUpdate(0, 0, this.rowSizes, this.colSizes);
      this.flush();

      this.profile("update layer data", function()
      {
        this.layer.updateLayerData();
      }, this, this.ITERATIONS);
    },


    profile : function(name, fcn, context, count)
    {
      if (window.console && window.console.profile) console.profile(name + "; " + this.classname);

      var times = [];
      for (var i=0,l=count; i<l; i++)
      {
        var start = new Date();

        fcn.call(context);
        this.flush();

        var duration = new Date() - start;
        times.push(duration);
      }
      times.sort(function(a, b) { return a < b ? -1 : 1});
      var avg = Math.round(qx.lang.Array.sum(times.slice(1, -1)) / (times.length-2))
      //this.warn(";" + name + "; avg(" + avg + "ms); " + times.join("ms; ") + "ms;");
      this.warn(";" + name + ";avg:" + avg + ";" + times.join(";"));

      if (window.console && window.console.profile) console.profileEnd(name + " " + this.classname);
    }
  }

});
