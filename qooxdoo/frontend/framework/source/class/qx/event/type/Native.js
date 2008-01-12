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

/* ************************************************************************

#module(event)

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
     * @type member
     * @param nativeEvent {Event} The DOM event to use
     * @param type {String} Type of the event (overrides native event type)
     * @return {qx.event.type.Event} The initialized event instance
     */
    init : function(nativeEvent, type)
    {
      this.base(arguments, type || nativeEvent.type, nativeEvent.bubbles);

      this._target = nativeEvent.target || nativeEvent.srcElement;

      if (nativeEvent.timeStamp) {
        this._timeStamp = nativeEvent.timeStamp;
      }

      this._native = nativeEvent;

      return this;
    },


    // overridden
    clone : function()
    {
      var clone = this.base(arguments);
      clone._native = this._native;
      return clone;
    },


    /**
     * Prevent browser default behaviour, e.g. opening the context menu, ...
     *
     * @type member
     * @return {void}
     */
    preventDefault : function()
    {
      if (this._native.preventDefault) {
        this._native.preventDefault();
      }

      this._native.returnValue = false;
    },


    /**
     * Stops the propagation of the event
     *
     * @type member
     * @return {void}
     */
    stopPropagation : function()
    {
      if (this._native.stopPropagation) {
        this._native.stopPropagation();
      }

      // MSDN doccumantation http://msdn2.microsoft.com/en-us/library/ms533545.aspx
      this._native.cancelBubble = true;
      this._stopPropagation = true;
    },


    /**
     * Get the native browser event object of this event.
     *
     * @return {Event} The native browser event
     * @internal
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
