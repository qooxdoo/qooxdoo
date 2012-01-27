/**
 * This represents one test class (test suite in JUnit lingo)
 */

qx.Class.define("simulator.autounit.JunitLog", {
  
  extend : qx.core.Object,
  
  construct : function(suiteData)
  {
    this.base(arguments);
    this.__suiteData = suiteData;
  },
  
  members :
  {
    __attributes : null,
    __testCases : null,
    
    _parseResults : function()
    {
      var suiteData = this.__suiteData;
      var attributes = this.__attributes = {
        errors : 0,
        failures : 0,
        tests : 0
      };
      
      this.__testCases = [];
      
      if (suiteData.startedAt && suiteData.finishedAt) {
        var start = new Date(suiteData.startedAt);
        var finish = new Date(suiteData.finishedAt);
        
        var time = suiteData.finishedAt - suiteData.startedAt;
        attributes.time = time / 1000;
      }
      
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
    
    getResultsXml : function()
    {
      this._parseResults();
      
      var juXml = '<?xml version="1.0" encoding="UTF-8" ?>' +
      '\n<testsuite errors="' + this.__attributes.errors + 
      '" failures="' + this.__attributes.failures + 
      '" hostname="foo.bar" name="whatever" tests="' + 
      this.__attributes.tests + '" time="' + this.__attributes.time + 
      '" timestamp="2007-11-02T23:13:50">';
      
      for (var i=0, l=this.__testCases.length; i<l; i++) {
        var tC = this.__testCases[i];
        var testXml = '<testcase classname="' + tC.classname + 
        '" name="' + tC.name + '" time="0.0010">';
        
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