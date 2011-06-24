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

************************************************************************ */

/**
 * Base64 encoder
 */
qx.Class.define("qx.util.Base64", {
  statics : {
    /** Characters allowed in a Base 64 encoded string */
    __base64Chars : [ 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '+', '/' ],


    /**
     * Encode a string using base64 encoding (http://en.wikipedia.org/wiki/Base64).
     *
     * @param input {String} the input string to encode
     *
     * @param is8bit {Boolean?} Whether the character set is 8-bit, not
     *   multi-byte.  If this parameter is not provided, the character set is
     *   determined from the 'document' object.
     *
     * @return {String} The base64 encoded input string.
     */
    encode : function(input, is8bit)
    {
      var isMultiByte;

      if (typeof is8bit == "undefined")
      {
        var charSet = document.characterSet || document.charset;
        isMultiByte = charSet.toLowerCase().indexOf('utf') != -1;

        if (!isMultiByte && window.btoa instanceof Function) {
          return btoa(input);
        }
      }
      else
      {
        isMultiByte = ! is8bit;
      }

      var padding = '=';
      var base64Chars = this.__base64Chars;
      var length = input.length;
      var output = [];
      var result = [];
      var i = 0;

      var translateUTF8 = this.__translateUTF8;

      while (i < length) {
        translateUTF8(input.charCodeAt(i++), output, !isMultiByte);
      }

      for (var k=0, l=output.length; k<l; k+=3)
      {
        if (k + 1 === l)
        {
          result.push(base64Chars[output[k] >> 2]);
          result.push(base64Chars[(output[k] & 3) << 4]);
          result.push(padding + padding);
          break;
        }

        if (k + 2 === l)
        {
          result.push(base64Chars[output[k] >> 2]);
          result.push(base64Chars[(output[k] & 3) << 4 | output[k + 1] >> 4]);
          result.push(base64Chars[(output[k + 1] & 15) << 2]);
          result.push(padding);
          break;
        }

        result.push(base64Chars[output[k] >> 2]);
        result.push(base64Chars[(output[k] & 3) << 4 | output[k + 1] >> 4]);
        result.push(base64Chars[(output[k + 1] & 15) << 2 | output[k + 2] >> 6]);
        result.push(base64Chars[output[k + 2] & 63]);
      }

      return result.join('');
    },


    /**
     * Adds to output array the UTF-8 bytes needed to represent the character (http://en.wikipedia.org/wiki/UTF8)
     *
     * @param characterCode {Integer} the code of the character
     * @param output {Array} the array of bytes to be filled
     * @param is8bit {boolean} specifies whether we should not treat the array as a multi byte string
     * @return {void}
     */
    __translateUTF8 : function(characterCode, output, is8bit)
    {
      if (characterCode < 128)
      {
        output.push(characterCode);
        return;
      }

      if (characterCode < 256 && is8bit)
      {
        output.push(characterCode);
        return;
      }

      if (characterCode < 2048)
      {
        output.push(192 | characterCode >> 6);
        output.push(128 | characterCode & 63);
        return;
      }

      if (characterCode < 65536)
      {
        output.push(224 | characterCode >> 12);
        output.push(128 | (characterCode >> 6) & 63);
        output.push(128 | characterCode & 63);
        return;
      }
      else
      {
        output.push(240 | characterCode >> 18);
        output.push(128 | (characterCode >> 12) & 63);
        output.push(128 | (characterCode >> 6) & 63);
        output.push(128 | characterCode & 63);
        return;
      }
    },


    /**
     * Returns a String from an array of bytes, with special treatment
     * if the bytes are UTF-8 bytes (http://en.wikipedia.org/wiki/UTF8)
     *
     * @param bytes {Array} the byte array [8it integers]
     * @param is8bit {boolean} specifies whether we should not treat the array as a multi byte string
     * @return {String} the string backed by the byte array
     */
    __getUTF8StringFromBytes : function(bytes, is8bit)
    {
      var charString = '';
      var result = [];

      if (is8bit)
      {
        result = bytes;
      }
      else
      {
        for (var i=0; i<bytes.length; i++)
        {
          var utfByte = bytes[i];

          if (utfByte >> 7 === 0) {
            result.push(utfByte);
          }

          if (utfByte >> 5 === 6)
          {
            var nextByte = bytes[++i];
            result.push(((utfByte & 28) >> 2) << 8 | ((utfByte & 3) << 6) | nextByte & 63);
          }

          if (utfByte >> 4 === 14)
          {
            var nextBytes = [ bytes[++i], bytes[++i] ];
            result.push((utfByte & 15) << 12 | ((nextBytes[0] & 60) >> 2) << 8 | (nextBytes[0] & 3) << 6 | (nextBytes[1] & 63));
          }

          if (utfByte >> 3 === 30)
          {
            var nextBytes = [ bytes[++i], bytes[++i], bytes[++i] ];
            result.push((utfByte & 7) << 18 | (utfByte & 48) << 16 | (nextBytes[0] & 15) << 12 | ((nextBytes[1] & 60) >> 2) << 8 | (nextBytes[1] & 3) << 6 | (nextBytes[2] & 63));
          }
        }
      }

      for (var i=0, l=result.length; i<l; i++) {
        charString += String.fromCharCode(result[i]);
      }

      return charString;
    },


    /**
     * Decode a base64 string (http://en.wikipedia.org/wiki/Base64).
     *
     * @param input {String} the input string to decode
     *
     * @param is8bit {Boolean?} Whether the character set is 8-bit, not
     *   multi-byte.  If this parameter is not provided, the character set is
     *   determined from the 'document' object.
     *
     * @return {String} The decoded input string.
     */
    decode : function(input, is8bit)
    {
      var base64Chars = this.__base64Chars;
      var isMultiByte;

      if (typeof is8bit == "undefined")
      {
        var charSet = document.characterSet || document.charset;
        isMultiByte = charSet.toLowerCase().indexOf('utf') != -1;

        if (!isMultiByte && window.atob instanceof Function) {
          return atob(input);
        }
      }
      else
      {
        isMultiByte = ! is8bit;
      }

      var ilength = input.length;
      var stringBytes = [], i = 0;

      while (i < ilength)
      {
        var base64Byte1 = base64Chars.indexOf(input.charAt(i++));
        var base64Byte2 = base64Chars.indexOf(input.charAt(i++));
        var c1 = base64Byte1 << 2 | base64Byte2 >> 4;
        stringBytes.push(c1);
        var specialChar = input.charAt(i++);

        if (specialChar !== '=')
        {
          var base64Byte3 = base64Chars.indexOf(specialChar);
          var c2 = (base64Byte2 & 15) << 4 | (base64Byte3 & 60) >> 2;
          stringBytes.push(c2);
        }

        specialChar = input.charAt(i++);

        if (specialChar !== '=')
        {
          var base64Byte4 = base64Chars.indexOf(specialChar);
          var c3 = (base64Byte3 & 3) << 6 | base64Byte4;
          stringBytes.push(c3);
        }
      }

      return this.__getUTF8StringFromBytes(stringBytes, !isMultiByte);
    }
  }
});
