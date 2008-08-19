/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Common base class for all native events (DOM events, IO events, ...).
 */
qx.Class.define("qx.event.type.Native",
{
  extend : qx.event.type.Event,

  members :
  {
    /**
     * Initialize the fields of the event. The event must be initialized before
     * it can be dispatched.
     *
     * @param nativeEvent {Event} The DOM event to use
     * @param target {Object} The event target
     * @param relatedTarget {Object?null} The related event target
     * @param canBubble {Boolean?false} Whether or not the event is a bubbling event.
     *     If the event is bubbling, the bubbling can be stopped using
     *     {@link #stopPropagation}
     * @param cancelable {Boolean?false} Whether or not an event can have its default
     *     action prevented. The default action can either be the browser's
     *     default action of a native event (e.g. open the context menu on a
     *     right click) or the default action of a qooxdoo class (e.g. close
     *     the window widget). The default action can be prevented by calling
     *     {@link #preventDefault}
     * @return {qx.event.type.Event} The initialized event instance
     */
    init : function(nativeEvent, target, relatedTarget, canBubble, cancelable)
    {
      this.base(arguments, canBubble, cancelable);

      this._target = target || qx.bom.Event.getTarget(nativeEvent);
      this._relatedTarget = relatedTarget || qx.bom.Event.getRelatedTarget(nativeEvent);

      if (nativeEvent.timeStamp) {
        this._timeStamp = nativeEvent.timeStamp;
      }

      this._native = nativeEvent;

      return this;
    },


    // overridden
    clone : function(embryo)
    {
      var clone = this.base(arguments, embryo);

      clone._native = this._native;

      return clone;
    },


    /**
     * Prevent browser default behavior, e.g. opening the context menu, ...
     */
    preventDefault : function()
    {
      this.base(arguments);
      qx.bom.Event.preventDefault(this._native);
    },


    /**
     * Stops event from all further processing. Execute this when the
     * current handler should have "exclusive rights" to the event
     * and no further reaction by anyone else should happen.
     */
    stop : function()
    {
      this.stopPropagation();
      this.preventDefault();
    },


    /**
     * Get the native browser event object of this event.
     *
     * @return {Event} The native browser event
     */
    getNativeEvent : function() {
      return this._native;
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeFields("_native");
  }
});
