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
    __showcaseContainer : null,
    __gestureTarget : null,
    __gestureTargetWrap : null,
    __label : null,
    __inMove : null,
    __touchPoints : [],
    __lastEventType :"",
    __initialScale : 1,
    __initialRotation : -15,
    __currentRotation : 0,
    __currentScale : 0.4,
    __maxScale : 1.5,
    __minScale : 0.3,
    __lastMultiTouchEventTime : 0,
    __isFirefox:false,
    __vendorPrefix:"webkit",
    __logoLeft:-130,
    __logoTop:-130,
    __touchCircleLeft:[-1000,-1000,-1000,-1000,-1000,-1000,-1000,-1000,-1000,-1000,-1000,-1000,-1000,-1000,-1000],
    __touchCircleTop:[-1000,-1000,-1000,-1000,-1000,-1000,-1000,-1000,-1000,-1000,-1000,-1000,-1000,-1000,-1000],
    __touchCount:0,
    
    

    // overridden
    _initialize : function()
    {
      this.base(arguments);

      var container =  this.__showcaseContainer = new qx.ui.mobile.container.Composite(new qx.ui.mobile.layout.VBox().set({
        alignX : "center",
        alignY : "middle"
      }));
      container.addCssClass("eventcontainer");
      
      // CONTAINER TOUCH AREA 
      var containerTouchArea = this.__container = new qx.ui.mobile.container.Composite(new qx.ui.mobile.layout.VBox().set({
        alignX : "center",
        alignY : "middle"
      }));
      containerTouchArea.addCssClass("container-touch-area");
     
      containerTouchArea.addListener("tap", this._onTap, this);
      containerTouchArea.addListener("swipe", this._onSwipe, this);
      containerTouchArea.addListener("touchstart", this._onTouch, this);
      containerTouchArea.addListener("touchmove", this._onTouch, this);
      containerTouchArea.addListener("touchend", this._onTouch, this);
      qx.event.Registration.addListener(window, "orientationchange", this._onOrientationChange, this);
      container.add(containerTouchArea);

      // GESTURE TARGET OBJECT
      
      this.__gestureTarget = new qx.ui.mobile.basic.Image("mobileshowcase/icon/HTML5_Badge_512.png");
      
      this.__gestureTarget.addCssClass("gesture-target");
      this.__gestureTarget.addListener("touchmove", this._onGestureTouchMove, this);
      this.__gestureTarget.addListener("touchend", this._onGestureTouchEnd, this);
      
      this.__gestureTarget.setDraggable(false);
      
      container.add(this.__gestureTarget);
      
      // TOUCH VISUALISATION CIRCLES
      for(var i=0;i<15;i++) {
        var touchPoint = new qx.ui.mobile.container.Composite();
        touchPoint.addCssClass("touch");
        
        this.__touchPoints.push(touchPoint);

        containerTouchArea.add(touchPoint);
      }
      
      var label = this.__label = new qx.ui.mobile.basic.Label("Touch / Tap / Swipe this area");
      containerTouchArea.add(label);

      var descriptionText = "<b>Testing Touch Events:</b> Touch / Tap / Swipe the area</br>\n\
      <b>Testing Multi-touch Events:</b> Touch the area with multiple fingers</br>\n\
      <b>Testing Pinch/Zoom Gesture:</b> Touch HTML5 logo with two fingers</br>\n\
      <b>Testing OrientationChange Event</b>: Rotate your device / change browser size";
      var descriptionLabel = new qx.ui.mobile.basic.Label(descriptionText);
     
      var descriptionGroup = new qx.ui.mobile.form.Group([descriptionLabel]);
      var containerGroup = new qx.ui.mobile.form.Group([container]);
      this.getContent().add(descriptionGroup, {flex:1});
      this.getContent().add(containerGroup, {flex:1});
      
      // Start rendering
      qx.bom.AnimationFrame.request(this._render, this);
    },
    
    
    _onGestureTouchMove : function(evt) {
      if (qx.core.Environment.get("qx.mobile.nativescroll") == false) {
          this._getScrollContainer().disable();
      }
      
      var offset = 256;
     
      var containerElement = this.__showcaseContainer.getContentElement();
      var containerLeft = qx.bom.element.Location.getLeft(containerElement, "padding");
      var containerTop = qx.bom.element.Location.getTop(containerElement, "padding");
      if (evt.isMultiTouch())
      {
        this.__currentRotation = Math.round(evt.getRotation()) + Math.round(this.__initialRotation);
        this.__currentScale = evt.getScale() * this.__initialScale;
        
        // Scale Range bounding
        if(this.__currentScale<this.__minScale) {
          this.__currentScale = this.__minScale;
        } else if ( this.__currentScale > this.__maxScale) {
          this.__currentScale = this.__maxScale;
        }
        
        this.__lastMultiTouchEventTime = new Date().getTime();
      }
      else
      {
        var timeSinceMultiTouch = new Date().getTime() - this.__lastMultiTouchEventTime; 
        if(timeSinceMultiTouch>500) {
          var touchLeft = evt.getAllTouches()[0].clientX;
          var touchTop = evt.getAllTouches()[0].clientY;

          this.__logoLeft = touchLeft-containerLeft-offset;
          this.__logoTop = touchTop-containerTop-offset;
        }
      }
      
      qx.bom.AnimationFrame.request(this._render, this);
    },
    
    
    _onGestureTouchEnd : function() {
      this.__initialRotation = this.__currentRotation;
      this.__initialScale = this.__currentScale;
      
      if (qx.core.Environment.get("qx.mobile.nativescroll") == false) {
         this._getScrollContainer().enable();
      }
    },
    
    
    /**
     * Moves an HTML element by left and top value.
     * Uses transform3d for smooth transitions.
     */
    __moveElement : function(element,left,top) {
      var transformKey = "transform";
      var transformValue = "translate3d("+(left)+"px"+","+(top)+"px,0px)";
      
      qx.bom.element.Style.set(element,transformKey, transformValue);
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
      var containerLeft = qx.bom.element.Location.getLeft(this.__container.getContentElement(), "padding");
      var containerTop = qx.bom.element.Location.getTop(this.__container.getContentElement(), "padding");

      var touches = evt.getAllTouches();
      
      this.__touchCount = touches.length;
      
      for(var i=0;i<touches.length;i++) {
        var touchLeft = touches[i].clientX-containerLeft;
        var touchTop = touches[i].clientY-containerTop;
        this.__touchCircleLeft[i] = touchLeft;
        this.__touchCircleTop[i] = touchTop;
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
        // Remove all touches out of visible area
        for(var i=0;i<this.__touchCircleLeft.length;i++) {
          this.__touchCircleLeft[i] = -1000;
          this.__touchCircleTop[i] = -1000;
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
      
      qx.bom.AnimationFrame.request(this._render, this);
    },
    
    
    _render : function() {
       // Render HTML5 logo: rotation and scale.
      var gestureTargetElement = this.__gestureTarget.getContentElement();
     
      var transitionKey = "transform";
      
      var transitionValue1 = " translate3d("+(this.__logoLeft)+"px"+","+(this.__logoTop)+"px,0px) ";
      var transitionValue2 = "rotate(" + (this.__currentRotation) + "deg) scale(" + (this.__currentScale) + ")";
      qx.bom.element.Style.set(gestureTargetElement, transitionKey, transitionValue1+transitionValue2);

      // Touch Circle Visualization
      for(var i=0;i<this.__touchCircleLeft.length;i++) {
        var touchPoint = this.__touchPoints[i];
        var targetElement = touchPoint.getContentElement();
        this.__moveElement(targetElement, this.__touchCircleLeft[i], this.__touchCircleTop[i]);
      }
      
      // Background Handling
      // Reset background gradient, when no touches are available.
      var containerElement = this.__container.getContentElement();
      if(this.__touchCount == 0) {
        qx.bom.element.Style.set(containerElement,"background","-"+this.__vendorPrefix+"-linear-gradient(top, #000000 0%,#555555 100%)");
      } 
      else if(this.__touchCount == 1) {
        // If just one touch is present, the background follows the touch.
        qx.bom.element.Style.set(containerElement,"background","-"+this.__vendorPrefix+"-radial-gradient("+ this.__touchCircleLeft[0]+"px "+this.__touchCircleTop[0]+"px, cover, #1a82f7, #2F2727)");
      } else if (this.__touchCount > 1) {
        // Center background gradient, when multiple touches are available.
        qx.bom.element.Style.set(containerElement,"background","-"+this.__vendorPrefix+"-radial-gradient(50% 50%, cover, #1a82f7, #2F2727)");
      }
    },
    
    
    // overridden
    _back : function()
    {
     qx.core.Init.getApplication().getRouting().executeGet("/", {reverse:true});
    }
  }
});