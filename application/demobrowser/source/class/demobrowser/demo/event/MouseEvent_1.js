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

/* ************************************************************************

#use(qx.event.handler.Input)

************************************************************************ */

/**
 * Native mouse events
 */
qx.Class.define("demobrowser.demo.event.MouseEvent_1",
{
  extend : qx.application.Native,

  members :
  {
    main : function()
    {
      this.base(arguments);

      this.tableHead = "<table><tr><th>Target</th><th>Event</th><th>button</th><th>pageX</th><th>pageY</th><th>clientX</th><th>clientY</th><th>screenX</th><th>screenY</th><th>phase</th><th>relatedTarget</th></tr>";
      this.keyEvents = [];
      this.maxLogSize = 50;
      this.logDiv = document.getElementById("keylogger");

      this.initializeLogger();

      var mouseDiv = document.getElementById("mouse");

      var events = ["mousedown", "mouseup", "click", "dblclick", "contextmenu", "mousemove", "mouseover", "mouseout"];
      for (var i=0; i<events.length; i++)
      {
        var elem = document.getElementById("check_" + events[i])
        if (elem.checked) {
          qx.bom.Element.addListener(
            mouseDiv,
            events[i],
            this.logMouseEvent,
            this
          )
        }
        qx.bom.Element.addListener(elem, "change", this.__changeCheckbox, this);
      }

      var captureDiv = document.getElementById("capture");
      captureDiv.checked = false;
      qx.bom.Element.addListener(captureDiv, "change", function(e) {
        var checked = e.getTarget().checked;
        if (checked) {
          qx.bom.Element.capture(mouseDiv);
        } else {
          qx.bom.Element.releaseCapture(mouseDiv);
        }
      }, this);


      qx.bom.Element.addListener(
        mouseDiv,
        "losecapture",
        function(e) { captureDiv.checked = false; },
        this
      );

      /*
      qx.bom.Element.addListener(
        document.body,
        "selectstart",
        function(e) { e.preventDefault(); },
        this
      )
      */

      qx.bom.Element.addListener(
        document.getElementById("btnClear"),
        "click",
        this.initializeLogger,
        this
      );

    },


    __changeCheckbox : function(e)
    {
      var type = e.getTarget().id.split("_")[1];
      var checked = e.getTarget().checked;
      var mouseDiv = document.getElementById("mouse");

      if (checked) {
        qx.bom.Element.addListener(
          mouseDiv,
          type,
          this.logMouseEvent,
          this
        )
      }
      else
      {
        qx.bom.Element.removeListener(
          mouseDiv,
          type,
          this.logMouseEvent,
          this
        )

      }
    },


    initializeLogger: function()
    {
      this.logDiv.innerHTML = this.tableHead + "</table>";
      this.keyEvents = [];
    },


    logMouseEvent: function(mouseEvent)
    {
      mouseEvent.preventDefault();
      var eventCopy = {
        target: mouseEvent.getTarget().id,
        type: mouseEvent.getType(),
        button: mouseEvent.getButton(),
        documentX: mouseEvent.getDocumentLeft(),
        documentY: mouseEvent.getDocumentTop(),
        screenX: mouseEvent.getScreenLeft(),
        screenY: mouseEvent.getScreenTop(),
        viewportX: mouseEvent.getViewportLeft(),
        viewportY: mouseEvent.getViewportTop(),
        relatedTarget: mouseEvent.getRelatedTarget() ? mouseEvent.getRelatedTarget().id : "",
        phase: mouseEvent.getEventPhase()
      }
      this.keyEvents.unshift(eventCopy);
      this.keyEvents = this.keyEvents.slice(0, this.maxLogSize);
      str = [this.tableHead];
      for (var i=0; i<this.keyEvents.length; i++) {
        var e = this.keyEvents[i];
        str.push("<tr><td>");
        str.push(e.target);
        str.push("</td><td>");
        str.push(e.type);
        str.push("</td><td>");
        str.push(e.button);
        str.push("</td><td>");
        str.push(e.documentX);
        str.push("</td><td>");
        str.push(e.documentY);
        str.push("</td><td>");
        str.push(e.viewportX);
        str.push("</td><td>");
        str.push(e.viewportY);
        str.push("</td><td>");
        str.push(e.screenX);
        str.push("</td><td>");
        str.push(e.screenY);
        str.push("</td><td>");
        str.push(e.phase);
        str.push("</td><td>");
        str.push(e.relatedTarget);
        str.push("</td></tr>");
      }
      str.push("</table>");
      this.logDiv.innerHTML = str.join("");
      this.logDiv.scrollTop = 0;
    }

  }
});
