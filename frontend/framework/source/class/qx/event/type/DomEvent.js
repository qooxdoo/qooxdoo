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

#module(event2)

************************************************************************ */

/**
 * Common base class for all DOM events.
 */
qx.Class.define("qx.event.type.DomEvent",
{
  extend : qx.event.type.Event,

  members :
  {

    init : function(domEvent)
    {
      this.base(arguments, domEvent.type, domEvent.bubbles);
      this._target = domEvent.target || domEvent.srcElement;

      if (domEvent.timeStamp) {
        this._timeStamp = domEvent.timeStamp;
      }

      this._event = domEvent;
      return this;
    },


    /**
     * Prevent browser default behaviour, e.g. opening the context menu, ...
     */
    preventDefault : function() {
      if (this._event.preventDefault) {
        this._event.preventDefault();
      }
      this._event.returnValue = false;
    },


    // overridden
    stopPropagation :  function()
    {
      if (this._event.stopPropagation) {
        this._event.stopPropagation();
      }

      // MSDN doccumantation http://msdn2.microsoft.com/en-us/library/ms533545.aspx
      this._event.cancelBubble = true;
      this._stopPropagation = true;
    },


    /**
     * Returns whether the the ctrl key is pressed.
     *
     * @type member
     * @return {Boolean} whether the the ctrl key is pressed.
     */
    isCtrlPressed : function() {
      return this._event.ctrlKey;
    },


    /**
     * Returns whether the the shift key is pressed.
     *
     * @type member
     * @return {Boolean} whether the the shift key is pressed.
     */
    isShiftPressed : function() {
      return this._event.shiftKey;
    },


    /**
     * Returns whether the the alt key is pressed.
     *
     * @type member
     * @return {Boolean} whether the the alt key is pressed.
     */
    isAltPressed : function() {
      return this._event.altKey;
    },


    /**
     * Returns whether the the meta key is pressed.
     *
     * @type member
     * @return {Boolean} whether the the meta key is pressed.
     */
    isMetaPressed : function() {
      return this._event.metaKey;
    },


    /**
     * Returns whether the ctrl key or (on the Mac) the command key is pressed.
     *
     * TODO: Better name or remove at all. If we want the identical behavior cross
     * platform this is OK, but this is part of the widget or even application logic
     * We should move it into there.
     *
     * @deprecated: Use isMetaPressed or isCtrlPressed instead.
     * @type member
     * @return {Boolean} <code>true</code> if the command key is pressed on the Mac
     *             or the ctrl key is pressed on another system.
     */
    isCtrlOrCommandPressed : function()
    {
      if (qx.core.Client.getInstance().runsOnMacintosh()) {
        return this._event.metaKey;
      } else {
        return this._event.ctrlKey;
      }
    }

  }
});

