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

************************************************************************ */

/*
#asset(qx/test/*)
*/

qx.Class.define("qx.test.io.remote.Request",
{
  extend : qx.dev.unit.TestCase,
  include : qx.test.io.MRemoteTest,

  members :
  {
    __requests : null,

    setUp : function()
    {
      this.__requests = [];

      var url = this.getUrl("qx/test/xmlhttp/echo_get_request.php")

      for (var i = 0; i < 10 ; i++) {
        var request = new qx.io.remote.Request(url, "GET", "text/plain");
        request.addListener("aborted", this.responseError, this);
        request.addListener("failed", this.responseError, this);
        request.addListener("timeout", this.responseError, this);

        this.__requests[i] = request;
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


    tearDown : function() {
      this._disposeArray("__request");
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


    testSynchronous : function()
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

      for (var i = 0; i < this.__requests.length; i++)
      {
        var request = this.__requests[i];

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

      for (var i = 0; i < this.__requests.length; i++)
      {
        var request = this.__requests[i];

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

    testSynchronousAndAsynchronousMix : function()
    {
      if (this.isLocal()) {
        this.needsPHPWarning();
        return;
      }

      if (this.buggyBrowser) {
        this.warn("Tests skipped in Safari 3/FF 1.5, see bug #2529");
        return;
      }

      var asynchronousRequest = this.__requests[0];
      var synchronousRequest = this.__requests[1];

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