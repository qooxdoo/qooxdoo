qx.Clazz.define("qxunit.Lang", { statics : {

  /** string tests */
    testString: function() {
        assertNotUndefined(qx.lang.String);
    },

    testFormat: function() {
        assertNotUndefined(qx.lang.String.format);
        var Str = qx.lang.String;

        assertEquals("1-2", Str.format("%1-%2", [1, 2]));
        assertEquals("2-1", Str.format("%2-%1", [1, 2]));

        assertEquals("1-2", Str.format("%1-%2", ["1", "2"]));
        assertEquals("2-1", Str.format("%2-%1", ["1", "2"]));

    },

    testPad: function() {
        assertNotUndefined(qx.lang.String.pad);
        var Str = qx.lang.String;

        assertEquals("------", Str.pad("", 6, '-'));

        assertEquals("---123", Str.pad("123", 6, '-'));
        assertEquals("----123", Str.pad("123", 7, '-'));
        assertEquals("    123", Str.pad("123", 7, ' '));
        assertEquals("0000123", Str.pad("123", 7));

        assertEquals("123", Str.pad("123", 2, '-'));
        assertEquals("123", Str.pad("123", 3, '-'));
    },

    testAddRemovelistItem: function() {
        assertNotUndefined(qx.lang.String.pad);
        var Str = qx.lang.String;

        assertEquals("a", Str.addListItem("a", "a", ", "));
        assertEquals("a", Str.addListItem("", "a", ", "));

        assertEquals("a, b", Str.addListItem("a", "b", ", "));
        assertEquals("a, b", Str.addListItem("a, b", "b", ", "));

        assertEquals("a,b", Str.addListItem("a", "b"));
        assertEquals("a,b", Str.addListItem("a,b", "b"));

        assertEquals("a,b", Str.removeListItem("a,b,c", "c"));
        assertEquals("a,b", Str.removeListItem("a,c,b", "c"));
        assertEquals("a,b", Str.removeListItem("c,a,b", "c"));

        assertEquals("a, b", Str.removeListItem("a, b, c", "c", ", "));
        assertEquals("a, b", Str.removeListItem("a, c, b", "c", ", "));
        assertEquals("a, b", Str.removeListItem("c, a, b", "c", ", "));

        assertEquals("a, b", Str.removeListItem("a, b", "c", ", "));

        assertEquals("", Str.removeListItem("", "c"));
    },

    /** Array tests */
    testAppend: function() {
        assertNotUndefined(qx.lang.Array.append);
        var a = [1,2,3];
        qx.lang.Array.append(a, [4, 5, 6]);
        assertEquals(a.join(), [1,2,3,4,5,6].join());

        var error = false;
        try {
            qx.lang.Array.append(a, 1);
        } catch (ex) {
            error = true;
        }
        assert(error);
    },

    /** Object tests */
    testObject: function() {
        assertNotUndefined(qx.lang.Object);
    },

    testInvert: function() {
        assertNotUndefined(qx.lang.Object.invert);
        var Obj = qx.lang.Object;

        assertEquals(
            qx.io.Json.stringify({a: "1", "2": "b"}),
            qx.io.Json.stringify(Obj.invert({1: "a", b: 2}))
        );
    },

    /** StringEscape tests */

    testEscape: function() {
        // escape HTML
        assertEquals("\n", qx.html.String.escape("\n"));

        assertEquals("Hello", qx.html.String.escape("Hello"));
        assertEquals("juhu &lt;&gt;", qx.html.String.escape("juhu <>"));

        assertEquals(
          "&lt;div id='1'&gt;&amp;nbsp; &euro;&lt;/div&gt;",
          qx.html.String.escape("<div id='1'>&nbsp; €</div>")
        );


        // textToHtml
        assertEquals(
          "&lt;div id='1'&gt;<br> &nbsp;&amp;nbsp; &euro;&lt;/div&gt;",
          qx.html.String.fromText("<div id='1'>\n  &nbsp; €</div>")
        );


        // htmlToText
        assertEquals(
          "<div id='1'>\n \u00A0&nbsp; €</div>",
          qx.html.String.toText("&lt;div id='1'&gt;<br> &nbsp;&amp;nbsp;  \n   &euro;&lt;/div&gt;")
        );

        // unescape HTML
        assertEquals("\n", qx.html.String.unescape("\n"));
        assertEquals("Hello", qx.html.String.unescape("Hello"));
        assertEquals("juhu <>", qx.html.String.unescape("juhu &lt;&gt;"));

        assertEquals(
          "<div id='1'>&nbsp; €</div>",
          qx.html.String.unescape("&lt;div id='1'&gt;&amp;nbsp; &euro;&lt;/div&gt;")
        );

        assertEquals(
          ">&zzzz;x",
          qx.html.String.unescape("&gt;&zzzz;x")
        );

        assertEquals(
          "€",
          qx.html.String.unescape("&#x20AC;")
        );

        assertEquals(
          "€",
          qx.html.String.unescape("&#X20AC;")
        );

        // escape XMl
        assertEquals("\n", qx.xml.String.escape("\n"));
        assertEquals("Hello", qx.xml.String.escape("Hello"));
        assertEquals("juhu &lt;&gt;", qx.xml.String.escape("juhu <>"));

        assertEquals(
          "&lt;div id=&apos;1&apos;&gt;&amp;nbsp; &#8364;&lt;/div&gt;",
          qx.xml.String.escape("<div id='1'>&nbsp; €</div>")
        );

        assertEquals(
            "&quot;bread&quot; &amp; &quot;butter&quot;",
            qx.xml.String.escape('"bread" & "butter"')
        );

        // unescape XML
        assertEquals("\n", qx.xml.String.unescape("\n"));
        assertEquals("Hello", qx.xml.String.unescape("Hello"));
        assertEquals("juhu <>", qx.xml.String.unescape("juhu &lt;&gt;"));

        assertEquals(
           "<div id='1'>&nbsp; €</div>",
           qx.xml.String.unescape("&lt;div id=&apos;1&apos;&gt;&amp;nbsp; &#8364;&lt;/div&gt;")
         );

         assertEquals(
             '"bread" & "butter"',
             qx.xml.String.unescape("&quot;bread&quot; &amp; &quot;butter&quot;")
         );
    }


}});