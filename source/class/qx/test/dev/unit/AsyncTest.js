/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2026 OETIKER+PARTNER AG

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tobias Oetiker (oetiker)

************************************************************************ */

/**
 * Tests for test methods, setUp and tearDown that return a promise.
 *
 * The inner tests are plain functions which return a promise, as a
 * transpiled <code>async</code> method does. Each one runs in its own
 * {@link qx.dev.unit.TestResult}, and the outer test checks the events.
 */
qx.Class.define("qx.test.dev.unit.AsyncTest", {
  extend: qx.dev.unit.TestCase,

  members: {
    /**
     * Run inner tests one after the other and call <code>check</code> with
     * their results when the last one has ended.
     *
     * @param members {Map} Methods of the inner test case: the tests and
     *   optionally "setUp", "tearDown" and "tearDown&lt;Name&gt;"
     * @param check {Function} Called with an array of
     *   <code>{type, message, test}</code> maps (failure, error and skip
     *   events), the inner test case and the names of the tests in the
     *   order of their "endTest" events
     * @param options {Map?} <code>names</code>: the tests to run (default
     *   <code>["testInner"]</code>), <code>settle</code>: milliseconds to
     *   wait after the last test has ended before <code>check</code> is
     *   called, <code>tearDownTimeout</code>: see
     *   {@link qx.dev.unit.TestResult#tearDownTimeout}
     */
    __runInner(members, check, options) {
      options = options || {};
      var names = options.names || ["testInner"];
      var inner = new qx.dev.unit.TestCase();
      Object.assign(inner, members);
      var testResult = new qx.dev.unit.TestResult();
      if (options.tearDownTimeout) {
        testResult.setTearDownTimeout(options.tearDownTimeout);
      }
      this.addAutoDispose(testResult);
      this.addAutoDispose(inner);
      var testFunctions = names.map(name => {
        var testFunction = new qx.dev.unit.TestFunction(inner, name);
        this.addAutoDispose(testFunction);
        return testFunction;
      });

      var events = [];
      ["failure", "error", "skip"].forEach(function (type) {
        testResult.addListener(type, function (e) {
          events.push({
            type: type,
            message: String(e.getData()[0].exception.message),
            test: e.getData()[0].test.getName()
          });
        });
      });

      var ended = [];
      testResult.addListener("endTest", e => {
        ended.push(e.getData().getName());
        if (ended.length < names.length) {
          window.setTimeout(() => {
            testFunctions[ended.length].run(testResult);
          }, 0);
        } else if (ended.length == names.length) {
          // resume in a new task: the outer test may not be waiting yet
          window.setTimeout(() => {
            this.resume(function () {
              check.call(this, events, inner, ended);
            });
          }, options.settle || 0);
        }
      });

      testFunctions[0].run(testResult);
      this.wait(2000);
    },

    __delay(ms) {
      return new Promise(function (resolve) {
        window.setTimeout(resolve, ms);
      });
    },

    testPromiseResolves() {
      var delay = this.__delay;
      this.__runInner(
        {
          testInner() {
            return delay(50).then(() => {
              this.done = true;
            });
          }
        },

        function (events, inner) {
          this.assertArrayEquals([], events);
          this.assertTrue(inner.done, "test ended before its promise");
        }
      );
    },

    testFailedAssertionAfterAwait() {
      var delay = this.__delay;
      this.__runInner(
        {
          testInner() {
            return delay(10).then(() => {
              this.assertEquals(1, 2, "late assertion");
            });
          }
        },

        function (events) {
          this.assertEquals(1, events.length, JSON.stringify(events));
          this.assertEquals("failure", events[0].type);
          this.assertMatch(events[0].message, /found '2'/);
        }
      );
    },

    testRejectionIsError() {
      var delay = this.__delay;
      this.__runInner(
        {
          testInner() {
            return delay(10).then(function () {
              throw new Error("rejected");
            });
          }
        },

        function (events) {
          this.assertEquals(1, events.length, JSON.stringify(events));
          this.assertEquals("error", events[0].type);
          this.assertEquals("rejected", events[0].message);
        }
      );
    },

    testRejectionWithoutError() {
      this.__runInner(
        {
          testInner() {
            return Promise.reject();
          }
        },

        function (events) {
          this.assertEquals(1, events.length, JSON.stringify(events));
          this.assertEquals("error", events[0].type);
          this.assertEquals("Promise rejected: undefined", events[0].message);
        }
      );
    },

    testWaitAfterAwait() {
      var delay = this.__delay;
      this.__runInner(
        {
          testInner() {
            return delay(10).then(() => {
              this.wait(10, () => {
                this.waited = true;
              });
            });
          }
        },

        function (events, inner) {
          this.assertArrayEquals([], events);
          this.assertTrue(inner.waited, "deferred function not called");
        }
      );
    },

    testAsyncSetUp() {
      var delay = this.__delay;
      this.__runInner(
        {
          setUp() {
            return delay(50).then(() => {
              this.ready = true;
            });
          },
          testInner() {
            this.assertTrue(this.ready, "test ran before setUp finished");
          }
        },

        function (events) {
          this.assertArrayEquals([], events);
        }
      );
    },

    testAsyncSetUpWithAsyncTest() {
      var delay = this.__delay;
      this.__runInner(
        {
          setUp() {
            return delay(10);
          },
          testInner() {
            return delay(10).then(() => {
              this.assertEquals(1, 2, "late assertion");
            });
          }
        },

        function (events) {
          this.assertEquals(1, events.length, JSON.stringify(events));
          this.assertEquals("failure", events[0].type);
        }
      );
    },

    testAsyncSetUpRejects() {
      var delay = this.__delay;
      this.__runInner(
        {
          setUp() {
            return delay(10).then(function () {
              throw new Error("no connection");
            });
          },
          testInner() {
            this.ran = true;
          }
        },

        function (events, inner) {
          this.assertEquals(1, events.length, JSON.stringify(events));
          this.assertEquals("error", events[0].type);
          this.assertEquals("setUp failed: no connection", events[0].message);
          this.assertUndefined(inner.ran, "test ran after setUp failed");
        }
      );
    },

    testAsyncTearDown() {
      var delay = this.__delay;
      this.__runInner(
        {
          testInner() {},
          tearDown() {
            return delay(50).then(() => {
              this.cleanedUp = true;
            });
          }
        },

        function (events, inner) {
          this.assertArrayEquals([], events);
          this.assertTrue(inner.cleanedUp, "test ended before tearDown");
        }
      );
    },

    testAsyncTearDownTimeout() {
      this.__runInner(
        {
          testInner() {},
          tearDownTestInner() {
            return new Promise(function () {});
          },
          testNext() {}
        },

        function (events, inner, ended) {
          this.assertJsonEquals(
            [
              {
                type: "error",
                message: "tearDown did not finish within 50 ms",
                test: "testInner"
              }
            ],
            events
          );
          this.assertArrayEquals(["testInner", "testNext"], ended);
        },
        { names: ["testInner", "testNext"], tearDownTimeout: 50 }
      );
    },

    testAsyncTearDownRejects() {
      var delay = this.__delay;
      this.__runInner(
        {
          testInner() {},
          tearDown() {
            return delay(10).then(function () {
              throw new Error("still open");
            });
          }
        },

        function (events) {
          this.assertEquals(1, events.length, JSON.stringify(events));
          this.assertEquals("error", events[0].type);
          this.assertEquals("tearDown failed: still open", events[0].message);
        }
      );
    }
  }
});
