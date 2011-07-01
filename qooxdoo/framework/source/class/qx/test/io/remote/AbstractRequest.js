/* ************************************************************************

qooxdoo - the new era of web development

http://qooxdoo.org

Copyright:
  2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

License:
  LGPL: http://www.gnu.org/licenses/lgpl.html
  EPL: http://www.eclipse.org/org/documents/epl-v10.php
  See the LICENSE file in the project's top-level directory for details.

Authors:
  * Fabian Jakobs (fjakobs)
  * Tristan Koch (tristankoch)

************************************************************************ */

/*
#asset(qx/test/*)
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

      // These tests will always fail in Safari 3/FF1.5 due to the behavior
      // described in qooxdoo bug #2529, so they will be skipped.
      this.buggyBrowser = false;
      var engineString = qx.core.Environment.get("engine.version");
      var engineFloat = parseFloat(engineString);
      if ( (qx.core.Environment.get("engine.name") == "webkit" &&
            engineFloat < 526)
            || (qx.core.Environment.get("engine.name") == "gecko" &&
            engineString.indexOf("1.8.0") == 0 ) ) {
        this.buggyBrowser = true;
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
          if (!this.buggyBrowser)
          {
            this.fail("Response error: " + type + " " +
              request.getStatusCode()
            );
          }
        }, this);
      }, this);
    },


    testAsynchronous : function()
    {
      if (this.isLocal()) {
        this.needsPHPWarning();
        return;
      }

      if (this.buggyBrowser) {
        this.warn("Tests skipped in Safari 3/FF 1.5, see bug #2529");
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

      if (this.buggyBrowser) {
        this.warn("Tests skipped in Safari 3/FF 1.5, see bug #2529");
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