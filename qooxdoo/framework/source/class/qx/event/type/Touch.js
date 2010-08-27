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
      init : function(nativeEvent, target, relatedTarget, canBubble, cancelable)
      {
        this.base(arguments, nativeEvent, target, relatedTarget, canBubble, cancelable);

        if (!relatedTarget) {
          this._relatedTarget = qx.bom.Event.getRelatedTarget(nativeEvent);
        }

        return this;
      },


      // overridden
      _cloneNativeEvent : function(nativeEvent, clone)
      {
        var clone = this.base(arguments, nativeEvent, clone);

        clone.pageX = nativeEvent.pageX;
        clone.pageY = nativeEvent.pageY;
        clone.layerX = nativeEvent.layerX;
        clone.layerY = nativeEvent.layerY;
        clone.scale = nativeEvent.scale;
        clone.rotation = nativeEvent.rotation;
        clone.srcElement = nativeEvent.srcElement;

        clone.targetTouches = [];
        for (var i = 0; i < nativeEvent.targetTouches.length; i++) {
          clone.targetTouches[i] = nativeEvent.targetTouches[i];
        };

        clone.changedTouches = [];
        for (var i = 0; i < nativeEvent.changedTouches.length; i++) {
          clone.changedTouches[i] = nativeEvent.changedTouches[i];
        };

        clone.touches = [];
        for (var i = 0; i < nativeEvent.touches.length; i++) {
          clone.touches[i] = nativeEvent.touches[i];
        };

        return clone;
      },


      // overridden
      stop : function() {
        this.stopPropagation();
      },


      /**
       * Returns an array of native Touch objects representing all current touches on the document.
       * Returns an empty array for the "touchend" event.
       * 
       * @return {Object[]} Array of touch objects. For more information see: 
       *     http://developer.apple.com/safari/library/documentation/UserExperience/Reference/TouchClassReference/Touch/Touch.html
       */
      getAllTouches : function() {
        return this._native.touches;
      },


      /**
       * Returns an array of native Touch objects representing all touches associated with the event target element.
       * Returns an empty array for the "touchend" event.
       *
       * @return {Object[]} Array of touch objects. For more information see: 
       *     http://developer.apple.com/safari/library/documentation/UserExperience/Reference/TouchClassReference/Touch/Touch.html
       */
      getTargetTouches : function() {
          return this._native.targetTouches;
      },


      /**
       * Returns an array of native Touch objects representing all touches of the target element that changed in this event.
       *
       * On the "touchstart" event the array contains all touches that were added to the target element.
       * On the "touchmove" event the array contains all touches that were moved on the target element.
       * On the "touchend" event the array contains all touches that used to be on the target element.
       *
       * @return {Object[]} Array of touch objects. For more information see: 
       *     http://developer.apple.com/safari/library/documentation/UserExperience/Reference/TouchClassReference/Touch/Touch.html
       */
      getChangedTargetTouches : function() {
          return this._native.changedTouches;
      },


      /**
       * Checks whether more than one touch is associated with the event target element.
       * 
       * @return {Boolean} Is multi-touch
       */
      isMultiTouch : function() {
        return this.getTargetTouches().length > 1;
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
       * Returns an event specific touch. This function is used as the "touchend" event only
       * offers Touch objects in the changedTouches array. 
       *
       * @param touchIndex {Integer ? 0) The index of the Touch object to retrieve
       * @return {Object} A native Touch object
       */
      __getEventSpecificTouch : function(touchIndex)
      {
        touchIndex = touchIndex == null ? 0 : touchIndex;
        var isTouchEnd = this.getType() == "touchend" || this.getType() == "touchcancel";
        var touches = (isTouchEnd ? this.getChangedTargetTouches(): this.getTargetTouches());
        return touches[touchIndex];
      }
    }
  });
