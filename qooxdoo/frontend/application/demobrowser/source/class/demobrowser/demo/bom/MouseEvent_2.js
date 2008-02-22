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

#require(qx.event.dispatch.Direct)
#require(qx.event.dispatch.DomBubbling)
#require(qx.event.handler.Keyboard)
#require(qx.event.handler.Mouse)
#require(qx.event.handler.Element)
#require(qx.event.handler.Input)
#require(qx.event.handler.ViewportLeave)

************************************************************************ */

qx.Class.define("demobrowser.demo.bom.MouseEvent_2",
{
  extend : demobrowser.Demo,

  members :
  {
    main : function()
    {
      this.base(arguments);

      this.tableHead =
        "<table><tr><th>Target</th><th>Event</th><th>button</th>"+
        "<th>viewportX</th><th>viewportY</th><th>phase</th><th>relatedTarget</th></tr>";

  		this.keyEvents = [];
  		this.maxLogSize = 50;
  		this.logDiv = document.getElementById("keylogger");

  		this.initializeLogger();

      var mouseDiv = document.getElementById("mouse");

      var innerMouse = document.getElementById("innerMouse1");

      qx.event.Registration.addListener(
        window,
        "viewportleave",
        function(e) {
          innerMouse.style.backgroundColor = "red";
        },
        this
      );

      qx.event.Registration.addListener(
        window,
        "viewportenter",
        function(e) {
          innerMouse.style.backgroundColor = "green";
        },
        this
      );


      qx.event.Registration.addListener(
        document.body,
        "mouseout",
        this.logMouseEvent,
        this
      );

      qx.event.Registration.addListener(
        document.body,
        "mouseover",
        this.logMouseEvent,
        this
      );


      qx.event.Registration.addListener(
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
        qx.event.Registration.addListener(
          mouseDiv,
          type,
          this.logMouseEvent,
          this
        )
      }
      else
      {
        qx.event.Registration.removeListener(
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
        target: mouseEvent.getTarget().tagName + ":" + mouseEvent.getTarget().id,
				type: mouseEvent.getType(),
				button: mouseEvent.getButton(),
        /*
        documentX: mouseEvent.getDocumentLeft(),
        documentY: mouseEvent.getDocumentTop(),
				screenX: mouseEvent.getScreenLeft(),
        screenY: mouseEvent.getScreenTop(),
        */
        viewportX: mouseEvent.getViewportLeft(),
        viewportY: mouseEvent.getViewportTop(),

        relatedTarget: mouseEvent.getRelatedTarget() ? mouseEvent.getRelatedTarget().tagName + ":" + mouseEvent.getRelatedTarget().id: "null",
        phase: mouseEvent.getEventPhase()
			}

      /*
      if (eventCopy.relatedTarget != null && eventCopy.type == "mouseout") {
        debugger;
      }
      */


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
				/*
        str.push("</td><td>");
				str.push(e.documentX);
				str.push("</td><td>");
				str.push(e.documentY);
				*/
				str.push("</td><td>");
				str.push(e.viewportX);
				str.push("</td><td>");
				str.push(e.viewportY);
        /*
				str.push("</td><td>");
				str.push(e.screenX);
				str.push("</td><td>");
				str.push(e.screenY);
				*/
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
