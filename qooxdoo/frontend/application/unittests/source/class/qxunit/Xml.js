
qx.Clazz.define("qxunit.Xml", { statics : {

    serializeArray: function(arr) {
        var ser = [];
        for (var i=0; i<arr.length; i++) {
            ser[i] = qx.xml.Element.serialize(arr[i]);
        }
        return ser.join(", ");
    },

    testParseSerializeXml: function() {
        var doc = qx.xml.Document.create();
        assertTrue(qx.xml.Document.isDocument(doc));

        var div = doc.createElement("div");
        assertEquals("div", div.tagName);

        var xmlStr =
            '<html>' +
            '<body>Juhu <em id="toll">Kinners</em>. Wie geht es <em>Euch</em>?</body>'+
            '</html>';

        var doc2 = qx.xml.Document.fromString(xmlStr);
        assertTrue(qx.xml.Document.isDocument(doc2));

        assertEquals(xmlStr, qx.xml.Element.serialize(doc2));
    },

    testCreateDocument: function() {
        var doc = qx.xml.Document.create("", "rss");
        assertEquals(
            'rss',
            doc.documentElement.tagName
        );
        assertEquals(
            0,
            doc.documentElement.childNodes.length
        );

        var doc = qx.xml.Document.create("http://www.w3.org/1999/xhtml", "html");
        assertEquals(
            'http://www.w3.org/1999/xhtml',
            doc.documentElement.namespaceURI
        );
        assertEquals(
            'html',
            doc.documentElement.tagName
        );
        assertEquals(
            0,
            doc.documentElement.childNodes.length
        );
    },

    testXPath: function() {
        var xmlStr = '<html><body>Juhu <em id="toll">Kinners</em>. Wie geht es <em>Euch</em>?</body></html>';
        var doc2 = qx.xml.Document.fromString(xmlStr);

        var em = doc2.getElementsByTagName("em")[0];
        assertEquals('<em id="toll">Kinners</em>', qx.xml.Element.serialize(em));

        assertEquals(
            qx.xml.Element.serialize(em),
            qx.xml.Element.serialize(qx.xml.Element.selectSingleNode(doc2, '//*[@id="toll"]'))
        );

        assertEquals(
            qx.xml.Element.serialize(doc2.getElementsByTagName("body")[0]),
            qx.xml.Element.serialize(qx.xml.Element.selectSingleNode(doc2, '//body'))
        );

        assertEquals(
            qxunit.Xml.serializeArray(doc2.getElementsByTagName("em")),
            qxunit.Xml.serializeArray(qx.xml.Element.selectNodes(doc2, '//em'))
        );

        assertEquals(
            qxunit.Xml.serializeArray(doc2.getElementsByTagName("em")),
            qxunit.Xml.serializeArray(qx.xml.Element.selectNodes(doc2.documentElement, '//em'))
        );
    },

    testXHR: function() {

        function error(msg) {
            return function() {
                failed = msg;
            }
        }

        var req = new qx.io.remote.Request(
            "../source/html/qooxdoo-blog.xml",
            qx.net.Http.METHOD_GET, qx.util.Mime.XML
        );
        req.setAsynchronous(false);
        var failed = "";
        var xmlDocument;
        req.addEventListener("aborted", error("aborted"));
        req.addEventListener("failed", error("failed"));
        req.addEventListener("timeout", error("timeout"));
        req.addEventListener("completed", function(e) {
            xmlDocument = e.getData().getContent();
        });
        req.send();

        assertEquals("", failed);
        assertTrue(qx.xml.Document.isDocument(xmlDocument));
        assertEquals("rss", xmlDocument.documentElement.tagName);
    },

    testGetElementsByTagNameNS: function() {
        var xmlStr = "<?xml version='1.0' encoding='UTF-8'?>"+
            "<xsl:stylesheet version='1.0' xmlns:xsl='http://www.w3.org/1999/XSL/Transform'>"+
            "<xsl:output method='xml' version='1.0' encoding='UTF-8' indent='yes'/>"+
            "<xsl:template match='*'></xsl:template><xsl:template match='@*'>"+
            "</xsl:template></xsl:stylesheet>";

        nsDoc = qx.xml.Document.fromString(xmlStr);

        var templates = qx.xml.Element.getElementsByTagNameNS(
            nsDoc,
            "http://www.w3.org/1999/XSL/Transform",
            "template"
        );

        debug(qx.xml.String.escape(qxunit.Xml.serializeArray(templates)));
        assertEquals(
            "getElementsByTagNameNS for XML documents failed!",
            2,
            templates.length
        );

        assertEquals(
            "getElementsByTagNameNS for XML documents failed!",
            "xsl:template",
            templates[0].tagName
        );

        var templates = qx.xml.Element.getElementsByTagNameNS(
            nsDoc.documentElement,
            "http://www.w3.org/1999/XSL/Transform",
            "template"
        );

        assertEquals(
            "getElementsByTagNameNS for element nodes failed!",
            2,
            templates.length
        );

        assertEquals(
            "getElementsByTagNameNS for element nodes failed!",
            "xsl:template",
            templates[0].tagName
        );
   }

}});