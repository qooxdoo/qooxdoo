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
     * Tino Butz (tbtz)
     * Christopher Zuendorf (czuendorf)

************************************************************************ */

/**
 * Mobile page responsible for showing the "event" showcase.
 */
qx.Class.define("mobileshowcase.page.Event",
{
  extend : qx.ui.mobile.page.NavigationPage,

  construct : function()
  {
    this.base(arguments, false);
    this.setTitle("Events");
    this.setShowBackButton(true);
    this.setBackButtonText("Back");
    
    this.__isFirefox = qx.core.Environment.get("browser.name")=="firefox";
    if(this.__isFirefox==true) {
      this.__vendorPrefix="moz";
    }
  },


  members :
  {
    __container : null,
    __gestureTarget : null,
    __gestureTargetWrap : null,
    __label : null,
    __inMove : null,
    __touchPoints : [],
    __lastEventType :"",
    __initialScale : 1,
    __initialRotation : 0,
    __currentRotation : 0,
    __currentScale : 0,
    __maxScale : 1.5,
    __minScale : 0.3,
    __lastMultiTouchEventTime : 0,
    __isFirefox:false,
    __vendorPrefix:"webkit",
    

    // overridden
    _initialize : function()
    {
      this.base(arguments);

      var container = this.__container = new qx.ui.mobile.container.Composite(new qx.ui.mobile.layout.VBox().set({
        alignX : "center",
        alignY : "middle"
      }));
      
      container.addCssClass("eventcontainer");
      container.addListener("tap", this._onTap, this);
      container.addListener("swipe", this._onSwipe, this);
      container.addListener("touchstart", this._onTouch, this);
      container.addListener("touchmove", this._onTouch, this);
      container.addListener("touchend", this._onTouch, this);
      qx.event.Registration.addListener(window, "orientationchange", this._onOrientationChange, this);
      
      // GESTURE TARGET OBJECT
      this.__gestureTargetWrap = new qx.ui.mobile.container.Composite();
      this.__gestureTargetWrap.addCssClass("gesture-target-wrap");
      
      this.__gestureTarget = new qx.ui.mobile.basic.Image("mobileshowcase/icon/HTML5_Badge_512.png");
      
      this.__gestureTarget.addCssClass("gesture-target");
      this.__gestureTarget.addListener("touchmove", this._onGestureTouchMove, this);
      this.__gestureTarget.addListener("touchend", this._onGestureTouchEnd, this);
      
      this.__gestureTarget.setDraggable(false);
      
      this.__gestureTargetWrap.add(this.__gestureTarget);
      container.add(this.__gestureTargetWrap);
      
      // TOUCH VISUALISATION CIRCLES
      for(var i=0;i<15;i++) {
        var touchPoint = new qx.ui.mobile.container.Composite();
        touchPoint.addCssClass("touch");
        
        this.__touchPoints.push(touchPoint);

        container.add(touchPoint);
        touchPoint.exclude();
      }
      
      var label = this.__label = new qx.ui.mobile.basic.Label("Touch / Tap / Swipe this area");
      container.add(label);

      var descriptionText = "<b>Testing Touch Events:</b> Touch / Tap / Swipe the area</br>\n\
      <b>Testing Multi-touch Events:</b> Touch the area with multiple fingers</br>\n\
      <b>Testing Pinch/Zoom Gesture:</b> Touch HTML5 logo with two fingers</br>\n\
      <b>Testing OrientationChange Event</b>: Rotate your device / change browser size";
      var descriptionLabel = new qx.ui.mobile.basic.Label(descriptionText);
     
      var descriptionGroup = new qx.ui.mobile.form.Group([descriptionLabel]);
      var containerGroup = new qx.ui.mobile.form.Group([container]);
      this.getContent().add(descriptionGroup, {flex:1});
      this.getContent().add(containerGroup, {flex:1});
    },
    
    
    _onGestureTouchMove : function(evt) {
      var gestureTargetElement = this.__gestureTarget.getContentElement();
      var gestureTargetWrapElement = this.__gestureTargetWrap.getContentElement();
      
      var offset = 256;
     
      var containerElement = this.__container.getContentElement();
      var containerLeft = qx.bom.element.Location.getLeft(containerElement, "scroll");
      var containerTop = qx.bom.element.Location.getTop(containerElement, "scroll");
      
      if (evt.isMultiTouch())
      {
        this.__currentRotation = Math.round(evt.getRotation()) + Math.round(this.__initialRotation);
        this.__currentScale = evt.getScale() * this.__initialScale;
        
        // Scale Range verification.
        if(this.__currentScale<this.__minScale){
          this.__currentScale = this.__minScale;
        } else if ( this.__currentScale > this.__maxScale) {
          this.__currentScale = this.__maxScale;
        }
        var transitionKey = "-"+this.__vendorPrefix+"-transform";
        var transitionValue = "rotate(" + (this.__currentRotation) + "deg) scale(" + (this.__currentScale) + ")";
        
        qx.bom.element.Style.set(gestureTargetElement,transitionKey, transitionValue);
        
        this.__lastMultiTouchEventTime = new Date().getTime();
      }
      else
      {
        var timeSinceMultiTouch = new Date().getTime() - this.__lastMultiTouchEventTime; 
        if(timeSinceMultiTouch>500) {
          var touchLeft = evt.getAllTouches()[0].clientX;
          var touchTop = evt.getAllTouches()[0].clientY;

          var left = touchLeft-containerLeft-offset;
          var top = touchTop-containerTop-offset;
          
          this.__moveElement(gestureTargetWrapElement,left,top);
        }
      }
    },
    
    
    /**
     * Moves an HTML element by left and top value.
     * Uses transform3d for smooth transitions.
     */
    __moveElement : function(element,left,top) {
      var transformKey = "-webkit-transform";
      var transformValue = "translate3d("+(left)+"px"+","+(top)+"px,0px)";
      if(this.__isFirefox==true) {
        transformKey = "transform";
      }
      
      qx.bom.element.Style.set(element,transformKey, transformValue);
      qx.bom.element.Style.set(element,"transform", transformValue);
    },
    
    
    _onGestureTouchEnd : function() {
      this.__initialRotation = this.__currentRotation;
      this.__initialScale = this.__currentScale;
    },


    /**
     * Event handler.
     *
     * @param evt {qx.event.type.Tap} The tap event.
     */
    _onTap : function(evt)
    {
      this.__label.setValue(this.__label.getValue() + " tap");
    },


    /**
     * Event handler.
     *
     * @param evt {qx.event.type.Swipe} The swipe event.
     */
    _onSwipe : function(evt)
    {
      this.__label.setValue(this.__label.getValue() + " swipe");
    },


    /**
     * Event handler for orientationchange event.
     */
    _onOrientationChange : function(evt) {
      var orientationMode = "Portrait";
      if(evt.isLandscape()){
        orientationMode = "Landscape";
      }
      this.__label.setValue(" " + evt.getType()+": "+orientationMode);
    },
    
    
    /**
     * Reacts on touch events and updates the event container background and touch markers.
     */
    __updateTouchVisualisation : function(evt) {
      var containerElement = this.__container.getContentElement();
      var containerLeft = qx.bom.element.Location.getLeft(this.__container.getContentElement(), "scroll");
      var containerTop = qx.bom.element.Location.getTop(this.__container.getContentElement(), "scroll");

      var offset = 50;
      
      var touches = evt.getAllTouches();
      
      for(var i=0;i<touches.length;i++) {
        var touchLeft = touches[i].clientX-containerLeft;
        var touchTop = touches[i].clientY-containerTop;

        var touchPoint =this.__touchPoints[i];
        var targetElement = touchPoint.getContentElement();
        
        if(!touchPoint.isVisible()) {
          touchPoint.show();
        }
          
        // Update position of touch circle.
        var touchCircleLeft = (touchLeft-offset);
        var touchCircleTop = (touchTop-offset);
        this.__moveElement(targetElement,touchCircleLeft,touchCircleTop);
        
        // If just one touch is present, the background follows the touch.
        if(touches.length==1) {
          qx.bom.element.Style.set(containerElement,"background","-"+this.__vendorPrefix+"-radial-gradient("+touchLeft+"px "+touchTop+"px, cover, #1a82f7, #2F2727)");
        } 
      }

      // Reset background gradient, when no touches are available.
      if(touches.length == 0) {
        qx.bom.element.Style.set(containerElement,"background","-"+this.__vendorPrefix+"-linear-gradient(top, #000000 0%,#555555 100%)");
      } else if (touches.length>1) {
        // Center background gradient, when multiple touches are available.
        qx.bom.element.Style.set(containerElement,"background","-"+this.__vendorPrefix+"-radial-gradient(50% 50%, cover, #1a82f7, #2F2727)");
      }
    },

    
    /**
     * Event handler.
     *
     * @param evt {qx.event.type.Touch} The touch event.
     */
    _onTouch : function(evt)
    {
      this.__updateTouchVisualisation(evt);
       
      var type = evt.getType();
      if (type == "touchstart") {
        // Disable iScroll before
        if (qx.core.Environment.get("qx.mobile.nativescroll") == false) {
          this._getScrollContainer().disable();
        }
        this.__label.setValue("");
      } else if (type == "touchend") {
        var touches = evt.getAllTouches();
        
        // On any touchEnd first hide all touch point marker.
        for(var i=0;i<this.__touchPoints.length;i++) {
          this.__touchPoints[i].exclude();
        }
        
        // Then show again touch circles when any touches are available.
        for(i=0;i<touches.length;i++) {
            this.__touchPoints[i].show();
        }
        
        // Re-enable iScroll after touchend event
        if (qx.core.Environment.get("qx.mobile.nativescroll") == false) {
          this._getScrollContainer().enable();
        }
      }

      // Text output of event
      if(this.__lastEventType != evt.getType()) {
        this.__label.setValue(this.__label.getValue() + " " + evt.getType());
      }
      this.__lastEventType = evt.getType();
    },
    
    
    // overridden
    _back : function()
    {
     qx.core.Init.getApplication().getRouting().executeGet("/", {reverse:true});
    }
  }
});