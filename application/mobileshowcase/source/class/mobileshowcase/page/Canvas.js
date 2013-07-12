
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
  extend : qx.ui.mobile.page.NavigationPage,

  construct : function()
  {
    this.base(arguments,false);
    this.setTitle("Canvas");
    this.setShowBackButton(true);
    this.setBackButtonText("Back");
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

      this.__initLastPoints();

      var clearButton = new qx.ui.mobile.navigationbar.Button("Clear");
      clearButton.addListener("tap", this.__clearCanvas, this);

      this.getRightContainer().add(clearButton);

      var canvas  = this.__canvas = new qx.ui.mobile.embed.Canvas();

      canvas.addListener("touchstart", this._onTouchStart, this);
      canvas.addListener("touchend", this._onTouchEnd, this);
      canvas.addListener("touchmove", this._onTouchMove, this);

      canvas.setWidth(this.__canvasWidth);
      canvas.setHeight(this.__canvasHeight);

      this.getContent().add(canvas);

      this.__clearCanvas();
      this._drawExample();
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
     * Inits the lastPoints array.
     */
    __initLastPoints : function() {
      this.__lastPoints = [null,null,null,null,null,null,null,null,null,null];
    },


    /**
     * Removes any drawings off the canvas.
     */
    __clearCanvas : function() {
      this.__canvas.getContentElement().width = this.__canvas.getContentElement().width;

      var ctx = this.__canvas.getContext2d();
      ctx.fillStyle="#ffffff";
      ctx.fillRect(0,0,this.__canvasWidth,this.__canvasHeight);
      ctx.stroke();
    },


    /**
     * Handles the touch start event on canvas.
     */
    _onTouchStart : function(evt) {
      this.__canvasLeft = qx.bom.element.Location.getLeft(this.__canvas.getContentElement(), "padding");
      this.__canvasTop = qx.bom.element.Location.getTop(this.__canvas.getContentElement(), "padding");

      this.__draw(evt.getAllTouches());
    },


    /**
     * Handles the touchend event on canvas.
     */
    _onTouchEnd : function(evt) {
      this.__initLastPoints();
    },


    /**
     * Handles the touchmove event on canvas.
     */
    _onTouchMove : function(evt) {
      this.__draw(evt.getAllTouches());

      evt.preventDefault();
      evt.stopPropagation();
    },


    /**
     * Draws the touches on canvas.
     */
    __draw : function(touches) {
      var ctx = this.__canvas.getContext2d();

      for(var i = 0; i < touches.length; i++) {
        var lastPoint = this.__lastPoints[i];

        var touchLeft = touches[i].clientX-this.__canvasLeft;
        var touchTop = touches[i].clientY-this.__canvasTop;

        if(lastPoint != null) {
          ctx.beginPath();
          ctx.lineCap = 'round';
          ctx.moveTo(lastPoint.x, lastPoint.y);
          ctx.lineTo(touchLeft,touchTop);

          var deltaX = Math.abs(lastPoint.x - touchLeft);
          var deltaY = Math.abs(lastPoint.y - touchTop);

          var velocity = Math.sqrt(deltaX*deltaX + deltaY*deltaY);

          var opacity =  (100 - velocity) / 100;
          opacity = Math.round(opacity*Math.pow(10,2))/Math.pow(10,2);

          if(!lastPoint.opacity) {
            lastPoint.opacity = 1;
          }

          if(opacity < 0.1) {
            opacity = 0.1;
          }

          // linear gradient from start to end of line
          var grad = ctx.createLinearGradient(lastPoint.x, lastPoint.y, touchLeft, touchTop);
          grad.addColorStop(0, 'rgba(61,114,201,'+lastPoint.opacity+')');
          grad.addColorStop(1, 'rgba(61,114,201,'+opacity+')');
          ctx.strokeStyle = grad;

          ctx.lineWidth = 1.5;

          ctx.stroke();
        }

        this.__lastPoints[i] = {
          "x":touchLeft,
          "y":touchTop,
          "opacity":opacity
        }
      }
    },


    // overridden
    _back : function()
    {
      qx.core.Init.getApplication().getRouting().executeGet("/", {reverse:true});
    },


    /*
    *****************************************************************************
      DESTRUCTOR
    *****************************************************************************
    */
    destruct : function()
    {
      this._disposeObjects();
    }
  }
});
