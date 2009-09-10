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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Keyhandler test converted to use the low level event API.
 */
qx.Class.define("demobrowser.demo.event.KeyEvent",
{
  extend : demobrowser.demo.event.EventDemo,

  members :
  {
    main : function()
    {
      this.base(arguments);

      this._initLogger(
        ["Event", "Key identifier", "Char code", "Shift", "Ctrl", "Alt"],
        document.getElementById("logger"),
        50
      );

      var events = ["keydown", "keypress", "keyup", "keyinput"];
      for (var i=0; i<events.length; i++)
      {
        qx.bom.Element.addListener(
          document.documentElement,
          events[i],
          this.logKeyEvent,
          this
        )
      }
    },


    logKeyEvent: function(keyEvent)
    {
      var type = keyEvent.getType();
      this._log([
        type,
        type !== "keyinput" ? keyEvent.getKeyIdentifier() : "",
        type == "keyinput" ? keyEvent.getCharCode() : "",
        keyEvent.isShiftPressed(),
        keyEvent.isAltPressed(),
        keyEvent.isCtrlPressed()
      ]);
      keyEvent.preventDefault();
    }
  }
});
