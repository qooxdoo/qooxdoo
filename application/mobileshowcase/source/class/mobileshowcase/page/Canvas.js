
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

/*
 * If you have added resources to your app remove the leading '*' in the
 * following line to make use of them.

#asset(qx/mobile/css/*)

************************************************************************ */


/**
 * Mobile page showing a HTML5 canvas example.
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
    __lastPoints : [null,null,null,null,null,null,null],
    __firstDraw : true,


    // overridden
    _initialize : function()
    {
      this.base(arguments);
      
      var canvas  = this.__canvas = new qx.ui.mobile.embed.Canvas();
      
      canvas.addListener("touchstart", this._onTouchStart,this);
      canvas.addListener("touchend", this._onTouchEnd,this);
      canvas.addListener("touchmove", this._onTouchMove,this);
      
      canvas.setWidth(1000);
      canvas.setHeight(1000);
      this.getContent().add(canvas);

      var ctx = canvas.getContext2d();
      ctx.fillStyle="#ffffff";
      ctx.fillRect(0,0,1000,1000);
      ctx.stroke();
      
      // Comment in Text
      ctx.fillStyle = 'gray';
      ctx.font = 'bold 12pt Helvetica';
      ctx.fillText('Start drawing here...', 15, 25);
    },
    
    
    /**
     * Removes any drawings off the canvas.
     */
    __clearCanvas : function() {
      this.__canvas.getContentElement().width = this.__canvas.getContentElement().width;
      this.__firstDraw = false;

      var ctx = this.__canvas.getContext2d();
      ctx.fillStyle="#ffffff";
      ctx.fillRect(0,0,1000,1000);
      ctx.stroke();
    },
    
    
    /**
     * Handles the touch start event on canvas.
     */
    _onTouchStart : function(evt) {
      if(this.__firstDraw) {
        this.__clearCanvas();
      }
      
      this.__canvasLeft = qx.bom.element.Location.getLeft(this.__canvas.getContentElement(), "padding");
      this.__canvasTop = qx.bom.element.Location.getTop(this.__canvas.getContentElement(), "padding");
      
      this.__draw(evt.getAllTouches());
    },
    
    
    /**
     * Handles the touchend event on canvas.
     */
    _onTouchEnd : function(evt) {
      this.__lastPoints = [null,null,null,null,null,null,null];
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
    draw : function(touches) {
      var ctx = this.__canvas.getContext2d();
      
      for(var i = 0; i < touches.length; i++) {
        var lastPoint = this.__lastPoints[i];

        var touchLeft = touches[i].clientX-this.__canvasLeft;
        var touchTop = touches[i].clientY-this.__canvasTop;

        if(lastPoint != null) {
          ctx.beginPath();
          ctx.moveTo(lastPoint.x, lastPoint.y);
          ctx.lineTo(touchLeft,touchTop);

          var deltaX = Math.abs(lastPoint.x - touchLeft);
          var deltaY = Math.abs(lastPoint.y - touchTop);

          var velocity = Math.sqrt(deltaX*deltaX + deltaY*deltaY);
          var opacity =  (100 - velocity) / 100; 

          opacity = Math.round(opacity*Math.pow(10,2))/Math.pow(10,2);

          ctx.strokeStyle = 'rgba(0,0,0,'+opacity+')';
          ctx.stroke();
        } 

        this.__lastPoints[i] = {
          "x":touchLeft,
          "y":touchTop
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
