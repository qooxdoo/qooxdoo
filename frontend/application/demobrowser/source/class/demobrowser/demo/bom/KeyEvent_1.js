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
qx.Class.define("demobrowser.demo.bom.KeyEvent_1",
{
  extend : qx.application.Native,

  members :
  {
    main : function()
    {
      this.base(arguments);

      // Call demo mixin init
      this.initDemo();

      this.tableHead =
        "<table><tr>" +
        "<th>Event</th>" +
        "<th>key identifier</th>" +
        "<th>Shift</th>" +
        "<th>Ctrl</th>" +
        "<th>Alt</th>" +
        "</tr>";
      this.keyEvents = [];
      this.maxLogSize = 50;
      this.logDiv = document.getElementById("keylogger");

      this.initializeLogger();

      var events = ["keydown", "keypress", "keyup"];
      for (var i=0; i<events.length; i++)
      {
        qx.bom.Element.addListener(
          document.documentElement,
          events[i],
          this.logKeyEvent,
          this
        )
      }

      qx.bom.Element.addListener(
        document.getElementById("btnClear"),
        "click",
        this.initializeLogger,
        this
      );

    },

    initializeLogger: function()
    {
      this.logDiv.innerHTML = this.tableHead + "</table>";
      this.keyEvents = [];
    },

    logKeyEvent: function(keyEvent)
    {
      var type = keyEvent.getType();
      var eventCopy = {
        type: keyEvent.getType(),
        iden: keyEvent.getKeyIdentifier(),
        shift: keyEvent.isShiftPressed(),
        alt: keyEvent.isAltPressed(),
        ctrl: keyEvent.isCtrlPressed()
      }
      this.keyEvents.unshift(eventCopy);
      this.keyEvents = this.keyEvents.slice(0, this.maxLogSize);
      str = [this.tableHead];
      for (var i=0; i<this.keyEvents.length; i++) {
        var e = this.keyEvents[i];
        str.push("<tr><td>");
        str.push(e.type);
        str.push("</td><td>");
        str.push(e.iden);
        str.push("</td><td>");
        str.push(e.shift);
        str.push("</td><td>");
        str.push(e.ctrl);
        str.push("</td><td>");
        str.push(e.alt);
        str.push("</td></tr>");
      }
      str.push("</table>");
      this.logDiv.innerHTML = str.join("");
      this.logDiv.scrollTop = 0;
    }
  }
});
