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

qx.Class.define("qx.test.io.remote.RequestIframe",
{
  extend : qx.test.io.remote.AbstractRequest,

  members :
  {
    // Overridden
    _createRequest : function() {
      var url = this.getUrl("qx/test/xmlhttp/echo_form_request.php");
      return new qx.io.remote.Request(url, "GET", "text/plain").set({
        fileUpload: true
      });
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
        var request = this._requests[i],
            emptyContent;

        request.setParameter("test", "test" + i);

        request.addListener("completed", function(e)
        {
          completedCount++;

          // Skip test when response is empty. Occuring seemingly randomly
          // in IE when many requests are made.
          //
          // May be due to timing issue showing under rare and obscure
          // circumstances (clean cache, build variant, fresh browser window).
          if (qx.core.Environment.get("engine.name") === "mshtml" &&
            e.getContent() === "" && !emptyContent) {
            this.warn("Skipping test due to empty content in one of the request's response");
            emptyContent = true;
            return;
          }

          if (!emptyContent) {
            var response = qx.lang.Json.parse(e.getContent());
            request = e.getTarget();
            this.assertEquals(request.getParameter("test"), response["test"]);
          }
        }, this);

        request.send();
      }

      var that = this;
      this.wait(5000, function()
      {
        that.assertEquals(i, completedCount);
      });
    },

    testAsynchronousSingle: function() {
      var request = this._requests[0];
      request.setParameter("test", "affe");
      request.addListener("completed", function(e) {
        var response = qx.lang.Json.parse(e.getContent());
        this.assertEquals("affe", response["test"]);
      }, this);
      request.send();
    }
  }
});
