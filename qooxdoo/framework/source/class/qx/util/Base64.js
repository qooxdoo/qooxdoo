/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Adrian Olaru (adrianolaru)

   ======================================================================

   This class contains code based on the following work:

   * Base64 encode / decode
       http://www.webtoolkit.info/javascript-base64.html

     Copyright:
       (c) 2011, http://www.webtoolkit.info/

     License:
       Creative-Commons Attribution 2.0 England and Wales:
       http://www.webtoolkit.info/licence

************************************************************************ */

/**
 * Base64 encoder
 */
qx.Class.define("qx.util.Base64",
{
  statics :
  {
    __keystr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

    /**
     * Encode a string using base64 encoding (http://en.wikipedia.org/wiki/Base64).
     *
     * @param input {String} the input string to encode
     * @return {String} The base64 encoded input string.
     */
    encode : function(input)
    {
      var keyStr = this.__keystr;
      var output = "";
      var chr1, chr2, chr3;
      var enc1, enc2, enc3, enc4;
      var i = 0;

      do
      {
        chr1 = input.charCodeAt(i++);
        chr2 = input.charCodeAt(i++);
        chr3 = input.charCodeAt(i++);

        enc1 = chr1 >> 2;
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        enc4 = chr3 & 63;

        if (isNaN(chr2)) {
          enc3 = enc4 = 64;
        } else if (isNaN(chr3)) {
          enc4 = 64;
        }

        output += keyStr.charAt(enc1) + keyStr.charAt(enc2) + keyStr.charAt(enc3) + keyStr.charAt(enc4);
      }
      while (i < input.length);

      return output;
    },


    /**
     * Decode a base64 string (http://en.wikipedia.org/wiki/Base64).
     *
     * @param input {String} the input string to decode
     * @return {String} The decoded input string.
     */
    decode : function (input)
    {
      var keyStr = this.__keystr;
      var output = "";
      var chr1, chr2, chr3;
      var enc1, enc2, enc3, enc4;
      var i = 0;

      input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

      while (i < input.length) {
        enc1 = keyStr.indexOf(input.charAt(i++));
        enc2 = keyStr.indexOf(input.charAt(i++));
        enc3 = keyStr.indexOf(input.charAt(i++));
        enc4 = keyStr.indexOf(input.charAt(i++));

        chr1 = (enc1 << 2) | (enc2 >> 4);
        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        chr3 = ((enc3 & 3) << 6) | enc4;

        output = output + String.fromCharCode(chr1);
        if (enc3 != 64) {
          output = output + String.fromCharCode(chr2);
        }
        if (enc4 != 64) {
          output = output + String.fromCharCode(chr3);
        }
      }

      return output;
    }
  }
});
