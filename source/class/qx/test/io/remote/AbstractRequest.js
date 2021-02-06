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
  * Tristan Koch (tristankoch)

************************************************************************ */

/*
*/
/**
 *
 * @asset(qx/test/*)
 */

qx.Class.define("qx.test.io.remote.AbstractRequest",
{
  type : "abstract",
  extend : qx.dev.unit.TestCase,
  include : qx.test.io.MRemoteTest,

  members :
  {
    _requests : null,

    setUp : function()
    {
      this._requests = [];

      for (var i = 0; i < 10 ; i++) {
        var request = this._createRequest();

        request.addListener("aborted", this.responseError, this);
        request.addListener("failed", this.responseError, this);
        request.addListener("timeout", this.responseError, this);

        this._requests[i] = request;
      }
    },


    _createRequest : function() {
      throw new Error("Abstract method call");
    },

    _getRequests: function() {
      return this._requests;
    },

    tearDown : function() {
      this._disposeArray("_requests");
    },


    responseError : function(e)
    {
      var request = e;
      var type = e.getType();

      qx.event.Timer.once(function()
      {
        this.resume(function()
        {
          this.fail("Response error: " + type + " " +
            request.getStatusCode()
          );
        }, this);
      }, this);
    },


    testAsynchronous : function()
    {
      if (this.isLocal()) {
        this.needsPHPWarning();
        return;
      }

      var completedCount = 0;

      for (var i = 0; i < this._requests.length; i++)
      {
        var request = this._requests[i];

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

      var that = this;
      this.wait(5000, function()
      {
        that.assertEquals(i, completedCount);
      });
    },


    testAbortedOnException : function()
    {
      if (this.isLocal()) {
        this.needsPHPWarning();
        return;
      }

      var url = this.getUrl("qx/test/xmlhttp/echo_get_request.php");
      var request = new qx.io.remote.Request(url, "GET", "text/plain");
      request.addListener("failed", this.responseError, this);
      request.addListener("timeout", this.responseError, this);

      request.addListener("completed", function(e)
      {
        throw new Error("Expected exception.");
      }, this);

      request.addListener("aborted", function(e)
      {
        this.resume(function()
        {
          this.assertEquals(request, e.getTarget());
          request.dispose();
        }, this);
      }, this);

      request.send();

      this.wait(2000);
    }
  }
});
