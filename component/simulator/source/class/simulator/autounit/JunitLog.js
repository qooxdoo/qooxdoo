/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Author:
     * Daniel Wagner (danielwagner)

************************************************************************ */

/**
 * Formats test suite results (provided e.g. by @link{simulator.autounit.AutoUnit})
 * as JUnit-style XML
 */

qx.Class.define("simulator.autounit.JunitLog", {

  extend : qx.core.Object,

  construct : function(suiteData)
  {
    this.base(arguments);
    this.__suiteData = suiteData;
    this._parseResults();
  },

  members :
  {
    __attributes : null,
    __testCases : null,
    __suiteData : null,


    /**
     * Extracts required information from the test suite results map
     */
    _parseResults : function()
    {
      var suiteData = this.__suiteData;
      var attributes = this.__attributes = {
        errors : 0,
        failures : 0,
        tests : 0
      };

      this.__testCases = [];

      var time = suiteData.finishedAt - suiteData.startedAt;
      attributes.time = time / 1000;

      var dateFormat = new qx.util.format.DateFormat("YYYY-MM-dd'T'HH:mm:ss");
      attributes.timestamp = dateFormat.format(new Date(suiteData.startedAt));

      attributes.hostname = suiteData.hostname;

      if (suiteData.tests) {
        for (var testName in suiteData.tests) {
          var result = suiteData.tests[testName];
          attributes.tests++;
          switch(result.state) {
            case "error":
              attributes.errors++;
              break;
            case "failure":
              attributes.failures++;
              break;
          }

          if (result.state !== "skip") {
            // JUnit has no concept of skipped tests, so just ignore them
            this.__testCases.push(this._getTestCase(testName, result));
          }
        }
      }
    },


    /**
     * Returns the test suite results in JUnit XML (string) format
     *
     * @return {String} JUnit XML
     */
    getResultsXmlString : function()
    {
      //TODO: name, test case time
      var juXml = '<?xml version="1.0" encoding="UTF-8" ?>' +
      '\n<testsuite errors="' + this.__attributes.errors +
      '" failures="' + this.__attributes.failures +
      '" hostname="' + this.__attributes.hostname +
      '" name="unknown name" tests="' +
      this.__attributes.tests + '" time="' + this.__attributes.time +
      '" timestamp="' + this.__attributes.timestamp + '">';

      for (var i=0, l=this.__testCases.length; i<l; i++) {
        var tC = this.__testCases[i];
        var testXml = '<testcase classname="' + tC.classname +
        '" name="' + tC.name + '" time="0.0000">';

        var props = ["error", "failure"];
        for (var a=0; a<props.length; a++) {
          var prop = props[a];
          if (tC[prop + "s"]) {
            for (var x=0, y=tC[prop + "s"].length; x<y; x++) {
              var err = tC[prop + "s"][x];
              var errXml = '\n    <' + prop +' message ="' + err.message +
              '" type="' + err.type + '">' + err.type + ": " + err.message + ' ' +
              err.stacktrace + '</' + prop + '>';

              testXml += errXml;
            }
          }

        }

        testXml += '</testcase>';

        juXml += '\n  ' + testXml;
      }

      juXml += '\n</testsuite>\n';

      return juXml;
    },


    /**
     * Extracts failure/error information from a single test result for easier
     * XML serialization
     *
     * @param testName {String} Fully qualified test (method) name, e.g.
     * <code>foo.test.Bar:testBaz</code>
     * @param result {Map} Test result map
     * @return {Map} Processed test result information
     */
    _getTestCase : function(testName, result)
    {
      var testCase = {};
      var split = testName.split(":");
      testCase.classname = split[0];
      testCase.name = split[1];

      if (result.state == "error" || result.state == "failure") {
        testCase[result.state + "s"] = [];
        if (result.exceptions && result.exceptions.length > 0) {
          for (var i=0, l=result.exceptions.length; i<l; i++) {
            testCase[result.state + "s"].push(result.exceptions[i])
          }

        }
      }

      return testCase;
    }
  }
});