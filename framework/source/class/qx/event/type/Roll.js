/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2014 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)

************************************************************************ */


/**
 * Roll event object.
 */
qx.Class.define("qx.event.type.Roll",
{
    extend : qx.event.type.Pointer,


    members : {
      // overridden
      stop : function()
      {
        this.stopPropagation();
        this.preventDefault();
      },


      // overridden
      _cloneNativeEvent : function(nativeEvent, clone)
      {
        var clone = this.base(arguments, nativeEvent, clone);

        clone.delta = nativeEvent.delta;
        clone.momentum = nativeEvent.momentum;

        return clone;
      },


      /**
       * Boolean flag to indicate if this event was triggered by a momentum.
       * @return {Boolean} <code>true</code>, if the event is momentum based
       */
      getMomentum : function() {
        return this._native.momentum;
      },


      /**
       * Stops the momentum events.
       */
      stopMomentum : function() {
        var target = this.getTarget();

        // in qx.mobile, the target can be null
        if (!target) {
          target = qx.bom.Event.getTarget(this.getNativeEvent());
        }

        qx.event.Registration.getManager(target || window)
          .getHandler(qx.event.handler.Gesture)
          .stopMomentum();
      },


      /**
       * Returns a map with the calculated delta coordinates and axis,
       * relative to the last <code>roll</code> event.
       *
       * @return {Map} a map with contains the delta as <code>x</code> and
       * <code>y</code>
       */
      getDelta : function() {
        return this._native.delta;
      }
    }
});
