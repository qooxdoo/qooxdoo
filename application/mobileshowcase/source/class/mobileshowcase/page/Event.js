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
    __logoStartLeft: 0,
    __logoStartTop: 0,
    __pointers: null,


    // overridden
    _initialize : function()
    {
      this.base(arguments);

      var container =  this.__showcaseContainer = new qx.ui.mobile.container.Composite(new qx.ui.mobile.layout.VBox().set({
        alignX : "center",
        alignY : "middle"
      }));
      container.addCssClass("eventcontainer");

      container.addListener("touchmove", function(evt) {
        evt.preventDefault();
      }, this);

      // CONTAINER TOUCH AREA
      var containerTouchArea = this.__container = new qx.ui.mobile.container.Composite(new qx.ui.mobile.layout.VBox().set({
        alignX : "center",
        alignY : "middle"
      }));
      containerTouchArea.addCssClass("container-touch-area");

      containerTouchArea.addListener("tap", this._onGesture, this);
      containerTouchArea.addListener("dbltap", this._onGesture, this);
      containerTouchArea.addListener("longtap", this._onGesture, this);
      containerTouchArea.addListener("swipe", this._onGesture, this);

      containerTouchArea.addListener("pointerdown", this._onPointer, this);
      containerTouchArea.addListener("pointermove", this._onPointer, this);
      containerTouchArea.addListener("pointerup", this._onPointer, this);
      containerTouchArea.addListener("pointercancel", this._onPointer, this);
      containerTouchArea.addListener("pointerout", this._onPointer, this);

      container.add(containerTouchArea);

      // GESTURE TARGET OBJECT
      this.__gestureTarget = new qx.ui.mobile.basic.Image("mobileshowcase/icon/HTML5_Badge_512.png");

      this.__gestureTarget.addCssClass("gesture-target");
      this.__gestureTarget.addListener("trackstart", this.__onTrackStart, this);
      this.__gestureTarget.addListener("track", this.__onTrack, this);
      this.__gestureTarget.addListener("trackend", this.__onTrackEnd, this);
      this.__gestureTarget.addListener("pinch", this.__onPinch, this);
      this.__gestureTarget.addListener("rotate", this.__onRotate, this);
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
      qx.bom.AnimationFrame.request(this._renderLabel, this);
      qx.bom.AnimationFrame.request(this._renderLogo, this);
    },


    /**
     * Event handler.
     *
     * @param evt {qx.event.type.Track} The track event.
     */
    __onTrackStart : function(evt) {
      this.__logoStartLeft = this.__logoLeft;
      this.__logoStartTop = this.__logoTop;
    },


    /**
     * Event handler.
     *
     * @param evt {qx.event.type.Track} The track event.
     */
    __onTrack : function(evt) {
      if (qx.core.Environment.get("qx.mobile.nativescroll") === false) {
        this._getScrollContainer().disable();
      }

      var delta = evt.getDelta();
      this.__logoLeft = this.__logoStartLeft + delta.x;
      this.__logoTop = this.__logoStartTop + delta.y;

      qx.bom.AnimationFrame.request(this._renderLogo, this);
    },


    /**
     * Event handler.
     *
     * @param evt {qx.event.type.Track} The track event.
     */
    __onTrackEnd : function() {
      if (qx.core.Environment.get("qx.mobile.nativescroll") === false) {
        this._getScrollContainer().enable();
      }

      this.__initialRotation = this.__currentRotation;
      this.__initialScale = this.__currentScale;
    },


    /**
     * Event handler.
     *
     * @param evt {qx.event.type.Rotate} The rotate event.
     */
    __onRotate : function(evt) {
      this.__currentRotation = this.__initialRotation + evt.getAngle();
      qx.bom.AnimationFrame.request(this._renderLogo, this);
    },


    /**
     * Event handler.
     *
     * @param evt {qx.event.type.Pinch} The pinch event.
     */
    __onPinch : function(evt) {
      var scale = evt.getScale() * this.__initialScale;
      this.__currentScale = (Math.round(scale * 100) / 100);

      this.__currentScale = Math.max(this.__currentScale,this.__minScale);
      this.__currentScale = Math.min(this.__currentScale,this.__maxScale);

      qx.bom.AnimationFrame.request(this._renderLogo, this);
    },


    /**
     * Event handler.
     *
     * @param evt {qx.event.type.Pointer} The pointer event.
     */
    _onGesture : function(evt) {
      var pointer = this.__pointers[evt.getPointerId()];
      if(pointer) {
        this.__pointers[evt.getPointerId()].events.push(evt.getType());
      }
      qx.bom.AnimationFrame.request(this._renderLabel, this);
    },


    /**
     * Reacts on pointer events and updates the event container background and pointer markers.
     *
     * @param evt {qx.event.type.Pointer} The pointer event.
     */
    _updatePointerPosition : function(evt) {
      var position = this._getPointerPosition(evt);

      this._setPointerCirclePosition(evt.getPointerId(), position[0], position[1]);
    },


    /**
    * Resets the pointer circle position.
    *
    * @param pointerId {Integer} corresponding pointerId.
    */
    _resetPointerPosition : function(pointerId) {
      var pointer = this.__pointers[pointerId];

      if (pointer && pointer.target && !pointer.remove) {
        this.__circles.push(pointer.target);
        pointer.remove = true;
        pointer.target.setTranslateX(-1000);
        pointer.target.setTranslateY(-1000);
      }
    },


    /**
    * Sets the pointer circle position.
    *
    * @param pointerId {Integer} corresponding pointerId.
    * @param x {Integer} pointer position x.
    * @param y {Integer} pointer position y.
    */
    _setPointerCirclePosition : function(pointerId,x,y) {
      // Disable pointer circles Windows Phone 8 as no pointer-events:none is available.
      if (navigator.userAgent.match(/IEMobile\/10\.0/)) {
        return;
      }

      var pointer = this.__pointers[pointerId];
      if (pointer && pointer.target && pointer.remove == false) {
        pointer.target.setTranslateX(x);
        pointer.target.setTranslateY(y);
      }
    },


    /**
    * Calculates the pointer position relative to its container.
    *
    * @param evt {qx.event.type.Pointer} The pointer event.
    */
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
      var pointerId = evt.getPointerId();

      if (type == "pointerdown") {
        for (var key in this.__pointers) {
          var pointerToDelete = this.__pointers[key];
          if(pointerToDelete.remove) {
            delete this.__pointers[key];
          }
        }

        // Disable iScroll before
        if (qx.core.Environment.get("qx.mobile.nativescroll") == false) {
          this._getScrollContainer().disable();
        }

        this.__pointers[pointerId] = {
          target: this.__circles.pop(),
          events: [],
          remove: false
        };

        this._updatePointerPosition(evt);
      }

      if(type == "pointermove") {
        this._updatePointerPosition(evt);
      }


      if(this.__pointers[pointerId] && !this.__pointers[pointerId].remove) {
        var pointerEvents = this.__pointers[pointerId].events;
        if(pointerEvents.length > 0) {
          var lastEventType = pointerEvents[pointerEvents.length -1];
          if (lastEventType != type) {
            pointerEvents.push(type);
          }
        } else {
          pointerEvents.push(type);
        }
      }

      if (type == "pointerup" || type == "pointercancel" || type == "pointerout") {
        // Remove all circles out of visible area
        this._resetPointerPosition(pointerId);

        if(evt.isPrimary()) {
          this.__initialRotation = this.__currentRotation;
          this.__initialScale = this.__currentScale;
        }

        // Re-enable iScroll
        if (qx.core.Environment.get("qx.mobile.nativescroll") == false) {
          this._getScrollContainer().enable();
        }
      }

      qx.bom.AnimationFrame.request(this._renderLabel, this);
    },


    /**
    * Renders the position of the HTML5 Logo.
    */
    _renderLogo : function() {
      // Render HTML5 logo: rotation and scale.
      var gestureTargetElement = this.__gestureTarget.getContentElement();

      var transitionValue = "translate(" + (this.__logoLeft) + "px" + "," + (this.__logoTop) + "px) ";
      transitionValue = transitionValue + " scale(" + (this.__currentScale) + ")";
      transitionValue = transitionValue + " rotate(" + (this.__currentRotation) + "deg)";

      qx.bom.element.Style.set(gestureTargetElement, "transform", transitionValue);
    },


    /**
    * Renders the label text.
    */
    _renderLabel : function() {
      var labelBuffer = "";
      for (var pointerId in this.__pointers) {
        var pointer = this.__pointers[pointerId];
         labelBuffer = labelBuffer + "<div class='pointers'>";
        labelBuffer = labelBuffer + "<span class='pointer'>" + pointerId + "</span>";
        for (var i = 0; i < pointer.events.length; i++) {
          labelBuffer = labelBuffer + " <span class='event'>" + pointer.events[i] + "</span>";
        };
        labelBuffer = labelBuffer + "</div>";
      };
      this.__label.setValue(labelBuffer);
    }
  }
});
