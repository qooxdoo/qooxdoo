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

qx.Class.define("qx.test.lang.String",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    testString : function() {
      this.assertNotUndefined(qx.lang.String);
    },


    testFormat : function()
    {
      this.assertNotUndefined(qx.lang.String.format);
      var Str = qx.lang.String;

      this.assertEquals("1-2", Str.format("%1-%2", [ 1, 2 ]));
      this.assertEquals("2-1", Str.format("%2-%1", [ 1, 2 ]));

      this.assertEquals("1-2", Str.format("%1-%2", [ "1", "2" ]));
      this.assertEquals("2-1", Str.format("%2-%1", [ "1", "2" ]));
    },


    testPad : function()
    {
      this.assertNotUndefined(qx.lang.String.pad);
      var Str = qx.lang.String;

      this.assertEquals("------", Str.pad("", 6, '-'));

      this.assertEquals("---123", Str.pad("123", 6, '-'));
      this.assertEquals("----123", Str.pad("123", 7, '-'));
      this.assertEquals("    123", Str.pad("123", 7, ' '));
      this.assertEquals("0000123", Str.pad("123", 7));

      this.assertEquals("123", Str.pad("123", 2, '-'));
      this.assertEquals("123", Str.pad("123", 3, '-'));
    },


    testAppend : function()
    {
      this.assertNotUndefined(qx.lang.Array.append);
      var a = [ 1, 2, 3 ];
      qx.lang.Array.append(a, [ 4, 5, 6 ]);

      this.assertJsonEquals(a, [ 1, 2, 3, 4, 5, 6 ]);

      var error = false;

      try {
        qx.lang.Array.append(a, 1);
      } catch(ex) {
        error = true;
      }

      this.assert(error);
    },


    testEscape : function()
    {
      // escape HTML
      this.assertEquals("\n", qx.bom.String.escape("\n"));

      this.assertEquals("Hello", qx.bom.String.escape("Hello"));
      this.assertEquals("juhu &lt;&gt;", qx.bom.String.escape("juhu <>"));

      this.assertEquals("&lt;div id='1'&gt;&amp;nbsp; &euro;&lt;/div&gt;", qx.bom.String.escape("<div id='1'>&nbsp; €</div>"));

      // textToHtml
      this.assertEquals("&lt;div id='1'&gt;<br> &nbsp;&amp;nbsp; &euro;&lt;/div&gt;", qx.bom.String.fromText("<div id='1'>\n  &nbsp; €</div>"));

      // htmlToText
      this.assertEquals("<div id='1'>\n \u00A0&nbsp; €</div>", qx.bom.String.toText("&lt;div id='1'&gt;<br> &nbsp;&amp;nbsp;  \n   &euro;&lt;/div&gt;"));

      // unescape HTML
      this.assertEquals("\n", qx.bom.String.unescape("\n"));
      this.assertEquals("Hello", qx.bom.String.unescape("Hello"));
      this.assertEquals("juhu <>", qx.bom.String.unescape("juhu &lt;&gt;"));

      this.assertEquals("<div id='1'>&nbsp; €</div>", qx.bom.String.unescape("&lt;div id='1'&gt;&amp;nbsp; &euro;&lt;/div&gt;"));

      this.assertEquals(">&zzzz;x", qx.bom.String.unescape("&gt;&zzzz;x"));

      this.assertEquals("€", qx.bom.String.unescape("&#x20AC;"));

      this.assertEquals("€", qx.bom.String.unescape("&#X20AC;"));

      // escape XML
      this.assertEquals("\n", qx.xml.String.escape("\n"));
      this.assertEquals("Hello", qx.xml.String.escape("Hello"));
      this.assertEquals("juhu &lt;&gt;", qx.xml.String.escape("juhu <>"));

      this.assertEquals("&lt;div id=&apos;1&apos;&gt;&amp;nbsp; &#8364;&lt;/div&gt;", qx.xml.String.escape("<div id='1'>&nbsp; €</div>"));

      this.assertEquals("&quot;bread&quot; &amp; &quot;butter&quot;", qx.xml.String.escape('"bread" & "butter"'));

      // unescape XML
      this.assertEquals("\n", qx.xml.String.unescape("\n"));
      this.assertEquals("Hello", qx.xml.String.unescape("Hello"));
      this.assertEquals("juhu <>", qx.xml.String.unescape("juhu &lt;&gt;"));

      this.assertEquals("<div id='1'>&nbsp; €</div>", qx.xml.String.unescape("&lt;div id=&apos;1&apos;&gt;&amp;nbsp; &#8364;&lt;/div&gt;"));

      this.assertEquals('"bread" & "butter"', qx.xml.String.unescape("&quot;bread&quot; &amp; &quot;butter&quot;"));
    },


    testStringExtend : function()
    {
      qx.Class.define("qx.String",
      {
        extend : qx.core.BaseString,

        members :
        {
          bold : function() {
            //console.log("bold", this);
            return "<b>" + this.toString() + "</b>";
          },

          setText : function(txt) {
            this._txt = txt;
          }
        }
      });

      var s = new qx.String("Juhu");
      this.assertEquals("<b>Juhu</b>", s.bold());
      this.assertEquals("JUHU", s.toUpperCase());
      this.assertEquals(1, s.indexOf("u"));
      this.assertEquals("__Juhu__", ["__", s + "__"].join(""));

      s.setText("Kinners");
      this.assertEquals("Kinners", s);
    }
  }
});
