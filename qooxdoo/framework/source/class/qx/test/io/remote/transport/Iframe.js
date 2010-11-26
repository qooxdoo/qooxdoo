/* ************************************************************************

qooxdoo - the new era of web development

http://qooxdoo.org

Copyright:
  2010 1&1 Internet AG, Germany, http://www.1und1.de

License:
  LGPL: http://www.gnu.org/licenses/lgpl.html
  EPL: http://www.eclipse.org/org/documents/epl-v10.php
  See the LICENSE file in the project's top-level directory for details.

Authors:
  * Tristan Koch (tristankoch)

************************************************************************ */

/*
#asset(qx/test/xmlhttp/echo_get_request.php)
*/

qx.Class.define("qx.test.io.remote.transport.Iframe",
{
  extend : qx.dev.unit.TestCase,
  include : qx.test.io.MRemoteTest,

  members :
  {
    setUp: function() {
      this.request = new qx.io.remote.transport.Iframe();
    },


    testGetIframeHtmlContent : function() {
      if (this.isLocal()) {
        this.needsPHPWarning();
        return;
      }

      this.request.addListener("completed", function() {
        this.resume(function() {
          var response = this.request.getIframeHtmlContent();
          this.assertNotNull(response, "Response is 'null'!");
          this.assertNotEquals("", response, "Response is empty!");

          response = qx.lang.Json.parse(response);
          this.assertEquals("my_param=expected", response["_data_"], "Response is wrong!");
        }, this);
      }, this);

      // Send request
      this.request.setUrl(this.getUrl("qx/test/xmlhttp/echo_get_request.php"));
      this.request.setParameters({my_param: "expected"});
      this.request.send();

      this.wait();
    }
  }
});