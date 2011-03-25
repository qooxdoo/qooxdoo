/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

************************************************************************ */

/**
 * View for performance tests.
 */
qx.Class.define("testrunner.view.Performance", {

  extend : testrunner.view.Console,

  properties :
  {
    /**
     * Use the browser's built-in profiling capabilities (console.profile)
     * if true
     */
    profile :
    {
      check : "Boolean",
      init : true
    }
  },

  construct : function()
  {
    this.base(arguments);
    this.__measurements = [];
    var profileToggle = qx.bom.Input.create("checkbox", {id: "profile", checked : "checked"});
    document.body.appendChild(profileToggle);
    document.body.innerHTML += '<label for="profile">Enable console profiling</label><br/>';
    document.body.innerHTML += '<input type="submit" id="qxtestrunner_run" value="Run Tests"></input><br/>';
    var run = document.getElementById("qxtestrunner_run");
    run.disabled = true;
    document.body.innerHTML += '<div id="autlog"></div><br/>';
    this.__logElem = document.getElementById("autlog");
    this.__logElem.style.height = "300px";
    this.__logElem.style.marginTop = "5px";
    this.__logElem.style.border = "1px solid #AEAEAE";
    this.__logElem.style.overflow = "auto";

    var cb = document.getElementById("profile");
    qx.event.Registration.addListener(cb, "change", function(ev) {
      var value = ev.getData();
      this.setProfile(value);
    }, this);

    var runButton = document.getElementById("qxtestrunner_run");
    qx.event.Registration.addListener(runButton, "click", function(ev) {
      this.fireEvent("runTests");
    }, this);
  },

  members :
  {
    _onTestChangeState : function(testResultData)
    {
      // No log output needed
    },


    __measurements : null,

    /**
     * Adds an entry to the stored results
     *
     * @param clazz {String} Name of the test class
     * @param msg {String} Test description
     * @param iterations {Integer} Number of iterations
     * @param ownTime {Integer} JavaScript execution time
     * @param renderTime {Integer} browser rendering time
     */
    logMeasurement : function(clazz, msg, iterations, ownTime, renderTime) {
      this.__measurements.push([clazz, msg, iterations, ownTime, renderTime].join("; "));
    },


    _applyTestSuiteState : function(value, old)
    {
      switch(value)
      {
        case "loading" :
          console.log("Loading tests");
          break;
        case "ready" :
          document.getElementById("qxtestrunner_run").disabled = false;
          console.log("Test suite ready");
          break;
        case "running":
          console.log("Running tests...");
          break;
        case "error" :
          console.log("Couldn't load test suite!");
          break;
        case "finished" :
          console.log(this.__measurements.join("\n"));
          break;
      };
    },

    __logElem : null,

    /**
     * Returns an HTML element to be used for the AUT's log output
     * @return {Element} The log appender element
     */
    getLogAppenderElement : function()
    {
      return this.__logElem;
    }
  }

});