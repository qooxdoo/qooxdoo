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
 * Common functions to access the state of modifier keys.
 */
qx.Mixin.define("qx.event.type.MModifierKeys",
{
  members :
  {
    /**
     * Returns whether the the ctrl key is pressed.
     *
     * @type member
     * @return {Boolean} whether the the ctrl key is pressed.
     */
    isCtrlPressed : function() {
      return this._dom.ctrlKey;
    },


    /**
     * Returns whether the the shift key is pressed.
     *
     * @type member
     * @return {Boolean} whether the the shift key is pressed.
     */
    isShiftPressed : function() {
      return this._dom.shiftKey;
    },


    /**
     * Returns whether the the alt key is pressed.
     *
     * @type member
     * @return {Boolean} whether the the alt key is pressed.
     */
    isAltPressed : function() {
      return this._dom.altKey;
    },


    /**
     * Returns whether the the meta key is pressed.
     *
     * @type member
     * @return {Boolean} whether the the meta key is pressed.
     */
    isMetaPressed : function() {
      return this._dom.metaKey;
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
        return this._dom.metaKey;
      } else {
        return this._dom.ctrlKey;
      }
    }

  }
});

