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
qx.Class.define("demobrowser.demo.event.KeyEventLowLevel_1",
{
  extend : qx.application.Native,

  members :
  {
    main : function()
    {
      this.base(arguments);

      this.debug(qx.bom.client.Engine.VERSION);
      this.debug(qx.bom.client.Engine.FULLVERSION);

      this.tableHead =
        "<table><tr>" +
        "<th>Event</th>" +
        "<th>key code</th>" +
        "<th>char code</th>" +
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
        qx.bom.Event.addNativeListener(
          document.documentElement,
          events[i],
          qx.lang.Function.bind(this.logKeyEvent, this)
        )
      }

      qx.bom.Event.addNativeListener(
        document.getElementById("btnClear"),
        "click",
        qx.lang.Function.bind(this.initializeLogger, this)
      );

    },

    initializeLogger: function()
    {
      this.logDiv.innerHTML = this.tableHead + "</table>";
      this.keyEvents = [];
    },

    logKeyEvent: function(keyEvent)
    {
      var type = keyEvent.type;
      var eventCopy = {
        type: keyEvent.type,
        keyCode: keyEvent.keyCode,
        charCode: keyEvent.charCode,
        keyIdentifier: keyEvent.keyIdentifier || "",
        shift: keyEvent.shiftKey,
        control: keyEvent.ctrlKey,
        alt: keyEvent.altKey
      }

      this.keyEvents.unshift(eventCopy);
      this.keyEvents = this.keyEvents.slice(0, this.maxLogSize);
      str = [this.tableHead];
      for (var i=0; i<this.keyEvents.length; i++) {
        var e = this.keyEvents[i];
        str.push("<tr><td>");
        str.push(e.type);
        str.push("</td><td>");
        str.push(e.keyCode);
        str.push("</td><td>");
        str.push(e.charCode);
        str.push("</td><td>");
        str.push(e.keyIdentifier);
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
