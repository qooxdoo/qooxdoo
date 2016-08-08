/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */


/**
 * Keyhandler test converted to use the low level event API.
 *
 * @tag noPlayground
 */
qx.Class.define("demobrowser.demo.event.KeyEvent_LowLevel",
{
  extend : demobrowser.demo.event.EventDemo,

  members :
  {
    main : function()
    {
      this.base(arguments);

      this.debug(qx.core.Environment.get("engine.version"));

      this._initLogger(
          ["Event", "key code", "char code", "key identifier", "Shift", "Ctrl", "Alt"],
          document.getElementById("logger"),
          50
        );

      var events = ["keydown", "keypress", "keyup"];
      for (var i=0; i<events.length; i++)
      {
        qx.bom.Event.addNativeListener(
          document.documentElement,
          events[i],
          qx.lang.Function.bind(this.logKeyEvent, this)
        )
      }
    },

    logKeyEvent: function(keyEvent)
    {
      var type = keyEvent.type;
      this._log([
        type,
        keyEvent.keyCode,
        keyEvent.charCode,
        keyEvent.keyIdentifier || "",
        keyEvent.shiftKey,
        keyEvent.ctrlKey,
        keyEvent.altKey
      ]);

      qx.bom.Event.preventDefault(keyEvent);
    }
  }
});
