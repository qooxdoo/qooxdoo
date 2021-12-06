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

qx.Class.define("qx.test.Xml",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    serializeArray : function(arr)
    {
      var ser = [];

      for (var i=0; i<arr.length; i++) {
        ser[i] = qx.xml.Element.serialize(arr[i]);
      }

      return ser.join(", ");
    },

    testParseSerializeXml : function()
    {
      var doc = qx.xml.Document.create();
      this.assertTrue(qx.dom.Node.isDocument(doc));

      var div = doc.createElement("div");
      this.assertEquals("div", div.tagName);

      var xmlStr = '<html>' + '<body>Juhu <em id="toll">Kinners</em>. Wie geht es <em>Euch</em>?</body>' + '</html>';

      var doc2 = qx.xml.Document.fromString(xmlStr);
      this.assertTrue(qx.dom.Node.isDocument(doc2));

      this.assertEquals(xmlStr, qx.xml.Element.serialize(doc2));
    },


    testFromString : function()
    {
      var data = "<Root><Row>test1</Row><Row>test2</Row><Row>test3</Row></Root>";

      var xml = qx.xml.Document.fromString(data);
      // this.debug("Converted to XML Document ", xml);
    },


    testCreateDocument : function()
    {
      var doc = qx.xml.Document.create("", "rss");
      this.assertEquals('rss', doc.documentElement.tagName);
      this.assertEquals(0, doc.documentElement.childNodes.length);

      doc = qx.xml.Document.create("http://www.w3.org/1999/xhtml/", "html");
      this.assertEquals('http://www.w3.org/1999/xhtml/', doc.documentElement.namespaceURI);
      this.assertEquals('html', doc.documentElement.tagName);
      this.assertEquals(0, doc.documentElement.childNodes.length);
    },


    testXPath : function()
    {
      var xmlStr = '<html><body>Juhu <em id="toll">Kinners</em>. Wie geht es <em>Euch</em>?</body></html>';
      var doc2 = qx.xml.Document.fromString(xmlStr);

      var em = doc2.getElementsByTagName("em")[0];
      this.assertEquals('<em id="toll">Kinners</em>', qx.xml.Element.serialize(em));

      this.assertEquals(qx.xml.Element.serialize(em), qx.xml.Element.serialize(qx.xml.Element.selectSingleNode(doc2, '//*[@id="toll"]')));

      this.assertEquals(qx.xml.Element.serialize(doc2.getElementsByTagName("body")[0]), qx.xml.Element.serialize(qx.xml.Element.selectSingleNode(doc2, '//body')));

      this.assertEquals(this.serializeArray(doc2.getElementsByTagName("em")), this.serializeArray(qx.xml.Element.selectNodes(doc2, '//em')));

      this.assertEquals(this.serializeArray(doc2.getElementsByTagName("em")), this.serializeArray(qx.xml.Element.selectNodes(doc2.documentElement, '//em')));
    },


    testXPathNS : function()
    {
      var xmlStr = '<html xmlns="http://www.w3.org/1999/xhtml/"><body>Juhu <em id="toll">Kinners</em>. Wie geht es <em>Euch</em>?<foo xmlns="http://qooxdoo.org" id="bar"/></body></html>';
      var doc = qx.xml.Document.fromString(xmlStr);
      var em = qx.xml.Element.getElementsByTagNameNS(doc, "http://www.w3.org/1999/xhtml/", "em")[0];
      var foo = qx.xml.Element.getElementsByTagNameNS(doc, "http://qooxdoo.org", "foo")[0];

      var emStr = qx.xml.Element.serialize(em);
      var fooStr = qx.xml.Element.serialize(foo);

      var nsMap = {
        "xhtml" : "http://www.w3.org/1999/xhtml/",
        "qx"    : "http://qooxdoo.org"
      };
      var q1 = "//xhtml:em";
      var q2 = "//qx:foo";
      var q3 = "//xhtml:body";

       // Chrome versions older than 532.2 will throw an exception. See Chromium
       // bug #671 (http://code.google.com/p/chromium/issues/detail?id=671)
      if (navigator.userAgent.indexOf('Chrome') > 0 &&
          qx.core.Environment.get("engine.version") < 532.2) {
        this.assertException(function () {
          qx.xml.Element.selectSingleNode(doc, q1, nsMap);
        }, Error, "DOM Exception 14", "Namespaced XPath query worked in Chrome < 532.2!");
        this.assertException(function () {
          qx.xml.Element.selectSingleNode(doc, q2, nsMap);
        }, Error, "DOM Exception 14", "Namespaced XPath query worked in Chrome < 532.2!");
      }
      else {
        var n1 = qx.xml.Element.selectSingleNode(doc, q1, nsMap);
        var s1 = qx.xml.Element.serialize(n1);
        // this.debug("Found node: " + s1);
        this.assertEquals(s1, emStr);
        var n2 = qx.xml.Element.selectSingleNode(doc, q2, nsMap);
        var s2 = qx.xml.Element.serialize(n2);
        // this.debug("Found node: " + s2);
        this.assertEquals(s2, fooStr);
        var n3 = qx.xml.Element.selectNodes(doc, q3, nsMap);
        var n4 = qx.xml.Element.selectNodes(n3[0], q2, nsMap);
        var s4 = qx.xml.Element.serialize(n4[0]);
        this.assertEquals(s4, fooStr);
      }
    },


    testGetElementsByTagNameNS : function()
    {
      var xmlStr =
        "<\?xml version='1.0' " +
        "encoding='UTF-8'?>" +
        "<xsl:stylesheet version='1.0' xmlns:xsl='http://www.w3.org/1999/XSL/Transform'>" +
        "<xsl:output method='xml' version='1.0' encoding='UTF-8' indent='yes'/>" +
        "<xsl:template match='*'></xsl:template><xsl:template match='@*'>" +
        "</xsl:template></xsl:stylesheet>";

      var nsDoc = qx.xml.Document.fromString(xmlStr);

      var templates = qx.xml.Element.getElementsByTagNameNS(nsDoc, "http://www.w3.org/1999/XSL/Transform", "template");

      // this.debug(qx.xml.String.escape(this.serializeArray(templates)));
      this.assertEquals(2, templates.length, "getElementsByTagNameNS for XML documents failed!");

      this.assertEquals("xsl:template", templates[0].tagName, "getElementsByTagNameNS for XML documents failed!");

      var templates = qx.xml.Element.getElementsByTagNameNS(nsDoc.documentElement, "http://www.w3.org/1999/XSL/Transform", "template");

      this.assertEquals(2, templates.length, "getElementsByTagNameNS for element nodes failed!");

      this.assertEquals("xsl:template", templates[0].tagName, "getElementsByTagNameNS for element nodes failed!");
    },


    testSetAttributeNS : function()
    {
      var doc = qx.xml.Document.create("http://www.w3.org/1999/xhtml/", "html");
      var node = doc.createElement("a");
      var namespaceURI = "http://www.qooxdoo.org/";
      qx.xml.Element.setAttributeNS(doc, node, namespaceURI, "qxid", "foo");

      if (node.getAttributeNS) {
        this.assertEquals("foo", node.getAttributeNS(namespaceURI, "qxid"));
      }
      else {
        this.assertEquals(namespaceURI, node.getAttributeNode("qxid").namespaceURI);
      }
    },


    testGetAttributeNS : function()
    {
      var doc = qx.xml.Document.create("http://www.w3.org/1999/xhtml/", "html");
      var node = doc.createElement("a");
      var namespaceURI = "http://www.qooxdoo.org/";
      qx.xml.Element.setAttributeNS(doc, node, namespaceURI, "qxid", "foo");

      this.assertEquals('foo', qx.xml.Element.getAttributeNS(node,namespaceURI,'qxid'));
    },

    testCreateSubElementNS : function()
    {
      var xmlStr = '<html><body>Juhu <em id="toll">Kinners</em>.</body></html>';
      var doc = qx.xml.Document.fromString(xmlStr);
      var parent = doc.getElementsByTagName("em")[0];
      var namespaceUri = "http://qooxdoo.org";
      var subElem = qx.xml.Element.createSubElementNS(doc, parent, "foo", namespaceUri);

      var createdNode = qx.xml.Element.getElementsByTagNameNS(doc.documentElement, namespaceUri, "foo")[0];
      this.assertEquals(subElem, createdNode);
      this.assertTrue(subElem.parentNode == parent);
    }
  }
});
