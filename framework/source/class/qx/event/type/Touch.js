/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)
     * Tino Butz (tbtz)

************************************************************************ */


/**
 * EXPERIMENTAL - NOT READY FOR PRODUCTION
 *
 * Touch event object.
 *
 * For more information see:
 *     http://developer.apple.com/safari/library/documentation/UserExperience/Reference/TouchEventClassReference/TouchEvent/TouchEvent.html
 */
qx.Class.define("qx.event.type.Touch",
{
    extend : qx.event.type.Dom,


    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */

    members :
    {
      // overridden
      _cloneNativeEvent : function(nativeEvent, clone)
      {
        var clone = this.base(arguments, nativeEvent, clone);

        clone.pageX = nativeEvent.pageX;
        clone.pageY = nativeEvent.pageY;
        clone.offsetX = nativeEvent.offsetX;
        clone.offsetY = nativeEvent.offsetY;

        // Workaround for BUG #6491
        clone.layerX = (nativeEvent.offsetX || nativeEvent.layerX);
        clone.layerY = (nativeEvent.offsetY || nativeEvent.layerY);

        clone.scale = nativeEvent.scale;
        clone.rotation = nativeEvent.rotation;
        clone.srcElement = nativeEvent.srcElement;

        clone.targetTouches = [];
        for (var i = 0; i < nativeEvent.targetTouches.length; i++) {
          clone.targetTouches[i] = nativeEvent.targetTouches[i];
        }

        clone.changedTouches = [];
        for (i = 0; i < nativeEvent.changedTouches.length; i++) {
          clone.changedTouches[i] = nativeEvent.changedTouches[i];
        }

        clone.touches = [];
        for (i = 0; i < nativeEvent.touches.length; i++) {
          clone.touches[i] = nativeEvent.touches[i];
        }

        return clone;
      },


      // overridden
      stop : function() {
        this.stopPropagation();
      },


      /**
       * Returns an array of native Touch objects representing all current
       * touches on the document.
       * Returns an empty array for the "touchend" event.
       *
       * @return {Object[]} Array of touch objects. For more information see:
       *     http://developer.apple.com/safari/library/documentation/UserExperience/Reference/TouchClassReference/Touch/Touch.html
       */
      getAllTouches : function() {
        return this._native.touches;
      },


      /**
       * Returns an array of native Touch objects representing all touches
       * associated with the event target element.
       * Returns an empty array for the "touchend" event.
       *
       * @return {Object[]} Array of touch objects. For more information see:
       *     http://developer.apple.com/safari/library/documentation/UserExperience/Reference/TouchClassReference/Touch/Touch.html
       */
      getTargetTouches : function() {
          return this._native.targetTouches;
      },


      /**
       * Returns an array of native Touch objects representing all touches of
       * the target element that changed in this event.
       *
       * On the "touchstart" event the array contains all touches that were
       * added to the target element.
       * On the "touchmove" event the array contains all touches that were
       * moved on the target element.
       * On the "touchend" event the array contains all touches that used
       * to be on the target element.
       *
       * @return {Object[]} Array of touch objects. For more information see:
       *     http://developer.apple.com/safari/library/documentation/UserExperience/Reference/TouchClassReference/Touch/Touch.html
       */
      getChangedTargetTouches : function() {
          return this._native.changedTouches;
      },


      /**
       * Checks whether more than one touch is associated with the event target
       * element.
       *
       * @return {Boolean} Is multi-touch
       */
      isMultiTouch : function() {
        return this.__getEventSpecificTouches().length > 1;
      },


      /**
       * iOS only: Returns the distance between two fingers since the start of the event.
       * The distance is a multiplier of the initial distance.
       * Initial value: 1.0.
       * Gestures:
       * < 1.0, pinch close / zoom out.
       * > 1.0, pinch open / to zoom in.
       *
       * @return The scale distance between two fingers
       */
      getScale : function() {
        return this._native.scale;
      },


      /**
       * iOS only: Returns the delta of the rotation since the start of the event, in degrees.
       * Initial value is 0.0
       * Clockwise > 0
       * Counter-clockwise < 0.
       *
       * @return {Float} The rotation delta
       */
      getRotation : function() {
        return this._native.rotation;
      },


      /**
       * Get the horizontal position at which the event occurred relative to the
       * left of the document. This property takes into account any scrolling of
       * the page.
       *
       * @param touchIndex {Integer ? 0) The index of the Touch object
       * @return {Integer} The horizontal position of the touch in the document.
       */
      getDocumentLeft : function(touchIndex) {
        return this.__getEventSpecificTouch(touchIndex).pageX;
      },


      /**
       * Get the vertical position at which the event occurred relative to the
       * top of the document. This property takes into account any scrolling of
       * the page.
       *
       * @param touchIndex {Integer ? 0) The index of the Touch object
       * @return {Integer} The vertical position of the touch in the document.
       */
      getDocumentTop : function(touchIndex) {
        return this.__getEventSpecificTouch(touchIndex).pageY;
      },


      /**
       * Get the horizontal coordinate at which the event occurred relative to
       * the origin of the screen coordinate system.
       *
       * @param touchIndex {Integer ? 0) The index of the Touch object
       * @return {Integer} The horizontal position of the touch
       */
      getScreenLeft : function(touchIndex) {
        return this.__getEventSpecificTouch(touchIndex).screenX;
      },


      /**
       * Get the vertical coordinate at which the event occurred relative to
       * the origin of the screen coordinate system.
       *
       * @param touchIndex {Integer ? 0) The index of the Touch object
       * @return {Integer} The vertical position of the touch
       */
      getScreenTop: function(touchIndex) {
          return this.__getEventSpecificTouch(touchIndex).screenY;
      },


      /**
       * Get the the horizontal coordinate at which the event occurred relative
       * to the viewport.
       *
       * @param touchIndex {Integer ? 0) The index of the Touch object
       * @return {Integer} The horizontal position of the touch
       */
      getViewportLeft : function(touchIndex) {
          return this.__getEventSpecificTouch(touchIndex).clientX;
      },


      /**
       * Get the vertical coordinate at which the event occurred relative
       * to the viewport.
       *
       * @param touchIndex {Integer ? 0) The index of the Touch object
       * @return {Integer} The vertical position of the touch
       */
      getViewportTop : function(touchIndex) {
          return this.__getEventSpecificTouch(touchIndex).clientY;
      },


      /**
       * Returns the unique identifier for a certain touch object.
       *
       * @param touchIndex {Integer ? 0) The index of the Touch object
       * @return {Integer} Unique identifier of the touch object
       */
      getIdentifier : function(touchIndex) {
        return this.__getEventSpecificTouch(touchIndex).identifier;
      },


      /**
       * Returns an event specific touch on the target element. This function is
       * used as the "touchend" event only offers Touch objects in the
       * changedTouches array.
       *
       * @param touchIndex {Integer ? 0) The index of the Touch object to
       *     retrieve
       * @return {Object} A native Touch object
       */
      __getEventSpecificTouch : function(touchIndex)
      {
        touchIndex = touchIndex == null ? 0 : touchIndex;
        return this.__getEventSpecificTouches()[touchIndex];
      },


      /**
       * Returns the event specific touches on the target element. This function
       * is used as the "touchend" event only offers Touch objects in the
       * changedTouches array.
       *
       * @return {Object[]} Array of native Touch objects
       */
      __getEventSpecificTouches : function()
      {
        var touches = (this._isTouchEnd() ? this.getChangedTargetTouches(): this.getTargetTouches());
        return touches;
      },


      /**
       * Indicates if the event occurs during the "touchend" phase. Needed to
       * determine the event specific touches. Override this method if you derive
       * from this class and want to indicate that the specific event occurred
       * during the "touchend" phase.
       *
       * @return {Boolean} Whether the event occurred during the "touchend" phase
       */
      _isTouchEnd : function()
      {
        return (this.getType() == "touchend" || this.getType() == "touchcancel");
      }
    }
  });
