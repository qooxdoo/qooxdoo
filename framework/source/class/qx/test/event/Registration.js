/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * @ignore(Foo)
 */
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
    },


    /**
     * @ignore(Foo)
     */
    "test addListenerOnce: same callback": function() {
      qx.Class.define("Foo", {
        extend: qx.core.Object,
        events: {
          "bar": "qx.event.type.Event"
        },
        members: {
          fireBar: function() {
            this.fireDataEvent("bar");
          }
        }
      });

      var f1 = new Foo();
      var f2 = new Foo();

      var called = {};
      called[f1.toHashCode()] = 0;
      called[f2.toHashCode()] = 0;

      var callback = function(e) {
        called[this.toHashCode()]++;
      };

      f1.addListenerOnce("bar", callback, f1);
      f2.addListenerOnce("bar", callback, f2);

      f1.fireBar();
      f2.fireBar();
      f1.fireBar();
      f2.fireBar();

      this.assertEquals(1, called[f1.toHashCode()]);
      this.assertEquals(1, called[f2.toHashCode()]);
    }
  }
});
