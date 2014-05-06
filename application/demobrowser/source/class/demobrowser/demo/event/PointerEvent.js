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


************************************************************************ */

/**
 * Pointer events
 * @tag noPlayground
 *
 * @use(qx.event.handler.Input)
 */
qx.Class.define("demobrowser.demo.event.PointerEvent",
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

      var pointerDiv = document.getElementById("pointer");

      var events = ["pointerdown", "pointerup", "tap", "dbltap", "longtap", "pointermove", "pointerover", "pointerout", "swipe", "track", "rotate", "pinch"];
      for (var i=0; i<events.length; i++)
      {
        var elem = document.getElementById("check_" + events[i]);
        if (elem.checked) {
          qx.bom.Element.addListener(
            pointerDiv,
            events[i],
            this.logPointerEvent,
            this
          );
        }
        qx.bom.Element.addListener(elem, "change", this.__changeCheckbox, this);
      }

      var captureDiv = document.getElementById("capture");
      captureDiv.checked = false;
      qx.bom.Element.addListener(captureDiv, "change", function(e) {
        var checked = e.getTarget().checked;
        if (checked) {
          qx.bom.Element.capture(pointerDiv);
        } else {
          qx.bom.Element.releaseCapture(pointerDiv);
        }
      }, this);


      qx.bom.Element.addListener(
        pointerDiv,
        "losecapture",
        function(e) { captureDiv.checked = false; },
        this
      );
    },


    __changeCheckbox : function(e)
    {
      var type = e.getTarget().id.split("_")[1];
      var checked = e.getTarget().checked;
      var pointerDiv = document.getElementById("pointer");

      if (checked) {
        qx.bom.Element.addListener(
          pointerDiv,
          type,
          this.logPointerEvent,
          this
        );
      }
      else
      {
        qx.bom.Element.removeListener(
          pointerDiv,
          type,
          this.logPointerEvent,
          this
        );

      }
    },


    logPointerEvent: function(pointerEvent)
    {
      pointerEvent.preventDefault();

      this._log([
        pointerEvent.getTarget().id,
        pointerEvent.getType(),
        pointerEvent.getButton(),
        pointerEvent.getDocumentLeft(),
        pointerEvent.getDocumentTop(),
        pointerEvent.getScreenLeft(),
        pointerEvent.getScreenTop(),
        pointerEvent.getViewportLeft(),
        pointerEvent.getViewportTop(),
        pointerEvent.getRelatedTarget() ? pointerEvent.getRelatedTarget().id : ""
      ]);
    }

  }
});