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
     * Tino Butz (tbtz)

************************************************************************ */


/**
 * EXPERIMENTAL - NOT READY FOR PRODUCTION
 *
 * Swipe event object.
 */
qx.Class.define("qx.event.type.Swipe",
{
    extend : qx.event.type.Touch,


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

        clone.swipe = nativeEvent.swipe;

        return clone;
      },


      // overridden
      _isTouchEnd : function() {
        return true;
      },


      /**
       * Returns the start time of the performed swipe.
       *
       * @return {Integer} the start time
       */
      getStartTime : function() {
        return this._native.swipe.startTime;
      },


      /**
       * Returns the duration the performed swipe took.
       *
       * @return {Integer} the duration
       */
      getDuration : function() {
        return this._native.swipe.duration;
      },


      /**
       * Returns whether the performed swipe was on the x or y axis.
       *
       * @return {String} "x"/"y" axis
       */
      getAxis : function() {
        return this._native.swipe.axis;
      },


      /**
       * Returns the direction of the performed swipe in reference to the axis.
       * y = up / down
       * x = left / right
       *
       * @return {String} the direction
       */
      getDirection : function() {
        return this._native.swipe.direction;
      },


      /**
       * Returns the velocity of the performed swipe.
       *
       * @return {Number} the velocity
       */
      getVelocity : function() {
        return this._native.swipe.velocity;
      },


      /**
       * Returns the distance of the performed swipe.
       *
       * @return {Integer} the distance
       */
      getDistance : function() {
        return this._native.swipe.distance;
      }
    }
  });
