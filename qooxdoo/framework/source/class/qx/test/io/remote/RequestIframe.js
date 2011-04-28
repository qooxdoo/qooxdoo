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
    }
  }
});