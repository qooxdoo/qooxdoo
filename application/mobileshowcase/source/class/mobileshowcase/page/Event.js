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
  extend : mobileshowcase.page.Abstract,

  construct : function()
  {
    this.base(arguments, false);
    this.setTitle("Events");

    this.__circles = [];

    this.__pointers = {};

    if(qx.core.Environment.get("browser.name")=="firefox") {
      this.__vendorPrefix = "moz";
    } else if (qx.core.Environment.get("engine.name") == "mshtml") {
      this.__vendorPrefix = "ms";
    }
  },


  members :
  {
    __container: null,
    __showcaseContainer: null,
    __gestureTarget: null,
    __gestureTargetWrap: null,
    __label: null,
    __inMove: null,
    __circles: null,
    __lastEventType: "",
    __initialScale: 0.3,
    __initialRotation: -15,
    __currentRotation: -15,
    __currentScale: 0.3,
    __maxScale: 1.5,
    __minScale: 0.3,
    __lastMultiTouchEventTime: 0,
    __vendorPrefix: "webkit",
    __logoLeft: -130,
    __logoTop: -130,
    __pointers: null,

    __labelBuffer : "",


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

      containerTouchArea.addListener("tap", this._onGesture, this);
      containerTouchArea.addListener("longtap", this._onGesture, this);
      containerTouchArea.addListener("swipe", this._onGesture, this);

      containerTouchArea.addListener("pointerdown", this._onPointer, this);
      containerTouchArea.addListener("pointermove", this._onPointer, this);
      containerTouchArea.addListener("pointerup", this._onPointer, this);
      containerTouchArea.addListener("pointercancel", this._onPointer, this);
      containerTouchArea.addListener("pointerout", this._onPointer, this);

      qx.event.Registration.addListener(window, "orientationchange", this._onOrientationChange, this);
      container.add(containerTouchArea);

      // GESTURE TARGET OBJECT
      this.__gestureTarget = new qx.ui.mobile.basic.Image("mobileshowcase/icon/HTML5_Badge_512.png");

      this.__gestureTarget.addCssClass("gesture-target");
      this.__gestureTarget.addListener("track", this.__onTrack, this);
      this.__gestureTarget.addListener("trackend", this.__onTrackEnd, this);
      this.__gestureTarget.setDraggable(false);
      this.__gestureTarget.setTranslateX(-5000);

      // If OS is Android 2 remove HTML5 badge logo, because Android is not able to scale and rotate on the same element.
      var isAndroid2 = (qx.core.Environment.get("os.name") == "android")
        && (parseInt(qx.core.Environment.get("os.version").charAt(0)) < 4);

      if(isAndroid2) {
        this.__gestureTarget.exclude();
      }

      container.add(this.__gestureTarget);

      // POINTER VISUALISATION CIRCLES
      for (var i = 0; i < 15; i++) {
        var circle = new qx.ui.mobile.container.Composite();
        circle.addCssClass("touch");

        this.__circles.push(circle);
        circle.setTranslateX(-5000);
        circle.setAnonymous(true);
        circle.setTransformUnit("px");

        containerTouchArea.add(circle);
      }

      var label = this.__label = new qx.ui.mobile.basic.Label("Touch / Tap / Swipe this area");
      containerTouchArea.add(label);

      var descriptionText = "<b>Testing Pointer Events:</b> Touch / Tap / Swipe the area<br />\n\
      <b>Testing Multi-Pointer Events:</b> Touch the area with multiple fingers<br />\n\
      ";
      if(!isAndroid2) {
        descriptionText += "<b>Testing Pinch/Zoom Gesture:</b> Touch HTML5 logo with two fingers<br />";
      }
      descriptionText += "<b>Testing OrientationChange Event</b>: Rotate your device / change browser size";

      var descriptionLabel = new qx.ui.mobile.basic.Label(descriptionText);

      var descriptionGroup = new qx.ui.mobile.form.Group([descriptionLabel]);
      var containerGroup = new qx.ui.mobile.form.Group([container]);
      this.getContent().add(descriptionGroup, {flex:1});
      this.getContent().add(containerGroup, {flex:1});

      // Center background gradient, when multiple pointers are available.
      qx.bom.element.Style.set(this.__container.getContentElement(),"background","-"+this.__vendorPrefix+"-radial-gradient(50% 50%, cover, #1a82f7, #2F2727)");

      // Start rendering
      qx.bom.AnimationFrame.request(this._render, this);
    },


    __onTrack : function(evt) {
      if(!evt.isPrimary()) {
        return;
      }

      if (qx.core.Environment.get("qx.mobile.nativescroll") == false) {
        this._getScrollContainer().disable();
      }

      var offset = 256;

      var containerElement = this.__showcaseContainer.getContentElement();
      var containerLeft = qx.bom.element.Location.getLeft(containerElement, "padding");
      var containerTop = qx.bom.element.Location.getTop(containerElement, "padding");

      /*if (evt.isMultiTouch())
      {
        this.__currentRotation = Math.round(evt.getRotation()) + Math.round(this.__initialRotation);
        this.__currentScale = evt.getScale() * this.__initialScale;

        // Scale Range bounding
        if(this.__currentScale < this.__minScale) {
          this.__currentScale = this.__minScale;
        } else if ( this.__currentScale > this.__maxScale) {
          this.__currentScale = this.__maxScale;
        }

        this.__lastMultiTouchEventTime = new Date().getTime();
      }
      else
      {*/
        //var timeSinceMultiTouch = new Date().getTime() - this.__lastMultiTouchEventTime;

        //if(timeSinceMultiTouch > 500) {
          this.__logoLeft = evt.getViewportLeft() - containerLeft - offset;
          this.__logoTop = evt.getViewportTop() - containerTop - offset;
        //}
      //}

      qx.bom.AnimationFrame.request(this._render, this);

      evt.preventDefault();
    },


    __onTrackEnd : function() {
      //this.__initialRotation = this.__currentRotation;
      //this.__initialScale = this.__currentScale;

      if (qx.core.Environment.get("qx.mobile.nativescroll") == false) {
        this._getScrollContainer().enable();
      }
    },


    /**
     * Event handler.
     *
     * @param evt {qx.event.type.Pointer} The gesture event.
     */
    _onGesture : function(evt) {
      this.__labelBuffer += " "+evt.getType();
      qx.bom.AnimationFrame.request(this._render, this);
    },


    /**
     * Event handler for orientationchange event.
     */
    _onOrientationChange : function(evt) {
      var orientationMode = "Portrait";
      if(evt.isLandscape()){
        orientationMode = "Landscape";
      }
      this.__labelBuffer = " " + evt.getType()+": "+orientationMode;
    },


    /**
     * Reacts on pointer events and updates the event container background and pointer markers.
     */
    __updatePointerVisualisation : function(evt) {
      var pointer = this.__pointers[evt.getPointerId()];
      if (pointer) {
        var position = this._getPointerPosition(evt);
        this.__pointers[evt.getPointerId()].x = position[0];
        this.__pointers[evt.getPointerId()].y = position[1];
      }
    },


    _getPointerPosition : function(evt) {
      var containerLeft = qx.bom.element.Location.getLeft(this.__container.getContentElement(), "padding");
      var containerTop = qx.bom.element.Location.getTop(this.__container.getContentElement(), "padding");
      return [evt.getViewportLeft() - containerLeft,evt.getViewportTop() - containerTop];
    },


    /**
     * Event handler.
     *
     * @param evt {qx.event.type.Pointer} The pointer event.
     */
    _onPointer : function(evt)
    {
      var type = evt.getType();

      this.__updatePointerVisualisation(evt);
      if(type == "pointerdown") {
        this.__labelBuffer = "";
      }

      if(type == "pointercancel") {
        this.__labelBuffer = type;
      }

      if (type == "pointerdown") {
        // Disable iScroll before
        if (qx.core.Environment.get("qx.mobile.nativescroll") == false) {
          this._getScrollContainer().disable();
        }

        var position = this._getPointerPosition(evt);
        this.__pointers[evt.getPointerId()] = {
          x: position[0],
          y: position[1],
          target: this.__circles.pop()
        };
      }

      if (Object.keys(this.__pointers).length > 0) {
        // Text output of event
        if (this.__lastEventType != evt.getType()) {
          this.__labelBuffer = this.__labelBuffer + " " + evt.getType();
        }
        this.__lastEventType = evt.getType();
      }

      if (type == "pointerup") {
        // Remove all circles out of visible area
        var pointer = this.__pointers[evt.getPointerId()];
        if (pointer && pointer.target) {
          this.__circles.push(pointer.target);
          pointer.target.setTranslateX(-1000);
          pointer.target.setTranslateY(-1000);
        }

        delete this.__pointers[evt.getPointerId()];

        // Re-enable iScroll
        if (qx.core.Environment.get("qx.mobile.nativescroll") == false) {
          this._getScrollContainer().enable();
        }
      }

      if (type == "pointercancel" || (evt.getPointerType() == "mouse" && type == "pointerout")) {
        // Touch Circle Visualization
        var pointer = this.__pointers[evt.getPointerId()];
        if (pointer && pointer.target) {
          this.__circles.push(pointer.target);
          pointer.target.setTranslateX(-1000);
          pointer.target.setTranslateY(-1000);
        }

        delete this.__pointers[evt.getPointerId()];

        this.__labelBuffer = "";
      }

      qx.bom.AnimationFrame.request(this._render, this);
    },


    _render : function() {
      // Render HTML5 logo: rotation and scale.
      var gestureTargetElement = this.__gestureTarget.getContentElement();

      var transitionValue = "translate(" + (this.__logoLeft) + "px" + "," + (this.__logoTop) + "px) ";
      transitionValue = transitionValue + " scale(" + (this.__currentScale) + ")";
      transitionValue = transitionValue + " rotate(" + (this.__currentRotation) + "deg)";

      qx.bom.element.Style.set(gestureTargetElement, "transform", transitionValue);

      this.__label.setValue(this.__labelBuffer);

      // Touch Circle Visualization
      for (var pointerId in this.__pointers) {
        var pointer = this.__pointers[pointerId];
        if(pointer.target) {
          pointer.target.setTranslateX(pointer.x);
          pointer.target.setTranslateY(pointer.y);
        }
      }
    }
  }
});