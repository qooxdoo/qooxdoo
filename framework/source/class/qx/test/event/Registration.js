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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("qx.test.event.Registration",
{
  extend : qx.dev.unit.TestCase,

  events :
  {
    "$test" : "qx.event.type.Event"
  },

  members :
  {
    testAddRemoveListener : function()
    {
      var target = this;
      var type = "$test";
      var capture = false;

      var Reg = qx.event.Registration;
      var mgr = Reg.getManager(target);

      var handler = mgr.findHandler(target, type);
      this.assertInstance(handler, qx.test.event.MockHandler);

      var fired = [false, false];
      var listener1 = function(e) { fired[0] = true; };
      var listener2 = function(e) { fired[1] = true; };


      // first add with this type/target
      handler.calls = [];

      Reg.addListener(target, type, listener1, this, capture);

      this.assertEquals(1, handler.calls.length);
      this.assertArrayEquals(["registerEvent", target, type, capture], handler.calls[0]);

      Reg.fireEvent(target, type, qx.event.type.Event, []);
      this.assertArrayEquals([true, false], fired);


      // second add with this type/target
      handler.calls = [];
      fired = [false, false];

      Reg.addListener(target, type, listener2, this, capture);

      this.assertEquals(0, handler.calls.length);
      Reg.fireEvent(target, type, qx.event.type.Event, []);
      this.assertArrayEquals([true, true], fired);


      // remove first handler
      handler.calls = [];
      fired = [false, false];

      Reg.removeListener(target, type, listener1, this, capture);

      this.assertEquals(0, handler.calls.length);
      Reg.fireEvent(target, type, qx.event.type.Event, []);
      this.assertArrayEquals([false, true], fired);


      // remove second handler
      handler.calls = [];
      fired = [false, false];

      Reg.removeListener(target, type, listener2, this, capture);

      this.assertEquals(1, handler.calls.length);
      this.assertArrayEquals(["unregisterEvent", target, type, capture], handler.calls[0]);

      Reg.fireEvent(target, type, qx.event.type.Event, []);
      this.assertArrayEquals([false, false], fired);
    },


    testAddRemoveListenerById : function()
    {
      var target = this;
      var type = "$test";
      var capture = false;

      var Reg = qx.event.Registration;
      var mgr = Reg.getManager(target);

      var handler = mgr.findHandler(target, type);

      var fired = [false, false];
      var listener1 = function(e) { fired[0] = true; };
      var listener2 = function(e) { fired[1] = true; };

      var id1 = Reg.addListener(target, type, listener1, this, capture);
      this.assertNotNull(id1);

      var id2 = Reg.addListener(target, type, listener2, this, capture);
      this.assertNotNull(id2);

      // remove first handler
      handler.calls = [];
      fired = [false, false];

      Reg.removeListenerById(target, id1);
      this.assertEquals(0, handler.calls.length);

      Reg.fireEvent(target, type, qx.event.type.Event, []);
      this.assertArrayEquals([false, true], fired);


      // remove second handler
      handler.calls = [];
      fired = [false, false];

      Reg.removeListenerById(target, id2);

      this.assertEquals(1, handler.calls.length);
      this.assertArrayEquals(["unregisterEvent", target, type, capture], handler.calls[0]);

      Reg.fireEvent(target, type, qx.event.type.Event, []);
      this.assertArrayEquals([false, false], fired);
    }
  }
});
