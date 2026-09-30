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
     * Run an inner test and call <code>check</code> with its results when
     * the inner test has ended.
     *
     * @param members {Map} Methods of the inner test case: "testInner" and
     *   optionally "setUp" and "tearDown"
     * @param check {Function} Called with an array of
     *   <code>{type, message}</code> maps (failure, error and skip events)
     *   and the inner test case
     */
    __runInner(members, check) {
      var inner = new qx.dev.unit.TestCase();
      Object.assign(inner, members);
      var testFunction = new qx.dev.unit.TestFunction(inner, "testInner");
      var testResult = new qx.dev.unit.TestResult();
      this.addAutoDispose(testResult);
      this.addAutoDispose(testFunction);
      this.addAutoDispose(inner);

      var events = [];
      ["failure", "error", "skip"].forEach(function (type) {
        testResult.addListener(type, function (e) {
          events.push({
            type: type,
            message: String(e.getData()[0].exception.message)
          });
        });
      });

      var ended = false;
      testResult.addListener("endTest", () => {
        if (ended) {
          return;
        }
        ended = true;
        // resume in a new task: the outer test may not be waiting yet
        window.setTimeout(() => {
          this.resume(function () {
            check.call(this, events, inner);
          });
        }, 0);
      });

      testFunction.run(testResult);
      this.wait(5000);
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
