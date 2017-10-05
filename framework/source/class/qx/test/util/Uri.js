/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
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
      this.Uri = qx.util.Uri;
    },

    "test: appendParamsToUrl() with string": function() {
      var url = "http://example.com/path",
          params = "affe=true&maus=false",
          expected = "http://example.com/path?affe=true&maus=false",
          result = this.Uri.appendParamsToUrl(url, params);

      this.assertEquals(expected, result);
    },


    testToParameter : function()
    {
      var obj = {affe: true, maus: false};
      var str = qx.util.Uri.toParameter(obj);
      this.assertEquals("affe=true&maus=false", str);
    },

    testToParameterUmlauts : function()
    {
      var obj = {"äffe": "jøah", "maüs": "nö"};
      var str = qx.util.Uri.toParameter(obj);
      this.assertEquals("%C3%A4ffe=j%C3%B8ah&ma%C3%BCs=n%C3%B6", str);
    },

    testToParameterSpaces : function()
    {
      var obj = {"a f f e": true};
      var str = qx.util.Uri.toParameter(obj);
      this.assertEquals("a%20f%20f%20e=true", str);
    },

    testToParameterSpacesPost : function()
    {
      var obj = {"a f  f e": "j a"};
      var str = qx.util.Uri.toParameter(obj, true);
      this.assertEquals("a+f++f+e=j+a", str);
    },

    testToParameterArray : function() {
      var obj = {id: [1,2,3]};
      var str = qx.util.Uri.toParameter(obj);
      this.assertEquals("id=1&id=2&id=3", str);
    },


    "test: appendParamsToUrl() with string when existing query": function() {
      var url = "http://example.com/path?giraffe=true",
          params = "affe=true&maus=false",
          expected = "http://example.com/path?giraffe=true&affe=true&maus=false",
          result = this.Uri.appendParamsToUrl(url, params);

      this.assertEquals(expected, result);
    },

    "test: appendParamsToUrl() with map": function() {
      var url = "http://example.com/path",
          params = {affe: true, maus: false},
          result = this.Uri.appendParamsToUrl(url, params);

      this.assertTrue(/^http.*example.com\/path/.test(result));
      this.assertTrue(/affe=true/.test(result));
      this.assertTrue(/maus=false/.test(result));
    },

    "test: appendParamsToUrl() with undefined": function() {
      var url = "http://example.com/path",
          params = undefined,
          result = this.Uri.appendParamsToUrl(url, params);

      this.assertEquals(url, result);
    },

    "test: appendParamsToUrl() with empty map": function() {
      var url = "http://example.com/path",
          params = {},
          result = this.Uri.appendParamsToUrl(url, params);

      this.assertEquals(url, result);
    },

    "test: parseUri()": function() {
      var url = "http://www.example.com:80/foo/bar?affe=true#here",
          result = this.Uri.parseUri(url);

      // Some integration tests, parseUri is better covered here
      // http://stevenlevithan.com/demo/parseuri/js/
      this.assertEquals("http", result.protocol);
      this.assertEquals("www.example.com", result.host);
      this.assertEquals("80", result.port);
      this.assertEquals("/foo/bar?affe=true#here", result.relative);
      this.assertEquals("here", result.anchor);
    },

    "test: parseUri() with ipv6 loopback address": function() {
        var url = "http://[::1]:80/foo/bar?affe=true#here",
            result = this.Uri.parseUri(url);

        // Some integration tests, parseUri is better covered here
        // http://stevenlevithan.com/demo/parseuri/js/
        this.assertEquals("http", result.protocol);
        this.assertEquals("[::1]", result.host);
        this.assertEquals("80", result.port);
        this.assertEquals("/foo/bar?affe=true#here", result.relative);
        this.assertEquals("here", result.anchor);
      },

      "test: parseUri() with ipv6 address": function() {
          var url = "http://[FE80:0000:0000:0000:0202:B3FF:FE1E:8329]:80/foo/bar?affe=true#here",
              result = this.Uri.parseUri(url);

          // Some integration tests, parseUri is better covered here
          // http://stevenlevithan.com/demo/parseuri/js/
          this.assertEquals("http", result.protocol);
          this.assertEquals("[FE80:0000:0000:0000:0202:B3FF:FE1E:8329]", result.host);
          this.assertEquals("80", result.port);
          this.assertEquals("/foo/bar?affe=true#here", result.relative);
          this.assertEquals("here", result.anchor);
    },

    "test: parseUri() with at-sign in query": function() {
        var url = "http://www.example.com/foo/bar?separator=@",
            result = this.Uri.parseUri(url);

        this.assertEquals("http", result.protocol);
        this.assertEquals("www.example.com", result.host);
        this.assertEquals("/foo/bar?separator=@", result.relative);
        this.assertEquals("separator=@", result.query);
    },

    "test: parseUri() with user name in domain": function() {
        var url = "http://userid@www.example.com/foo/bar",
            result = this.Uri.parseUri(url);

        this.assertEquals("http", result.protocol);
        this.assertEquals("www.example.com", result.host);
        this.assertEquals("/foo/bar", result.relative);
        this.assertEquals("userid", result.user);
    }

  }
});
