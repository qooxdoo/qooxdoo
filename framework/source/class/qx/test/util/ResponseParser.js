/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2013 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Richard Sternagel (rsternagel)

************************************************************************ */

qx.Class.define("qx.test.util.ResponseParser",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    setUp : function() {
      this.responseParser = new qx.util.ResponseParser();
    },

    tearDown : function()
    {
      this.responseParser = null;
    },

    __assertParser: function(contentType, parser) {
      var msg = "Content type '" + contentType + "' handled incorrectly";
      this.assertEquals(parser, this.responseParser._getParser(contentType), msg);
    },

    "test: getParser() returns undefined for unknown": function() {
      this.__assertParser("text/html", undefined);
      this.__assertParser("application/pdf", undefined);
    },

    "test: getParser() returns undefined for malformed": function() {
      this.__assertParser("", undefined);
      this.__assertParser("json", undefined);
      this.__assertParser("text/foo+json", undefined);
      this.__assertParser("application/foo+jsonish", undefined);
      this.__assertParser("application/foo+xmlish", undefined);
    },

    "test: getParser() detects json": function() {
      var json = qx.util.ResponseParser.PARSER.json;
      this.__assertParser("application/json", json);
      this.__assertParser("application/vnd.affe+json", json);
      this.__assertParser("application/prs.affe+json", json);
      this.__assertParser("application/vnd.oneandone.onlineoffice.email+json", json);
    },

    "test: getParser() detects xml": function() {
      var xml = qx.util.ResponseParser.PARSER.xml;
      this.__assertParser("application/xml", xml);
      this.__assertParser("application/vnd.oneandone.domains.domain+xml", xml);
      this.__assertParser("text/xml");  // Deprecated
    },

    "test: getParser() detects deprecated xml": function() {
      var xml = qx.util.ResponseParser.PARSER.xml;
      this.__assertParser("text/xml");
    },

    "test: getParser() handles character set": function() {
      var json = qx.util.ResponseParser.PARSER.json;
      this.__assertParser("application/json; charset=utf-8", json);
    },

    "test: setParser() function": function() {
      var customParser = function() {};
      this.responseParser.setParser(customParser);
      this.assertEquals(customParser, this.responseParser._getParser());
    },

    "test: setParser() symbolically": function() {
      this.responseParser.setParser("json");
      this.assertFunction(this.responseParser._getParser());
    },

    "test: parse() not parse empty response": function() {
      var expectedResponse = "",
          parsedResponse = this.responseParser.parse("", "application/json");

      this.assertEquals(expectedResponse, parsedResponse);
    },

    "test: parse() not parse unknown response": function() {
      this.assertNull(this.responseParser._getParser("application/idontexist"));
    },

    // JSON

    "test: parse() json response": function() {
      var json = '{"animals": ["monkey", "mouse"]}',
          expectedResponse = qx.util.ResponseParser.PARSER.json.call(this, json),
          parsedResponse = this.responseParser.parse(json, "application/json");

      this.assertEquals(expectedResponse.animals[0], parsedResponse.animals[0]);
    },

    // XML

    "test: parse() xml response": function() {
      var xml = "<animals><monkey/><mouse/></animals>",
          expectedResponse = qx.util.ResponseParser.PARSER.xml.call(this, xml),
          parsedResponse = this.responseParser.parse(xml, "application/xml");

      this.assertEquals(expectedResponse.documentElement.nodeName, parsedResponse.documentElement.nodeName);
    },

    "test: parse() arbitrary xml response": function() {
      var xml = "<animals><monkey/><mouse/></animals>",
          expectedResponse = qx.util.ResponseParser.PARSER.xml.call(this, xml),
          parsedResponse = this.responseParser.parse(xml, "animal/affe+xml");

      this.assertEquals(expectedResponse.documentElement.nodeName, parsedResponse.documentElement.nodeName);
    }
  }
});
