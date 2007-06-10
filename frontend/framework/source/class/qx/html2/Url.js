qx.Class.define("qx.html2.Url",
{
  statics :
  {
    /**
     * Adopted from Mochikit
     *
     * @type static
     * @param encodedString {var} TODOC
     * @return {Object} TODOC
     */
    parseQueryString : function(encodedString)
    {
      // strip a leading '?' from the encoded string
      var qstr = (encodedString.charAt(0) == "?") ? encodedString.substring(1) : encodedString;
      var pairs = qstr.replace(/\+/g, "%20").split(/(\&amp\;|\&\#38\;|\&#x26;|\&)/);
      var o = {};
      var decode;

      if (window.decodeURIComponent !== undefined) {
        decode = decodeURIComponent;
      } else {
        decode = unescape;
      }

      for (i=0; i<pairs.length; i++)
      {
        pair = pairs[i].split("=");
        var name = pair.shift();

        if (!name) {
          continue;
        }

        o[decode(name)] = decode(pair.join("="));
      }

      return o;
    }    
  }
});
