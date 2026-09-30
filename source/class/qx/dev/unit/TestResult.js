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
     * Daniel Wagner (d_wagner)

************************************************************************ */

/**
 * The test result class runs the test functions and fires events depending on
 * the result of the test run.
 */
qx.Class.define("qx.dev.unit.TestResult", {
  extend: qx.core.Object,

  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events: {
    /**
     * Fired before the test is started
     *
     * Event data: The test {@link qx.dev.unit.TestFunction}
     */
    startTest: "qx.event.type.Data",

    /** Fired after the test has finished
     *
     * Event data: The test {@link qx.dev.unit.TestFunction}
     */
    endTest: "qx.event.type.Data",

    /**
     * Fired if the test raised an {@link qx.core.AssertionError}
     *
     * Event data: The test {@link qx.dev.unit.TestFunction}
     */
    error: "qx.event.type.Data",

    /**
     * Fired if the test failed with a different exception
     *
     * Event data: The test {@link qx.dev.unit.TestFunction}
     */
    failure: "qx.event.type.Data",

    /**
     * Fired if an asynchronous test sets a timeout
     *
     * Event data: The test {@link qx.dev.unit.TestFunction}
     */
    wait: "qx.event.type.Data",

    /**
     * Fired if the test was skipped, e.g. because a requirement was not met.
     *
     * Event data: The test {@link qx.dev.unit.TestFunction}
     */
    skip: "qx.event.type.Data",

    /**
     * Fired if a performance test returned results.
     *
     * Event data: The test {@link qx.dev.unit.TestFunction}
     */
    endMeasurement: "qx.event.type.Data"
  },

  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics: {
    /**
     * Run a test function using a given test result
     *
     * @param testResult {qx.dev.unit.TestResult} The test result to use to run the test
     * @param test {qx.dev.unit.TestSuite|qx.dev.unit.TestFunction} The test
     * @param testFunction {var} The test function
     */
    run(testResult, test, testFunction) {
      testResult.run(test, testFunction);
    }
  },

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members: {
    _timeout: null,

    /**
     * Run the test
     *
     * @param test {qx.dev.unit.TestSuite|qx.dev.unit.TestFunction} The test
     * @param testFunction {Function} The test function
     * @param self {Object?} The context in which to run the test function
     * @param resume {Boolean?} Resume a currently waiting test
     *
     * @return {var} The return value of the test function
     */
    run(test, testFunction, self, resume) {
      if (!this._timeout) {
        this._timeout = {};
      }

      var testClass = test.getTestClass();
      if (!testClass.hasListener("assertionFailed")) {
        testClass.addListener("assertionFailed", ev => {
          var error = [
            {
              exception: ev.getData(),
              test: test
            }
          ];

          this.fireDataEvent("failure", error);
        });
      }

      if (resume && !this._timeout[test.getFullName()]) {
        this._timeout[test.getFullName()] = "failed";
        var qxEx = new qx.type.BaseError(
          "Error in asynchronous test",
          "resume() called before wait()"
        );

        this._createError("failure", [qxEx], test);
        this.fireDataEvent("endTest", test);
        return undefined;
      }

      this.fireDataEvent("startTest", test);

      if (qx.core.Environment.get("qx.debug.dispose")) {
        qx.dev.Debug.startDisposeProfiling();
      }

      if (this._timeout[test.getFullName()]) {
        if (this._timeout[test.getFullName()] !== "failed") {
          this._timeout[test.getFullName()].stop();
          this._timeout[test.getFullName()].dispose();
        }
        delete this._timeout[test.getFullName()];
      } else {
        try {
          var setUpResult = test.setUp();
          if (qx.lang.Type.isPromise(setUpResult)) {
            this.__waitForSetUp(test, setUpResult);
          }
        } catch (ex) {
          if (ex instanceof qx.dev.unit.AsyncWrapper) {
            if (this._timeout[test.getFullName()]) {
              // Do nothing if there's already a timeout for this test
              return;
            }

            if (ex.getDelay()) {
              var that = this;
              var defaultTimeoutFunction = function () {
                throw new qx.core.AssertionError(
                  "Asynchronous Test Error in setUp",
                  "Timeout of " +
                    ex.getDelay() +
                    " ms reached before resume() was called."
                );
              };
              var timeoutFunc = ex.getDeferredFunction()
                ? ex.getDeferredFunction()
                : defaultTimeoutFunction;
              var context = ex.getContext() ? ex.getContext() : window;
              this._timeout[test.getFullName()] = qx.event.Timer.once(
                function () {
                  this.run(test, timeoutFunc, context);
                },
                that,
                ex.getDelay()
              );

              this.fireDataEvent("wait", test);
            }
            return undefined;
          } else {
            /* Any exceptions in tearDown are likely caused by setUp having
             failed previously, so we'll ignore them. */
            this.__tearDownThen(test, function () {
              if (ex.classname == "qx.dev.unit.RequirementError") {
                this._createError("skip", [ex], test);
              } else {
                this.__prefixMessage(ex, "setUp failed");
                this._createError("error", [ex], test);
              }
              this.fireDataEvent("endTest", test);
            });

            return undefined;
          }
        }
      }

      var returnValue;

      try {
        returnValue = testFunction.call(self || window);
      } catch (ex) {
        var error = true;
        if (ex instanceof qx.dev.unit.AsyncWrapper) {
          if (this._timeout[test.getFullName()]) {
            // Do nothing if there's already a timeout for this test
            return;
          }

          if (ex.getDelay()) {
            var that = this;
            var defaultTimeoutFunction = function () {
              throw new qx.core.AssertionError(
                "Asynchronous Test Error",
                "Timeout of " +
                  ex.getDelay() +
                  " ms reached before resume() was called."
              );
            };
            var timeoutFunc = ex.getDeferredFunction()
              ? ex.getDeferredFunction()
              : defaultTimeoutFunction;
            var context = ex.getContext() ? ex.getContext() : window;
            this._timeout[test.getFullName()] = qx.event.Timer.once(
              function () {
                this.run(test, timeoutFunc, context);
              },
              that,
              ex.getDelay()
            );

            this.fireDataEvent("wait", test);
          }
        } else if (ex instanceof qx.dev.unit.MeasurementResult) {
          error = false;
          this._createError("endMeasurement", [ex], test);
        } else {
          this.__tearDownThen(test, function () {
            if (ex.classname == "qx.core.AssertionError") {
              this._createError("failure", [ex], test);
            } else if (ex.classname == "qx.dev.unit.RequirementError") {
              this._createError("skip", [ex], test);
            } else {
              this._createError("error", [ex], test);
            }
            this.fireDataEvent("endTest", test);
          });
        }
      }

      if (!error) {
        this.__tearDownThen(test, function (ex) {
          if (ex) {
            this.__prefixMessage(ex, "tearDown failed");
            this._createError("error", [ex], test);
          }
          this.fireDataEvent("endTest", test);
        });
      }

      /*
      if (!this._timeout[test.getFullName()]) {
        this.__removeListeners(test.getTestClass()[test.getName()]);
      }
      */

      return returnValue;
    },

    /**
     * Wait for a promise returned by <code>setUp</code>, then run the test.
     * A rejection is reported as a failed <code>setUp</code>.
     *
     * @param test {qx.dev.unit.TestFunction} The test
     * @param promise {Promise} The promise returned by <code>setUp</code>
     */
    __waitForSetUp(test, promise) {
      var inst = test.getTestClass();
      var that = this;
      promise.then(
        function () {
          inst.resumeSetUp();
        },
        function (reason) {
          inst.resume(function () {
            var ex = qx.dev.unit.TestFunction.toError(reason);
            if (
              !(ex instanceof qx.dev.unit.AsyncWrapper) &&
              ex.classname != "qx.dev.unit.RequirementError"
            ) {
              that.__prefixMessage(ex, "setUp failed");
            }
            throw ex;
          });
        }
      );

      // throws the AsyncWrapper that makes run() wait for resumeSetUp()
      inst.wait();
    },

    /**
     * Run {@link #tearDown}, then call <code>callback</code>. If tearDown
     * returns a promise, the callback is called when it has settled.
     *
     * @param test {qx.dev.unit.TestFunction} The test
     * @param callback {Function} Called in the context of this object with
     *   the exception of tearDown, or with <code>null</code>
     */
    __tearDownThen(test, callback) {
      var result;
      try {
        result = this.tearDown(test);
      } catch (ex) {
        callback.call(this, ex);
        return;
      }

      if (qx.lang.Type.isPromise(result)) {
        result.then(
          () => callback.call(this, null),
          reason =>
            callback.call(this, qx.dev.unit.TestFunction.toError(reason))
        );
      } else {
        callback.call(this, null);
      }
    },

    /**
     * Put a prefix in front of the message of an exception.
     *
     * @param ex {Error} The exception
     * @param prefix {String} The prefix, e.g. "setUp failed"
     */
    __prefixMessage(ex, prefix) {
      if (
        ex instanceof qx.type.BaseError &&
        ex.message == qx.type.BaseError.DEFAULTMESSAGE
      ) {
        ex.message = prefix;
      } else {
        ex.message = prefix + ": " + ex.message;
      }
    },

    /**
     * Fire an error event
     *
     * @param eventName {String} Name of the event
     * @param exceptions {Error[]} The exception(s), which caused the test to fail
     * @param test {qx.dev.unit.TestSuite|qx.dev.unit.TestFunction} The test
     */
    _createError(eventName, exceptions, test) {
      var errors = [];
      for (var i = 0, l = exceptions.length; i < l; i++) {
        // WebKit and Opera
        errors.push({
          exception: exceptions[i],
          test: test
        });
      }

      this.fireDataEvent(eventName, errors);
    },

    /**
     * Wraps the AUT's qx.event.Registration.addListener function so that it
     * stores references to all added listeners in an array attached to the
     * current test function. This is done so that any listeners left over after
     * test execution can be removed to make sure they don't influence other
     * tests.
     *
     * @param testFunction {qx.dev.unit.TestFunction} The current test
     */
    __wrapAddListener(testFunction) {
      testFunction._addedListeners = [];
      if (!qx.event.Registration.addListenerOriginal) {
        qx.event.Registration.addListenerOriginal =
          qx.event.Registration.addListener;
        qx.event.Registration.addListener = function (
          target,
          type,
          listener,
          self,
          capture
        ) {
          var listenerId = qx.event.Registration.addListenerOriginal(
            target,
            type,
            listener,
            self,
            capture
          );

          var store = true;
          if (
            (target.classname &&
              target.classname.indexOf("testrunner.unit") == 0) ||
            (self &&
              self.classname &&
              self.classname.indexOf("testrunner.unit") == 0)
          ) {
            store = false;
          }
          if (store) {
            testFunction._addedListeners.push([target, listenerId]);
          }
          return listenerId;
        };
      }
    },

    /**
     * Removes any listeners left over after a test's run.
     *
     * @param testFunction {qx.dev.unit.TestFunction} The current test
     */
    __removeListeners(testFunction) {
      // remove listeners added during test execution
      if (testFunction._addedListeners) {
        var listeners = testFunction._addedListeners;
        for (var i = 0, l = listeners.length; i < l; i++) {
          var target = listeners[i][0];
          var id = listeners[i][1];
          try {
            qx.event.Registration.removeListenerById(target, id);
          } catch (ex) {}
        }
      }
    },

    /**
     * Calls the generic tearDown method on the test class, then the specific
     * tearDown for the test, if one is defined.
     *
     * If one of them returns a promise, the next step waits for it.
     *
     * @param test {Object} The test object (first argument of {@link #run})
     * @return {Promise|undefined} A promise if tearDown is asynchronous
     */
    tearDown(test) {
      var testClass = test.getTestClass();
      var specificTearDown =
        "tearDown" + qx.lang.String.firstUp(test.getName());
      var steps = [
        () => test.tearDown(),
        () => testClass[specificTearDown] && testClass[specificTearDown](),
        () => this.__afterTearDown(test)
      ];

      var next = () => {
        while (steps.length) {
          var result = steps.shift()();
          if (qx.lang.Type.isPromise(result)) {
            return result.then(next);
          }
        }
        return undefined;
      };
      return next();
    },

    /**
     * Dispose the objects of the test and report undisposed objects.
     *
     * @param test {Object} The test object (first argument of {@link #run})
     */
    __afterTearDown(test) {
      var testClass = test.getTestClass();
      testClass.doAutoDispose();

      if (
        qx.core.Environment.get("qx.debug.dispose") &&
        qx.dev.Debug.disposeProfilingActive
      ) {
        var testName = test.getFullName();
        var undisposed = qx.dev.Debug.stopDisposeProfiling();
        for (var i = 0; i < undisposed.length; i++) {
          var trace;
          if (undisposed[i].stackTrace) {
            trace = undisposed[i].stackTrace.join("\n");
          }
          window.top.qx.log.Logger.warn(
            "Undisposed object in " +
              testName +
              ": " +
              undisposed[i].object.classname +
              "[" +
              undisposed[i].object.toHashCode() +
              "]" +
              "\n" +
              trace
          );
        }
      }
    }
  },

  destruct() {
    this._timeout = null;
  }
});
