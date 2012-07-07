/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("qx.test.event.dispatch.MouseCapture",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    setUp : function()
    {
      var root = qx.dom.Element.create("div", {id: "root"});
      document.body.appendChild(root);

      // root
      //   c_1
      //     c_1_1
      //   c_2

      root.innerHTML =
        "<div id='c_1'>" +
        "<div id='c_1_1'></div>" +
        "</div>" +
        "<div id='c_2'>"

      this.c_1 = document.getElementById("c_1");
      this.c_1_1 = document.getElementById("c_1_1");
      this.c_2 = document.getElementById("c_2");

      var registration = {
        removeManager : function() {},
        getHandlers : function() {
          return [qx.test.event.dispatch.TestingHandler];
        },
        getDispatchers : function() {
          return [
            qx.event.dispatch.MouseCapture,
            qx.event.dispatch.DomBubbling,
            qx.event.dispatch.Direct
          ];
        },
        fireEvent : function(target, type, clazz, args) {
          var event = qx.event.Registration.createEvent(type, clazz, args);
          return manager.dispatchEvent(target, event)
        }
      };

      this.window = new qx.test.event.dispatch.TestingWindow();

      var manager = this.manager = new qx.event.Manager(this.window, registration);
      this.capture = this.manager.getDispatcher(qx.event.dispatch.MouseCapture);

      this.called = [];
      this.manager.addListener(this.c_1, "mousemove", this.logEvent, this);
      this.manager.addListener(this.c_1_1, "mousemove", this.logEvent, this);
      this.manager.addListener(this.c_2, "mousemove", this.logEvent, this);
    },


    tearDown : function()
    {
      var Reg = qx.event.Registration;

      Reg.removeAllListeners(this.c_1);
      Reg.removeAllListeners(this.c_1_1);
      Reg.removeAllListeners(this.c_2);

      document.body.removeChild(document.getElementById("root"));

      this.manager.dispose();
      this.window.dispose();
    },


    logEvent : function(e) {
      this.called.push(e.getCurrentTarget().id);
    },


    onLoseCapture : function() {
      this.called.push("losecapture");
    },


    fire : function(target, type, bubble)
    {
      var event = qx.event.Registration.createEvent(type, qx.event.type.Event, [bubble !== false]);
      this.manager.dispatchEvent(target, event);
    },


    testNoCapture : function()
    {
      this.fire(this.c_1_1, "mousemove");
      this.assertEquals("c_1_1,c_1", this.called.join(","));
    },


    testContainerCapture : function()
    {
      this.capture.activateCapture(this.c_1, true);

      this.called = [];
      this.fire(this.c_1, "mousemove");
      this.assertEquals("c_1", this.called.join(","));

      this.called = [];
      this.fire(this.c_1_1, "mousemove");
      this.assertEquals("c_1", this.called.join(","));

      this.called = [];
      this.fire(this.c_2, "mousemove");
      this.assertEquals("c_1", this.called.join(","));
    },


    testNoContainerCapture : function()
    {
      this.capture.activateCapture(this.c_1, false);

      this.called = [];
      this.fire(this.c_1, "mousemove");
      this.assertEquals("c_1", this.called.join(","));

      this.called = [];
      this.fire(this.c_1_1, "mousemove");
      this.assertEquals("c_1_1,c_1", this.called.join(","));

      this.called = [];
      this.fire(this.c_2, "mousemove");
      this.assertEquals("c_1", this.called.join(","));
    },


    testCaptureBubbling : function()
    {
      this.capture.activateCapture(this.c_1_1, true);

      this.called = [];
      this.fire(this.c_1, "mousemove");
      this.assertEquals("c_1_1,c_1", this.called.join(","));
    },


    testLoseCaptureOnClick : function()
    {
      this.manager.addListener(this.c_1, "losecapture", this.onLoseCapture, this);
      this.capture.activateCapture(this.c_1, true);

      this.called = [];
      this.fire(this.c_1, "mousemove");
      this.fire(this.c_2, "click");
      this.assertEquals("c_1,losecapture", this.called.join(","));
    },


    testLoseCaptureOnWindowBlur : function()
    {
      this.manager.addListener(this.c_1, "losecapture", this.onLoseCapture, this);
      this.capture.activateCapture(this.c_1, true);

      this.called = [];
      this.fire(this.c_1, "mousemove");
      this.fire(this.window, "blur", false);
      this.assertEquals("c_1,losecapture", this.called.join(","));
    },


    testLoseCaptureOnWindowFocus : function()
    {
      this.manager.addListener(this.c_1, "losecapture", this.onLoseCapture, this);
      this.capture.activateCapture(this.c_1, true);

      this.called = [];
      this.fire(this.c_1, "mousemove");
      this.fire(this.window, "focus", false);
      this.assertEquals("c_1,losecapture", this.called.join(","));
    },


    testLoseCaptureOnWindowScroll : function()
    {
      this.manager.addListener(this.c_1, "losecapture", this.onLoseCapture, this);
      this.capture.activateCapture(this.c_1, true);

      this.called = [];
      this.fire(this.c_1, "mousemove");
      this.fire(this.window, "scroll", false);
      this.assertEquals("c_1,losecapture", this.called.join(","));
    },


    testLoseCaptureOnCaptureChange : function()
    {
      this.manager.addListener(this.c_1, "losecapture", this.onLoseCapture, this);
      this.capture.activateCapture(this.c_1, true);

      this.called = [];
      this.fire(this.c_1, "mousemove");
      this.capture.activateCapture(this.c_2, true);
      this.assertEquals("c_1,losecapture", this.called.join(","));
    }
  }
});
