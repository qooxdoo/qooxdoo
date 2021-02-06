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

/*
*/
/**
 *
 * @asset(qx/test/*)
 */

qx.Class.define("qx.test.io.remote.RequestXhr",
{
  extend : qx.test.io.remote.AbstractRequest,

  members :
  {
    // Overridden
    _createRequest : function() {
      var url = this.getUrl("qx/test/xmlhttp/echo_get_request.php");
      return new qx.io.remote.Request(url, "GET", "text/plain");
    },


    testSynchronous : function()
    {
      if (this.isLocal()) {
        this.needsPHPWarning();
        return;
      }

      var completedCount = 0;

      for (var i = 0; i < this._getRequests().length; i++)
      {
        var request = this._getRequests()[i];

        request.setAsynchronous(false);
        request.setParameter("test", "test" + i);

        request.addListener("completed", function(e)
        {
          completedCount++;

          var response = qx.lang.Json.parse(e.getContent());
          request = e.getTarget();
          this.assertEquals(request.getParameter("test"), response["test"]);
        }, this);

        request.send();
      }

      this.assertEquals(i, completedCount, "Test doesn't run synchronous!");
    },


    testSynchronousAndAsynchronousMix : function()
    {
      if (this.isLocal()) {
        this.needsPHPWarning();
        return;
      }

      var asynchronousRequest = this._getRequests()[0];
      var synchronousRequest = this._getRequests()[1];

      asynchronousRequest.setParameter("test", "asynchronousRequest");
      asynchronousRequest.setParameter("sleep", 1);
      synchronousRequest.setParameter("test", "synchronousRequest");
      synchronousRequest.setAsynchronous(false);

      var asynchronousRequestFinished = false;
      var synchronousRequestFinished = false;

      asynchronousRequest.addListener("completed", function(e)
      {
        //this.resume(function()
        //{
          asynchronousRequestFinished = true;

          var response = qx.lang.Json.parse(e.getContent());
          var request = e.getTarget();
          this.assertEquals(request.getParameter("test"), response["test"]);
        //}, this);
      }, this);

      synchronousRequest.addListener("completed", function(e)
      {
        synchronousRequestFinished = true;

        var response = qx.lang.Json.parse(e.getContent());
        var request = e.getTarget();
        this.assertEquals(request.getParameter("test"), response["test"]);
      }, this);

      asynchronousRequest.send();
      synchronousRequest.send();

      var that = this;
      this.wait(5000, function()
      {
        that.assertTrue(asynchronousRequestFinished);
        that.assertTrue(synchronousRequestFinished);
      });
    },

    testGetResponseHeader : function()
    {
      if (this.isLocal()) {
        this.needsPHPWarning();
        return;
      }

      var request = new qx.io.remote.Request();

      // Response header is "juhu"
      request.setUrl(this.getUrl("qx/test/xmlhttp/send_known_header.php"));

      request.addListener("completed", function(e) { this.resume(function() {
        this.assertEquals("kinners", e.getResponseHeader("juhu"), "Exact case match");
        this.assertEquals("kinners", e.getResponseHeader("Juhu"), "Case insensitive match");
      }, this); }, this);

      var that = this;
      window.setTimeout(function() {
        request.send();
      }, 1000);
      this.wait(5000);
    }
  }
});
