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
 * @ignore(WeakRef)
 */

/* global Foo, WeakRef */
qx.Class.define("qx.test.event.Registration", {
  extend: qx.dev.unit.TestCase,

  events: {
    $test: "qx.event.type.Event"
  },

  members: {
    testAddRemoveListener() {
      var target = this;
      var type = "$test";
      var capture = false;

      var Reg = qx.event.Registration;
      var mgr = Reg.getManager(target);

      var handler = mgr.findHandler(target, type);
      this.assertInstance(handler, qx.test.event.MockHandler);

      var fired = [false, false];
      var listener1 = function (e) {
        fired[0] = true;
      };
      var listener2 = function (e) {
        fired[1] = true;
      };

      // first add with this type/target
      handler.calls = [];

      Reg.addListener(target, type, listener1, this, capture);

      this.assertEquals(1, handler.calls.length);
      this.assertArrayEquals(
        ["registerEvent", target, type, capture],
        handler.calls[0]
      );

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
      this.assertArrayEquals(
        ["unregisterEvent", target, type, capture],
        handler.calls[0]
      );

      Reg.fireEvent(target, type, qx.event.type.Event, []);
      this.assertArrayEquals([false, false], fired);
    },

    testAddRemoveListenerById() {
      var target = this;
      var type = "$test";
      var capture = false;

      var Reg = qx.event.Registration;
      var mgr = Reg.getManager(target);

      var handler = mgr.findHandler(target, type);

      var fired = [false, false];
      var listener1 = function (e) {
        fired[0] = true;
      };
      var listener2 = function (e) {
        fired[1] = true;
      };

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
      this.assertArrayEquals(
        ["unregisterEvent", target, type, capture],
        handler.calls[0]
      );

      Reg.fireEvent(target, type, qx.event.type.Event, []);
      this.assertArrayEquals([false, false], fired);
    },

    /**
     * Defines the target class the addListenerOnce tests fire on, on first use:
     * the compiler takes one class per file, and several tests need it.
     *
     * @ignore(Foo)
     */
    __defineFoo() {
      if (!qx.Class.getByName("Foo")) {
        qx.Class.define("Foo", {
          extend: qx.core.Object,
          events: {
            bar: "qx.event.type.Event"
          },

          members: {
            fireBar() {
              this.fireDataEvent("bar");
            },

            /** A listener shared by every instance, as in BUG #10887 */
            onBar(e) {}
          }
        });
      }
    },

    /**
     * @param target {qx.core.Object} the event target
     * @param type {String} name of the event type
     * @return {Integer} registrations the event registry holds for the bubbling
     *   phase of that type
     */
    __countListeners(target, type) {
      var listeners = qx.event.Registration.getManager(target).getListeners(
        target,
        type,
        false
      );

      return listeners ? listeners.length : 0;
    },

    /**
     * The invariant {@link qx.core.MEvent#addListenerOnce} has to keep: the
     * registry entry is the only place a registration lives, so once it has
     * ended nothing is left on the listener function, which may be shared
     * between targets and would then outlive every one of them [BUG #10887],
     * and nothing is left on the target either.
     *
     * @param listener {Function} the function passed to addListenerOnce
     * @param target {qx.core.Object} the event target
     * @param targetKeys {String[]} the target's own keys before the registration
     * @return {String[]} what the registration left outside the registry
     */
    __stateOutsideRegistry(listener, target, targetKeys) {
      return Object.keys(listener).concat(
        Object.keys(target).filter(key => !targetKeys.includes(key))
      );
    },

    "test addListenerOnce: same callback"() {
      this.__defineFoo();

      var f1 = new Foo();
      var f2 = new Foo();

      var called = {};
      called[f1.toHashCode()] = 0;
      called[f2.toHashCode()] = 0;

      var callback = function (e) {
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
    },

    "test addListenerOnce: the registration is gone once it has fired"() {
      this.__defineFoo();
      var target = new Foo();
      target.toHashCode(); // the hash is not leftover state, so take it first
      var targetKeys = Object.keys(target);

      var calls = 0;
      var listener = function (e) {
        calls++;
      };

      target.addListenerOnce("bar", listener, target);
      this.assertEquals(1, this.__countListeners(target, "bar"));

      target.fireBar();
      target.fireBar();

      this.assertEquals(1, calls, "the listener did not run exactly once");
      this.assertEquals(
        0,
        this.__countListeners(target, "bar"),
        "the fired registration is still in the registry"
      );

      var left = this.__stateOutsideRegistry(listener, target, targetKeys);
      this.assertArrayEquals(
        [],
        left,
        "firing left [" + left.join(", ") + "] outside the registry"
      );

      target.dispose();
    },

    "test addListenerOnce: the registration is gone after removeListener"() {
      this.__defineFoo();
      var target = new Foo();
      target.toHashCode();
      var targetKeys = Object.keys(target);

      var calls = 0;
      var listener = function (e) {
        calls++;
      };

      target.addListenerOnce("bar", listener, target);
      this.assertTrue(target.removeListener("bar", listener, target));

      target.fireBar();

      this.assertEquals(0, calls, "the removed listener ran");
      this.assertEquals(
        0,
        this.__countListeners(target, "bar"),
        "the removed registration is still in the registry"
      );

      var left = this.__stateOutsideRegistry(listener, target, targetKeys);
      this.assertArrayEquals(
        [],
        left,
        "removeListener left [" + left.join(", ") + "] outside the registry"
      );

      target.dispose();
    },

    "test addListenerOnce: the registration is gone after removeListenerById"() {
      this.__defineFoo();
      var target = new Foo();
      target.toHashCode();
      var targetKeys = Object.keys(target);

      var calls = 0;
      var listener = function (e) {
        calls++;
      };

      var id = target.addListenerOnce("bar", listener, target);
      this.assertTrue(target.removeListenerById(id));

      target.fireBar();

      this.assertEquals(0, calls, "the removed listener ran");
      this.assertEquals(
        0,
        this.__countListeners(target, "bar"),
        "the removed registration is still in the registry"
      );

      var left = this.__stateOutsideRegistry(listener, target, targetKeys);
      this.assertArrayEquals(
        [],
        left,
        "removeListenerById left [" + left.join(", ") + "] outside the registry"
      );

      target.dispose();
    },

    "test addListenerOnce: the same listener added twice for one type"() {
      this.__defineFoo();
      var target = new Foo();

      var calls = 0;
      var listener = function (e) {
        calls++;
      };

      target.addListenerOnce("bar", listener, target);
      target.addListenerOnce("bar", listener, target);

      this.assertEquals(
        2,
        this.__countListeners(target, "bar"),
        "the second registration replaced the first"
      );

      // one call removes every registration that matches, wrapped or not
      this.assertTrue(target.removeListener("bar", listener, target));

      this.assertEquals(
        0,
        this.__countListeners(target, "bar"),
        "a registration survived removeListener"
      );

      target.fireBar();
      this.assertEquals(0, calls, "a removed listener ran");

      target.dispose();
    },

    async "test addListenerOnce: a shared listener does not retain its targets"() {
      if (typeof WeakRef !== "function" || typeof window.gc !== "function") {
        this.skip("needs WeakRef and a browser started with --expose-gc");
      }

      this.__defineFoo();
      var listener = Foo.prototype.onBar;
      var refs = [];
      var target;

      for (var i = 0; i < 20; i++) {
        target = new Foo();
        target.addListenerOnce("bar", listener, target);
        if (i % 2) {
          target.fireBar();
        }
        refs.push(new WeakRef(target));
        target.dispose();
      }
      target = null;

      // a WeakRef keeps its target alive for the rest of the current job
      await new Promise(resolve => window.setTimeout(resolve, 50));
      window.gc();

      var alive = refs.filter(ref => ref.deref() !== undefined);

      this.assertEquals(
        0,
        alive.length,
        alive.length + " of 20 disposed targets are still reachable"
      );
    },

    /**
     * Registers two listeners that record that they ran.
     *
     * @param ran {Array} collects the name of every listener that ran
     * @return {qx.data.Array} the target the listeners were added to
     */
    __targetWithTwoListeners(ran) {
      var target = new qx.data.Array();

      target.addListener("change", function (e) {
        ran.push("A");
      });

      target.addListener("change", function (e) {
        ran.push("B");
      });

      return target;
    },

    "test getListeners: the result is a copy"() {
      var ran = [];
      var target = this.__targetWithTwoListeners(ran);
      var manager = qx.event.Registration.getManager(target);

      var copy = manager.getListeners(target, "change", false);
      this.assertEquals(2, copy.length);
      copy.splice(0, 1);
      delete copy[0];
      copy.length = 0;

      target.push(1);
      this.assertEquals("AB", ran.join(""), "a listener was unregistered");
      this.assertEquals(
        2,
        manager.getListeners(target, "change", false).length,
        "the registry was changed"
      );

      target.dispose();
    }
  }
});
