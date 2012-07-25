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
  },


  members :
  {
    __container : null,
    __label : null,
    __inMove : null,
    __touchPoints : [],
    __lastEventType :"",


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
      
      // TOUCH VISUALISATION CIRCLES
      for(var i=0;i<15;i++) {
        var touchPoint = new qx.ui.mobile.container.Composite();
        touchPoint.addCssClass("touch");
        this.__touchPoints.push(touchPoint);

        container.add(touchPoint);
      }
      
      var label = this.__label = new qx.ui.mobile.basic.Label("Touch / Tap / Swipe this area");
      container.add(label);

      var descriptionText = "<b>Testing Touch Events:</b> Touch / Tap / Swipe the area</br><b>Testing Multi-touch Events:</b> Touch the area with multiple fingers</br><b>Testing OrientationChange Event</b>: Rotate your device / change browser size";
      var descriptionLabel = new qx.ui.mobile.basic.Label(descriptionText);
     
      var descriptionGroup = new qx.ui.mobile.form.Group([descriptionLabel]);
      var containerGroup = new qx.ui.mobile.form.Group([container]);
      this.getContent().add(descriptionGroup, {flex:1});
      this.getContent().add(containerGroup, {flex:1});
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

      var isFirefox = qx.core.Environment.get("browser.name")=="firefox";

      for(var i=0;i<touches.length;i++) {
        var touchLeft = touches[i].clientX-containerLeft;
        var touchTop = touches[i].clientY-containerTop;

        var touchPoint =this.__touchPoints[i];
        var targetElement = touchPoint.getContentElement();

        // If just one touch is present, the background follows the touch.
        if(touches.length==1){
          if(isFirefox) {
            // Firefox
            qx.bom.element.Style.set(containerElement,"background","-moz-radial-gradient("+touchLeft+"px "+touchTop+"px, cover, #1a82f7, #2F2727)");
          } else {
            // Chrome
            qx.bom.element.Style.set(containerElement,"background","-webkit-radial-gradient("+touchLeft+"px "+touchTop+"px, cover, #1a82f7, #2F2727)");
          }
        } else {
          // Multi-touch. Touchs are surrounded by a bordered circle.
          // Background gradient is centered.
          var currentOpacity = qx.bom.element.Style.get(targetElement,"opacity",1);

          if(currentOpacity ==0) {
            qx.bom.element.Style.set(targetElement,"opacity","0.6");
          }

          qx.bom.element.Style.set(targetElement,"left",touchLeft-offset+"px");
          qx.bom.element.Style.set(targetElement,"top",touchTop-offset+"px");
        }
      }

      // Reset background gradient, when no touch are available.
      if(touches.length == 0) {
        if(isFirefox) {
          // Firefox
          qx.bom.element.Style.set(containerElement,"background","-moz-linear-gradient(top, #000000 0%,#555555 100%)");
        } else {
          // Chrome
          qx.bom.element.Style.set(containerElement,"background","-webkit-linear-gradient(top, #000000 0%,#555555 100%)");
        }
      } else if (touches.length>1) {
        // Center background gradient, when multiple touches are available.
        if(isFirefox) {
          // Firefox
          qx.bom.element.Style.set(containerElement,"background","-moz-radial-gradient(50% 50%, cover, #1a82f7, #2F2727)");
        } else {
          // Chrome
          qx.bom.element.Style.set(containerElement,"background","-webkit-radial-gradient(50% 50%, cover, #1a82f7, #2F2727)");
        }
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
          var targetElement = this.__touchPoints[i].getContentElement();
          qx.bom.element.Style.set(targetElement,"opacity","0");
        }

        // Then show again touch circle, when are any available.
        for(i=0;i<touches.length;i++) {
          var touch = touches[i];
          targetElement = touch.getContentElement();
          qx.bom.element.Style.set(targetElement,"opacity","0.6");
        }

        // Re-enable iScroll after touchend event
        if (qx.core.Environment.get("qx.mobile.nativescroll") == false) {
          this._getScrollContainer().enable();
        }
      }

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