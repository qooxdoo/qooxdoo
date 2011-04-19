/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tristan Koch (tristankoch)

************************************************************************ */

qx.Class.define("qx.test.util.Uri",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    setUp : function() {
      this.Url = qx.util.Uri;
    },

    "test: append params string to URL": function() {
      var url = "http://example.com/path",
          params = "affe=true&maus=false",
          expected = "http://example.com/path?affe=true&maus=false",
          result = this.Url.appendParamsToUrl(url, params);

      this.assertEquals(expected, result);
    },

    "test: append params string to URL with query string": function() {
      var url = "http://example.com/path?giraffe=true",
          params = "affe=true&maus=false",
          expected = "http://example.com/path?giraffe=true&affe=true&maus=false",
          result = this.Url.appendParamsToUrl(url, params);

      this.assertEquals(expected, result);
    },

    "test: append params hash to URL": function() {
      var url = "http://example.com/path",
          params = {affe: true, maus: false},
          result = this.Url.appendParamsToUrl(url, params);

      this.assertTrue(/^http.*example.com\/path/.test(result));
      this.assertTrue(/affe=true/.test(result));
      this.assertTrue(/maus=false/.test(result));
    },

    "test: parse URI": function() {
      var url = "http://www.example.com:80/foo/bar?affe=true#here",
          result = this.Url.parseUri(url);

      // Some integration tests, parseUri is better covered here
      // http://stevenlevithan.com/demo/parseuri/js/
      this.assertEquals("http", result.protocol);
      this.assertEquals("www.example.com", result.host);
      this.assertEquals("80", result.port);
      this.assertEquals("/foo/bar?affe=true#here", result.relative);
      this.assertEquals("here", result.anchor);
    }

  }
});
