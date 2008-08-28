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

/**
 * The Canvas widget embeds the HMTL canvas element
 * [<a href="http://www.whatwg.org/specs/web-apps/current-work/multipage/the-canvas.html#the-canvas">W3C-HTML5</a>]
 *
 * Note: This widget does not work in Internet Explorer!
 *
 * To paint something on the canvas and keep the content updated on resizes you
 * either have to override the {@link #_draw} method or redraw the content on
 * the {@link #redraw} event. The drawing context can be obtained by {@link #getCanvas2d}.
 *
 * Note that this widget operates on two different coordinate systems. The canvas
 * has its own coordinate system for drawing operations. This canvas coordinate
 * system is scaled to fit actual size of the DOM element. Each time the size of
 * the canvas dimensions is changed a redraw is required. In this case the
 * protected method {@link #_draw} is called and the event {@link #redraw}
 * is fired. You can synchronize the internal canvas dimension with the
 * CSS dimension of the canvas element by setting {@link #syncDimension} to
 * <code>true</code>.
 *
 * *Example*
 *
 * Here is a little example of how to use the canvas widget.
 *
 * <pre class='javascript'>
 * var canvas = new qx.ui.embed.Canvas().set({
 *   canvasWidth: 200,
 *   canvasHeight: 200,
 *   syncDimension: true
 * });
 * canvas.addListener("redraw", function(e)
 * {
 *   var data = e.getData();
 *   var width = data.width;
 *   var height = data.height;
 *   var ctx = data.context;
 *
 *   ctx.fillStyle = "rgb(200,0,0)";
 *   ctx.fillRect (20, 20, width-5, height-5);
 *
 *   ctx.fillStyle = "rgba(0, 0, 200, 0.5)";
 *   ctx.fillRect (70, 70, 105, 100);
 * }, this);
 * </pre>
 *
 * *External Documentation*
 *
 * <a href='http://qooxdoo.org/documentation/0.8/widget/canvas' target='_blank'>
 * Documentation of this widget in the qooxdoo wiki.</a>
 */
qx.Class.define("qx.ui.embed.Canvas",
{
  extend : qx.ui.core.Widget,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param canvasWidth {Integer} The internal with of the canvas coordinates.
   * @param canvasHeight {Integer} The internal height of the canvas coordinates.
   */
  construct : function(canvasWidth, canvasHeight)
  {
    this.base(arguments);

    this.__deferredDraw = new qx.util.DeferredCall(this.__redraw, this);
    this.addListener("resize", this._onResize, this);

    if (canvasWidth !== undefined) {
      this.setCanvasWidth(canvasWidth);
    }

    if (canvasHeight !== undefined) {
      this.setCanvasHeight(canvasHeight);
    }
  },



  /*
   *****************************************************************************
      EVENTS
   *****************************************************************************
   */

  events :
  {
    /**
     * The redraw event is fired each time the canvas dimension change and the
     * canvas needs to be updated. The data field contains a map containing the
     * <code>width</code> and <code>height</code> of the canvas and the
     * rendering <code>context</code>.
     */
    "redraw" : "qx.event.type.Data"
  },



  /*
   *****************************************************************************
      MEMBERS
   *****************************************************************************
   */

  properties :
  {
    /** Whether canvas and widget coordinates should be synchronized */
    syncDimension :
    {
      check : "Boolean",
      init : false
    },

    /** The internal with of the canvas coordinates */
    canvasWidth :
    {
      check : "Integer",
      init : 300,
      apply : "_applyCanvasWidth"
    },

    /** The internal height of the canvas coordinates */
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
    /** {qx.util.DeferredCall} */
    __deferredDraw : null,

    /*
    ---------------------------------------------------------------------------
      WIDGET API
    ---------------------------------------------------------------------------
    */

    // overridden
    _createContentElement : function() {
      return new qx.html.Canvas();
    },


    /**
     * This methods triggers the redraw of the canvas' content
     */
    __redraw : function()
    {
      var canvas = this.getContentElement();
      var height = canvas.getHeight();
      var width = canvas.getWidth();
      var context = canvas.getContext2d();

      this._draw(width, height, context);
      this.fireNonBubblingEvent(
        "redraw",
        qx.event.type.Data,
        [{
          width: width,
          height: height,
          context: context
        }]
      );
    },


    // property apply
    _applyCanvasWidth : function(value, old)
    {
      this.getContentElement().setWidth(value);
      this.__deferredDraw.schedule();
    },


    // property apply
    _applyCanvasHeight : function(value, old)
    {
      this.getContentElement().setHeight(value);
      this.__deferredDraw.schedule();
    },


    /**
     * Redraw the canvas
     */
    update : function() {
      this.__deferredDraw.schedule();
    },


    /**
     * Widget resize event handler. Updates the canvas dimension if needed.
     *
     * @param e {qx.event.type.Data} The resize event object
     */
    _onResize : function(e)
    {
      var data = e.getData();

      if (this.getSyncDimension())
      {
        this.setCanvasHeight(data.height);
        this.setCanvasWidth(data.width);
      }
    },


    /**
     * Get the native canvas 2D rendering context
     * [<a href="http://www.whatwg.org/specs/web-apps/current-work/multipage/the-canvas.html#canvasrenderingcontext2d">W3C-HTML5</a>].
     * All drawing operations are performed on this context.
     *
     * @return {CanvasRenderingContext2D} The 2D rendering context.
     */
    getContext2d : function() {
      return this.getContentElement().getContext2d();
    },


    /**
     * Template method, which can be used by derived classes to redraw the
     * content. It is called each time the canvas dimension change and the
     * canvas needs to be updated.
     *
     * @param width {Integer} New canvas width
     * @param height {Integer} New canvas height
     * @param context {CanvasRenderingContext2D} The rendering context to draw to
     */
    _draw : function(width, height, context) {}
  },



  /*
   *****************************************************************************
      DESTRUCT
   *****************************************************************************
   */
  destruct : function() {
    this._disposeObjects("__deferredDraw");
  }
});
