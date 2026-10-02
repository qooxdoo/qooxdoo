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

qx.Class.define("qx.test.util.Function", {
  extend: qx.dev.unit.TestCase,
  include: qx.dev.unit.MMock,

  members: {
    /*
     * The debounced callback runs on a setInterval tick. With real timers a
     * busy browser can run the test's own wait() timeout before that tick,
     * so the tests drive a fake clock instead.
     */
    setUp() {
      this.getSandbox().useFakeTimers();
    },

    tearDown() {
      this.getSandbox().restore();
    },

    testDebounce() {
      var clock = this.getSandbox().clock;
      var test = this.stub();

      var debouncedTest = qx.util.Function.debounce(test, 10);

      debouncedTest(true);
      this.assertNotCalled(test);
      debouncedTest(false);

      // first tick only notices the calls, the second one fires
      clock.tick(10);
      this.assertNotCalled(test);
      clock.tick(10);
      this.assertCalledOnce(test);
      this.assertCalledWith(test, false);

      // the interval is cleared, nothing fires later
      clock.tick(250);
      this.assertCalledOnce(test);
    },

    testImmediateDebounce() {
      var clock = this.getSandbox().clock;
      var test = this.stub();

      var debouncedTest = qx.util.Function.debounce(test, 10, true);

      debouncedTest(true);
      this.assertCalled(test);
      this.assertCalledWith(test, true);

      debouncedTest(false);
      debouncedTest(true);
      debouncedTest(false);

      clock.tick(250);
      this.assertCalledTwice(test);
      this.assertCalledWith(test, false);
    }
  }
});
