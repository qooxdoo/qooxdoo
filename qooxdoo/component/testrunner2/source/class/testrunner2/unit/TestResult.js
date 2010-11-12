/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (d_wagner)

************************************************************************ */

/**
 * This TestResultData class does not throw exceptions raised by test code,
 * instead storing them in an array attached to the test function itself. This
 * ensures that the entire body of each test function is executed.
 * 
 * It also supports an additional "skipped" state for tests that aren't run 
 * because infrastructure requirements are not met.
 */
qx.Class.define("testrunner2.unit.TestResult", {

  extend : qx.dev.unit.TestResult,
  
  
  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */
  events :
  {
    /**
     * Fired if the test was skipped, e.g. because a requirement was not met.
     *
     * Event data: The test {@link qx.dev.unit.TestFunction}
     */
    skip : "qx.event.type.Data"
  },
  
  
  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */
  members :
  {
    _timeout : null,
    
    run : function(test, testFunction, self, resume)
    {
      /* EXPERIMENTAL
      if (!resume) {
        var testInst = test.getTestClass();
        testInst.__addedListeners = [];
        if (!qx.event.Registration.addListenerOriginal) {
          qx.event.Registration.addListenerOriginal = qx.event.Registration.addListener;
          qx.event.Registration.addListener = function(target, type, listener, self, capture) {
            var listenerId =  qx.event.Registration.addListenerOriginal(target, type, listener, self, capture);
            var store = true;
            if ( (target.classname && target.classname.indexOf("testrunner2.unit") == 0) 
                 || (self && self.classname && self.classname.indexOf("testrunner2.unit") == 0) ) {
              store = false;              
            }
            if (store) {
              //console.log("adding listener " + target.toString() + " " + type);
              testInst.__addedListeners.push([target, listenerId]);
            }
            return listenerId;          
          }
        }
      }
      */
      
      if(!this._timeout) {
        this._timeout = {};
      }

      if (resume && !this._timeout[test.getFullName()]) {
        this._timeout[test.getFullName()] = "failed";
        var qxEx = new qx.type.BaseError("Error in asynchronous test", "resume() called before wait()");
        this._createError("failure", qxEx, test);
        return;
      }
      
      // delete any exceptions stored in a previous run
      if (test.getTestClass()[test.getName()]._exceptions) {
        test.getTestClass()[test.getName()]._exceptions = [];
      }

      this.fireDataEvent("startTest", test);

      if (this._timeout[test.getFullName()])
      {
        if (this._timeout[test.getFullName()] !== "failed") {
          this._timeout[test.getFullName()].stop();
        }
        delete this._timeout[test.getFullName()];
      }
      else
      {
        try {
          test.setUp();
        }
        catch(ex)
        {
          try {
            this.tearDown(test);
          }
          catch(ex) {
            /* Any exceptions here are likely caused by setUp having failed
               previously, so we'll ignore them. */ 
          }
          var qxEx = new qx.type.BaseError("Error setting up test: " + ex.name, ex.message);
          this._createError("error", qxEx, test);
          return;
        }
      }

      try {
        testFunction.call(self || window);
      }
      catch(ex)
      {
        var error = true;
        if (ex instanceof qx.dev.unit.AsyncWrapper)
        {

          if (this._timeout[test.getFullName()]) {
            // Do nothing if there's already a timeout for this test
            return;
          }

          if (ex.getDelay()) {
            var that = this;
            var defaultTimeoutFunction = function() {
              throw new qx.core.AssertionError(
                "Asynchronous Test Error",
                "Timeout reached before resume() was called."
              );
            }
            var timeoutFunc = (ex.getDeferredFunction() ? ex.getDeferredFunction() : defaultTimeoutFunction);
            var context = (ex.getContext() ? ex.getContext() : window);
            this._timeout[test.getFullName()] = qx.event.Timer.once(function() {
               this.run(test, timeoutFunc, context);
            }, that, ex.getDelay());
            this.fireDataEvent("wait", test);
          }

        } else if (ex.classname == "qx.core.AssertionError") {
          try {
            this.tearDown(test);
          } catch(except) {}
          this._createError("failure", ex, test);
        } else if (ex.classname == "qx.dev.unit.RequirementError") {
            this._createError("skip", ex, test);
          } else {
          try {
            this.tearDown(test);
          } catch(except) {}
          this._createError("error", ex, test);
        }
      }
      
      var savedExceptions = test.getTestClass()[test.getName()]._exceptions;
      if (savedExceptions && savedExceptions.length > 0) {
        var error = true;
        try {
          this.tearDown(test);
        } catch(except) {}
        this._createError("failure", savedExceptions[0], test);
      }

      if (!error)
      {
        try {
          this.tearDown(test);
          this.fireDataEvent("endTest", test);
        } catch(ex) {
          var qxEx = new qx.type.BaseError("Error tearing down test: " + ex.name, ex.message);
          this._createError("error", qxEx, test);
        }
      }
      
      /* EXPERIMENTAL
      // no timeout means the test is done
      if (!this._timeout[test.getFullName()]) {
        // remove listeners added during test execution
        var testInst = test.getTestClass();
        if (testInst.__addedListeners) {
          var listeners = testInst.__addedListeners;
          for (var i=0,l=listeners.length; i<l; i++) {
            var target = listeners[i][0];
            var id = listeners[i][1];
            try {
              qx.event.Registration.removeListenerById(target, id);
              //console.log("Removed listener from object " + target);
            } catch(ex) {
              //console.log("couldn't remove listener from object " + target);          
            }
          }
        }
      }
      */
    }
  }

});