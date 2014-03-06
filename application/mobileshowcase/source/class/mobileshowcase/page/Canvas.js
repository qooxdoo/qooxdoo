
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christopher Zuendorf (czuendorf)

************************************************************************ */

/**
 * Mobile page showing a HTML5 canvas example.
 *
 * @asset(qx/mobile/css/*)
 */
qx.Class.define("mobileshowcase.page.Canvas",
{
  extend : mobileshowcase.page.Abstract,

  construct : function()
  {
    this.base(arguments,false);
    this.setTitle("Canvas");
  },


  members :
  {
    __canvasLeft : 0,
    __canvasTop : 0,
    __canvas : null,
    __lastPoints : null,
    __canvasWidth : 2000,
    __canvasHeight : 2000,


    // overridden
    _initialize : function()
    {
      this.base(arguments);

      this.__lastPoints = {};

      var clearButton = new qx.ui.mobile.navigationbar.Button("Clear");
      clearButton.addListener("tap", this.__clearCanvas, this);

      this.getRightContainer().add(clearButton);

      var canvas = this.__canvas = new qx.ui.mobile.embed.Canvas();

      canvas.addListener("pointerdown", this._onPointerDown, this);
      canvas.addListener("pointerup", this._onPointerUp, this);
      canvas.addListener("pointermove", this._onPointerMove, this);

      canvas.setWidth(this.__canvasWidth);
      canvas.setHeight(this.__canvasHeight);

      this.getContent().add(canvas);

      this.__clearCanvas();
      this._drawExample();
    },


    _createScrollContainer : function() {
      return new qx.ui.mobile.container.Composite();
    },


    /**
     * Draws the example on the canvas.
     */
    _drawExample : function() {
      // Comment in Text
      var ctx = this.__canvas.getContext2d();
      ctx.fillStyle = 'gray';
      ctx.font = 'bold 12pt Helvetica';
      ctx.fillText('Start drawing here...', 15, 25);

      // Smiley
      ctx.strokeStyle = '#3D72C9';
      ctx.beginPath();
      ctx.arc(75,85,50,0,Math.PI*2,true);
      ctx.moveTo(110,85);
      ctx.arc(75,85,35,0,Math.PI,false);
      ctx.moveTo(65,75);
      ctx.arc(60,75,5,0,Math.PI*2,true);
      ctx.moveTo(95,75);
      ctx.arc(90,75,5,0,Math.PI*2,true);
      ctx.stroke();
    },


    /**
     * Removes any drawings off the canvas.
     */
    __clearCanvas : function() {
      this.__canvas.getContentElement().width = this.__canvas.getContentElement().width;
      var ctx = this.__canvas.getContext2d();
      ctx.clearRect(0, 0, this.__canvasWidth, this.__canvasHeight);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, this.__canvasWidth, this.__canvasHeight);
      ctx.fill();
    },


    /**
     * Handles the touchend event on canvas.
     */
    _onPointerUp : function(evt) {
      this.__lastPoints = {};
    },


    /**
     * Handles the touch start event on canvas.
     */
    _onPointerDown : function(evt) {
      this.__canvasLeft = qx.bom.element.Location.getLeft(this.__canvas.getContentElement(), "padding");
      this.__canvasTop = qx.bom.element.Location.getTop(this.__canvas.getContentElement(), "padding");

      this.__draw(evt);
    },

    /**
     * Handles the touchmove event on canvas.
     */
    _onPointerMove : function(evt) {
      this.__draw(evt);

      evt.preventDefault();
      evt.stopPropagation();
    },


    /**
     * Draws the line on canvas.
     */
    __draw: function(evt) {
        var ctx = this.__canvas.getContext2d();
        var lastPoint = this.__lastPoints[evt.getPointerId()];

        var pointerLeft = evt.getViewportLeft() - this.__canvasLeft;
        var pointerTop = evt.getViewportTop() - this.__canvasTop;

        var opacity = null;

        if (lastPoint) {
          ctx.beginPath();
          ctx.lineCap = 'round';
          ctx.moveTo(lastPoint.x, lastPoint.y);
          ctx.lineTo(pointerLeft, pointerTop);

          var deltaX = Math.abs(lastPoint.x - pointerLeft);
          var deltaY = Math.abs(lastPoint.y - pointerTop);

          var velocity = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

          opacity = (100 - velocity) / 100;
          opacity = Math.round(opacity * Math.pow(10, 2)) / Math.pow(10, 2);

          if (!lastPoint.opacity) {
            lastPoint.opacity = 1;
          }

          if (opacity < 0.1) {
            opacity = 0.1;
          }

          // linear gradient from start to end of line
          var grad = ctx.createLinearGradient(lastPoint.x, lastPoint.y, pointerLeft, pointerTop);
          grad.addColorStop(0, 'rgba(61,114,201,' + lastPoint.opacity + ')');
          grad.addColorStop(1, 'rgba(61,114,201,' + opacity + ')');
          ctx.strokeStyle = grad;

          ctx.lineWidth = 1.5;

          ctx.stroke();
        }

        this.__lastPoints[evt.getPointerId()] = {
          "x": pointerLeft,
          "y": pointerTop,
          "opacity": opacity
        };
      }
    },


    destruct : function()
    {
      this._disposeObjects();
    }
  
});
