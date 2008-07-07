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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("qx.ui.embed.Canvas",
{
  extend : qx.ui.core.Widget,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */
  construct : function()
  {
    this.base(arguments);

    this._deferredDraw = new qx.util.DeferredCall(this._redraw, this);

    this.addListener("resize", this._onResize, this);
  },



  /*
   *****************************************************************************
      EVENTS
   *****************************************************************************
   */

  events :
  {
    "redraw" : "qx.event.type.Data"
  },



  /*
   *****************************************************************************
      MEMBERS
   *****************************************************************************
   */

  properties :
  {
    syncDimension :
    {
      check : "Boolean",
      init : true
    },

    canvasWidth :
    {
      check : "Integer",
      init : 300,
      apply : "_applyCanvasWidth"
    },

    canvasHeight :
    {
      check : "Integer",
      init : 150,
      apply : "_applyCanvasHeight"
    }
  },



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /*
    ---------------------------------------------------------------------------
      WIDGET API
    ---------------------------------------------------------------------------
    */

    // overridden
    _createContentElement : function() {
      return new qx.html.Canvas();
    },


    _redraw : function()
    {
      var canvas = this.getContentElement();
      var height = canvas.getAttribute("height");
      var width = canvas.getAttribute("width");

      this._draw(width, height);
      this.fireNonBubblingEvent("redraw", qx.event.type.Data, [{width: width, height: height}]);
    },


    _applyCanvasWidth : function(value, old)
    {
      this.getContentElement().setAttribute("width", value);
      this._deferredDraw.schedule();
    },


    _applyCanvasHeight : function(value, old)
    {
      this.getContentElement().setAttribute("height", value);
      this._deferredDraw.schedule();
    },


    _onResize : function(e)
    {
      var data = e.getData();
      var el = this.getContentElement();

      if (this.getSyncDimension())
      {
        this.setCanvasHeight(data.height);
        this.setCanvasWidth(data.width);
      }
    },


    getContext2d : function() {
      return this.getContentElement().getContext2d();
    },


    _draw : function(width, height) {}
  }
});
