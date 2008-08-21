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
 * Managed wrapper for the HTML canvas tag.
 */
qx.Class.define("qx.html.Canvas",
{
  extend : qx.html.Element,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments, "canvas");

    this.__canvas = document.createElement("canvas");
  },





  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {

    // overridden
    _createDomElement : function() {
      return this.__canvas;
    },


    /**
     * Get the canvas element [<a href="http://www.whatwg.org/specs/web-apps/current-work/multipage/the-canvas.html#canvas">W3C-HMTL5</a>]
     *
     * @return {HTMLCanvasElement} The canvas DOM element.
     */
    getCanvas : function() {
      return this.__canvas;
    },


    /**
     * Set the width attribute of the canvas element. This property controls the
     * size of the canvas coordinate space.
     *
     * @param width {Integer} canvas width
     */
    setWidth : function(width) {
      this.__canvas.width = width;
    },


    /**
     * Get the width attribute of the canvas element
     *
     * @return {Integer} canvas width
     */
    getWidth : function() {
      return this.__canvas.width;
    },


    /**
     * Set the height attribute of the canvas element. This property controls the
     * size of the canvas coordinate space.
     *
     * @param height {Integer} canvas height
     */
    setHeight : function(height) {
      this.__canvas.height = height;
    },


    /**
     * Get the height attribute of the canvas element
     *
     * @return {Integer} canvas height
     */
    getHeight : function() {
      return this.__canvas.height;
    },


    /**
     * Get the canvas' 2D rendering context
     * [<a href="http://www.whatwg.org/specs/web-apps/current-work/multipage/the-canvas.html#canvasrenderingcontext2d">W3C-HTML5</a>].
     * All drawing operations are performed on this context.
     *
     * @return {CanvasRenderingContext2D} The 2D rendering context.
     */
    getContext2d : function() {
      return this.__canvas.getContext("2d");
    }
  },



  /*
   *****************************************************************************
      DESTRUCT
   *****************************************************************************
   */

  destruct : function()
  {
    this._disposeFields("__canvas");
  }
});
