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
 * @ignore(qx.test.Single.getInstance, qx.test.Single)
 */
qx.Class.define("qx.test.core.Object",
{
  extend : qx.dev.unit.TestCase,
  include : qx.dev.unit.MMock,

  events :
  {
    "test" : "qx.event.type.Event",

    "test2" : "qx.event.type.Event"
  },

  members :
  {
    testHasListener : function()
    {
      var listener = function() {};
      this.assertFalse(this.hasListener("testHasListener", false));
      this.assertFalse(this.hasListener("testHasListener2", false));

      this.addListener("testHasListener", listener, this, false);
      this.assertTrue(this.hasListener("testHasListener", false));
      this.assertFalse(this.hasListener("testHasListener2", false));

      this.addListener("testHasListener2", listener, this, false);
      this.assertTrue(this.hasListener("testHasListener", false));
      this.assertTrue(this.hasListener("testHasListener2", false));

      this.removeListener("testHasListener", listener, this, false);
      this.removeListener("testHasListener2", listener, this, false);
      this.assertFalse(this.hasListener("testHasListener", false));
      this.assertFalse(this.hasListener("testHasListener2", false));
    },


    testAddListener : function()
    {
      var listener = function() {};
      this.addListener("testAddListener", listener, this, false);
      this.assertTrue(this.hasListener("testAddListener", false));
      this.removeListener("testAddListener", listener, this, false);
      this.assertFalse(this.hasListener("testAddListener", false));
    },


    testAddListenerOnce : function()
    {
      var listener = function() {};
      this.addListenerOnce("testAddListenerOnce", listener, this, false);
      this.assertTrue(this.hasListener("testAddListenerOnce", false));
      this.removeListener("testAddListenerOnce", listener, this, false);
      this.assertFalse(this.hasListener("testAddListenerOnce", false));
    },


    testAddListenerOnceWithSameListener : function()
    {
      var called = 0;
      var listener = function() {
        // debugger;
        called++;
      };
      this.addListenerOnce("test", listener);
      this.addListenerOnce("test2", listener);
      this.fireEvent("test");
      this.assertEquals(1, called);
      this.fireEvent("test");
      this.assertEquals(1, called);
    },


    testAddListenerOnceWithDifferentContext : function()
    {
      var called = 0;
      var listener = function() {
        // debugger;
        called++;
      };
      var context1 = {name: "context1"};
      var context2 = {name: "context2"};
      this.addListenerOnce("test", listener, context1);
      this.addListenerOnce("test", listener, context2);
      this.fireEvent("test");
      this.assertEquals(2, called);
    },


    testRemoveListenerById : function()
    {
      var id = this.addListener("testRemoveListenerById", function() {}, this, false);
      this.assertTrue(this.hasListener("testRemoveListenerById", false));
      this.removeListenerById(id);
      this.assertFalse(this.hasListener("testRemoveListenerById", false));
    },


    testRemoveListenerOnceById : function()
    {
      var id = this.addListenerOnce("testRemoveListenerOnceById", function() {}, this, false);
      this.assertTrue(this.hasListener("testRemoveListenerOnceById", false));
      this.removeListenerById(id);
      this.assertFalse(this.hasListener("testRemoveListenerOnceById", false));
    },


    testUserData : function()
    {
      var o = new qx.core.Object();

      this.assertNull(o.getUserData("foo"));

      o.setUserData("foo", "bar");
      this.assertEquals("bar", o.getUserData("foo"));

      this.assertNull(o.getUserData("bar"));

      o.dispose();
    },


    testRemoveListenerByIdAsync: function() {
      var executed = false;
      var id = this.addListener("testRemoveListenerByIdAsync", function() {
        executed = true;
      }, this);
      this.removeListenerById(id);

      this.fireEvent("testRemoveListenerByIdAsync");

      var self = this;
      window.setTimeout(function() {
        self.resume(function() {
          this.assertFalse(executed, "Event has been executed.");
        }, self);
      }, 3000);

      this.wait();
    },


    testFireDataEvent: function()
    {
      var self = this;
      var data = [];
      data.push({value: "a", old: "b"});
      data.push({value: "a", old: ""});
      data.push({value: 1, old: 0});
      data.push({value: 12, old: -123});
      data.push({value: true, old: false});
      data.push({value: false, old: true});
      data.push({value: /^a/, old: null});
      data.push({value: ["a"], old: []});

      var emitter = new qx.test.core.EventEmitterDummy();

      for (var i = 0; i < data.length; i++) {
        this.assertEventFired(emitter, "eventName", function() {
          emitter.fireDataEvent("eventName", data[i].value, data[i].old);
        }, function(e) {
          self.assertEquals(data[i].value, e.getData());
          self.assertEquals(data[i].old, e.getOldData());
        });
      }
      emitter.dispose();
    },


    testFireEventTypeCheck : function()
    {
      if (!this.isDebugOn()) {
        return;
      }

      var emitter = new qx.test.core.EventEmitterDummy();
      emitter.addListener("plain", (function() {}));
      emitter.addListener("error", (function() {}));
      emitter.addListener("data", (function() {}));

      // store error logger
      var oldError = qx.log.Logger.error;
      var called = 0;
      qx.log.Logger.error = function() {
        called += 1;
      };

      emitter.fireEvent("plain", qx.event.type.Event);
      this.assertEquals(0, called);

      emitter.fireEvent("error", qx.event.type.Event);
      this.assertEquals(1, called);

      emitter.fireEvent("data", qx.event.type.Event);
      this.assertEquals(2, called);

      emitter.fireEvent("data", qx.event.type.Data);
      this.assertEquals(2, called);

      qx.log.Logger.error = oldError;
      emitter.dispose();
    },


    testDisposeObject : function()
    {
      // regular object dispose
      var o = new qx.core.Object();
      o.o = new qx.core.Object();
      o._disposeObjects("o");
      this.assertNull(o.o);

      // check if a dispose of not existent object works
      o._disposeObjects("x");

      // object dispose with a singleton
      qx.Class.define("qx.test.Single", {
        extend : qx.core.Object,
        type : "singleton"
      });
      o.dispose();

      var o = new qx.core.Object();
      o.s = qx.test.Single.getInstance();
      this.assertException(function() {
        o._disposeObjects("s");
      });
      qx.Class.undefine("qx.test.Single");
      o.dispose();
    },


    testDisposeBindingWithChain : function()
    {
      // object dispose with a singleton
      qx.Class.define("qx.test.Single", {
        extend : qx.core.Object,
        properties : {
          a: {event: "changeA", nullable: true}
        }
      });
      var o = new qx.test.Single();
      var o2 = new qx.test.Single();
      var o3 = new qx.test.Single();

      o.bind("a.a", o2, "a");
      o.setA(o3);

      this.assertEquals(1, o.getBindings().length);

      o.dispose();

      this.assertEquals(0, o.getBindings().length);
      this.assertEventNotFired(o2, "changeA", function() {
        o3.setA("affe");
      });

      o2.dispose();
      o3.dispose();

      qx.Class.undefine("qx.test.Single");
    },

    testDisposeBindingWithSelfChain : function()
    {
      // object dispose with a singleton
      qx.Class.define("qx.test.Single", {
        extend : qx.core.Object,
         properties : {
          a: {event: "changeA", nullable: true},
          b: {event: "changeB", nullable: true, apply: "applyB"}
        },
        members : {
          applyB : function() {},
          init : function() {
            this.bind("a.a", this, "b");
          }
        }
      });
      var o = new qx.test.Single();
      var o2 = new qx.test.Single();

      var spy = this.spy(o, "applyB");
      o.init();
      o.setA(o2);

      this.assertEquals(1, o.getBindings().length);

      o.dispose();
      o2.setA("affe");

      this.assertEquals(0, o.getBindings().length);
      this.assertCalledOnce(spy);

      o2.dispose();

      qx.Class.undefine("qx.test.Single");
    },


    testDisposeBinding : function() {
      // object dispose with a singleton
      qx.Class.define("qx.test.Single", {
        extend : qx.core.Object,
        properties : {
          a: {event: "changeA", nullable: true},
          b: {event: "changeB", nullable: true}
        }
      });
      var o = new qx.test.Single();
      var o2 = new qx.test.Single();

      o.bind("a", o2, "a");
      o.bind("a", o, "b");
      o2.bind("a", o, "a");

      this.assertEquals(3, o.getBindings().length);
      this.assertEquals(2, o2.getBindings().length);

      o.dispose();
      o2.dispose();

      qx.Class.undefine("qx.test.Single");

      this.assertEquals(0, o.getBindings().length);
      this.assertEquals(0, o2.getBindings().length);
    },


    testDisposeSingletonObject : function()
    {
      // object dispose with a singleton and an object
      qx.Class.define("qx.test.Single", {
        extend : qx.core.Object,
        type : "singleton"
      });

      var o = new qx.core.Object();
      o.o = new qx.core.Object();
      o.s = qx.test.Single.getInstance();
      o._disposeSingletonObjects("o", "s");
      this.assertTrue(o.o == null);
      this.assertTrue(o.s == null);

      qx.Class.undefine("qx.test.Single");
      o.dispose();
    },


    /**
     * @ignore(qx.test.MyClass)
     */
    testIsPropertyInitialized : function()
    {
      qx.Class.define("qx.test.MyClass", {
        extend : qx.core.Object,
        properties :
        {
          a : {},
          b : {init : false}
        }
      });
      var o = new qx.test.MyClass();

      this.assertFalse(o.isPropertyInitialized("a"));
      o.setA(false);
      this.assertTrue(o.isPropertyInitialized("a"));
      this.assertTrue(o.isPropertyInitialized("b"));

      qx.Class.undefine("qx.test.MyClass");
      o.dispose();
    }
  }
});
