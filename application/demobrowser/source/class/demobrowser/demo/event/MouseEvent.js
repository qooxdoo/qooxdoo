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
qx.Class.define("demobrowser.demo.event.MouseEvent",
{
  extend : demobrowser.demo.event.EventDemo,

  members :
  {
    main : function()
    {
      this.base(arguments);

      this._initLogger(
        ["Target", "Event", "button", "pageX", "pageY", "clientX", "clientY", "screenX", "screenY", "relatedTarget"],
        document.getElementById("logger"),
        50
      );

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


    logMouseEvent: function(mouseEvent)
    {
      mouseEvent.preventDefault();

      this._log([
        mouseEvent.getTarget().id,
        mouseEvent.getType(),
        mouseEvent.getButton(),
        mouseEvent.getDocumentLeft(),
        mouseEvent.getDocumentTop(),
        mouseEvent.getScreenLeft(),
        mouseEvent.getScreenTop(),
        mouseEvent.getViewportLeft(),
        mouseEvent.getViewportTop(),
        mouseEvent.getRelatedTarget() ? mouseEvent.getRelatedTarget().id : ""
      ]);
    }

  }
});
