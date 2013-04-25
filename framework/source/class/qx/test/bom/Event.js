/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Alexander Steitz (aback)

************************************************************************ */

qx.Class.define("qx.test.bom.Event",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    testSupportsEvent : function()
    {
      var eventsToCheck = [ "click",
                            "mousedown",
                            "mousemove",
                            "mouseup",
                            "mouseout" ];

      var el;
      for (var i=0, j=eventsToCheck.length; i<j; i++) {
        el = qx.dom.Element.create("div", {name: "vanillebaer"}, window);
        qx.bom.Event.addNativeListener(el, eventsToCheck[i], function(e) {
          qx.log.Logger.info("done");
        });
        this.assertTrue(qx.bom.Event.supportsEvent(el, eventsToCheck[i]), "Failed to check support for '" + eventsToCheck[i] + "'");
      }

      var el2 = qx.dom.Element.create("div", {name: "schokobaer"}, window);
      this.assertFalse(qx.bom.Event.supportsEvent(el2, "click2"));

      if (qx.core.Environment.get("event.mspointer")) {
        var pointerEventsToCheck = [ "MSPointerDown",
                                     "MSPointerUp",
                                     "MSPointerOut",
                                     "MSPointerOver",
                                     "MSPointerCancel",
                                     "MSPointerMove" ];

        for (var i=0, j=pointerEventsToCheck.length; i<j; i++) {
          el = qx.dom.Element.create("div", {name: "vanillebaer"}, window);
          qx.bom.Event.addNativeListener(el, pointerEventsToCheck[i], function(e) {
            qx.log.Logger.info("done");
          });
          this.assertTrue(qx.bom.Event.supportsEvent(el, pointerEventsToCheck[i]), "Failed to check support for '" + pointerEventsToCheck[i] + "'");
        }
      }
    }
  }
});