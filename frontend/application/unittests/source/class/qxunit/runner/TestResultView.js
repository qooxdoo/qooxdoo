
qx.Class.define("qxunit.runner.TestResultView",
{
  extend : qx.ui.embed.HtmlEmbed,

  construct : function()
  {
    this.base(arguments);
    this._testResults = [];

    this.addEventListener("appear", function() {
      this.setHtml(this.createHtml())
    }, this);
  },

  members :
  {
    createHtml : function()
    {
      var html = new qx.util.StringBuilder();
      for (var i=this._testResults.length-1; i>=0; i--)
      {
        var result = this._testResults[i];
        html.add(this.createResultHtml(result));
      }
      return html.get();
    },

    createResultHtml : function(testResult)
    {
      var html = "<div class='testResult " + testResult.getState() + "' id='testResult" + testResult.toHashCode() + "'>";
      html += "<h3>" + testResult.getName() + "</h3>";

      if (testResult.getState() == "failure")
      {
        html +=
          "Error message is: <br />" +
          testResult.getMessage();
      }

      html += "</div>";
      return html;
    },

    addTestResult : function(testResult)
    {
      this._testResults.push(testResult);
      testResult.addEventListener("changeState", function() { this._onStateChange(testResult); }, this);

      var element = this.getElement();
      if (element)
      {
        element.innerHTML = this.createResultHtml(testResult) + element.innerHTML;
      }
    },

    _onStateChange : function(testResult)
    {
      this.setHtml(this.createHtml());
    },

    clear : function()
    {
      for (var i=0; i<this._testResults.length; i++)
      {
        this._testResults[i].dispose();
      }
      this._testResults = [];
      this.setHtml("");
    }

  }


});