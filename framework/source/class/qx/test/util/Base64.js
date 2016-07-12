/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Adrian Olaru (adrianolaru)

************************************************************************ */

qx.Class.define("qx.test.util.Base64", {
  extend : qx.dev.unit.TestCase,

  members : {
    testEncodeDecode : function() {
      var str = "Luke, I'm your father! Nooooooooooo!";
      var encodedStr = qx.util.Base64.encode(str);
      this.assertEquals(str, qx.util.Base64.decode(encodedStr));
    },


    testChineseChars : function() {
      var str = "Abecedariab语言工具";
      var encodedStr = qx.util.Base64.encode(str);
      this.assertEquals(str, qx.util.Base64.decode(encodedStr));
    },


    testChineseCharsExplicitNot8bit : function() {
      var str = "Abecedariab语言工具";
      var encodedStr = qx.util.Base64.encode(str, false);
      this.assertEquals(str, qx.util.Base64.decode(encodedStr, false));
    },


    testChineseCharsExplicit8bit : function() {
      var str = "Abecedariab语言工具";
      var encodedStr = qx.util.Base64.encode(str, false);
      this.assertNotEquals(str, qx.util.Base64.decode(encodedStr, true));
    },


    testGermanChars : function() {
      var str = "Am Donnerstag diskutieren die Abgeordneten dann ab 9 Uhr zweieinhalb Stunden lang in erster Lesung über drei fraktionsübergreifende Gesetzentwürfe zur Präimplantationsdiagnostik (PID). Weitere Themen sind am Donnerstag unter anderem der Schutz vor Straßen- und Schienenlärm und die Einführung eines Mindestlohns";
      var encodedStr = qx.util.Base64.encode(str);
      this.assertEquals(str, qx.util.Base64.decode(encodedStr));
    },

    testKnownEncoding : function() {
      var str = "Hello\nThis\nIs\nA\nText\nFile";
      var expected = "SGVsbG8KVGhpcwpJcwpBClRleHQKRmlsZQ==";
      var encodedStr = qx.util.Base64.encode(str);
      this.assertEquals(encodedStr, expected);
      this.assertEquals(str, qx.util.Base64.decode(encodedStr));
    }
  }
});
