/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

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
 * Common base class for all DOM events.
 */
qx.Class.define("qx.event.type.DomEvent",
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
     * @return {qx.event.type.Event} The initialized event instance
     */
    init : function(nativeEvent)
    {
      this.base(arguments, nativeEvent.type, nativeEvent.bubbles);

      this._target = nativeEvent.target || nativeEvent.srcElement;

      if (nativeEvent.timeStamp) {
        this._timeStamp = nativeEvent.timeStamp;
      }

      this._native = nativeEvent;

      return this;
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
     * Returns whether the the ctrl key is pressed.
     *
     * @type member
     * @return {Boolean} whether the the ctrl key is pressed.
     */
    isCtrlPressed : function() {
      return this._native.ctrlKey;
    },


    /**
     * Returns whether the the shift key is pressed.
     *
     * @type member
     * @return {Boolean} whether the the shift key is pressed.
     */
    isShiftPressed : function() {
      return this._native.shiftKey;
    },


    /**
     * Returns whether the the alt key is pressed.
     *
     * @type member
     * @return {Boolean} whether the the alt key is pressed.
     */
    isAltPressed : function() {
      return this._native.altKey;
    },


    /**
     * Returns whether the the meta key is pressed.
     *
     * @type member
     * @return {Boolean} whether the the meta key is pressed.
     */
    isMetaPressed : function() {
      return this._native.metaKey;
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
