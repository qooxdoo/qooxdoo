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

/**
 * Static helpers for parsing and modifying URIs.
 */
qx.Bootstrap.define("qx.util.Uri",
{

  statics:
  {
    /**
     * Split URL
     *
     * Code taken from:
     *   parseUri 1.2.2
     *   (c) Steven Levithan <stevenlevithan.com>
     *   MIT License
     *
     *
     * @param str {String} String to parse as URI
     * @param strict {Boolean} Whether to parse strictly by the rules
     * @return {Object} Map with parts of URI as properties
     */
    parseUri: function(str, strict) {

      var options = {
        key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
        q:   {
          name:   "queryKey",
          parser: /(?:^|&)([^&=]*)=?([^&]*)/g
        },
        parser: {
          strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@?]*)(?::([^:@?]*))?)?@)?((?:\[[0-9A-Fa-f:]+\])|(?:[^:\/?#\[\]]*))(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
          loose:  /^(?:(?![^:@?]+:[^:@?\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@?]*)(?::([^:@?]*))?)?@)?((?:\[[0-9A-Fa-f:]+\])|(?:[^:\/?#\[\]]*))(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
        }
      };

      var o = options,
          m = options.parser[strict ? "strict" : "loose"].exec(str),
          uri = {},
          i = 14;

      while (i--) {
        uri[o.key[i]] = m[i] || "";
      }
      uri[o.q.name] = {};
      uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
        if ($1) {
          uri[o.q.name][$1] = $2;
        }
      });

      return uri;
    },

    /**
     * Append string to query part of URL. Respects existing query.
     *
     * @param url {String} URL to append string to.
     * @param params {String} Parameters to append to URL.
     * @return {String} URL with string appended in query part.
     */
    appendParamsToUrl: function(url, params) {

      if (params === undefined) {
        return url;
      }

      if (qx.core.Environment.get("qx.debug")) {
        if (!(qx.lang.Type.isString(params) || qx.lang.Type.isObject(params))) {
          throw new Error("params must be either string or object");
        }
      }

      if (qx.lang.Type.isObject(params)) {
        params = qx.util.Uri.toParameter(params);
      }

      if (!params) {
        return url;
      }

      return url += (/\?/).test(url) ? "&" + params : "?" + params;
    },


    /**
     * Serializes an object to URI parameters (also known as query string).
     *
     * Escapes characters that have a special meaning in URIs as well as
     * umlauts. Uses the global function encodeURIComponent, see
     * https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/encodeURIComponent
     *
     * Note: For URI parameters that are to be sent as
     * application/x-www-form-urlencoded (POST), spaces should be encoded
     * with "+".
     *
     * @param obj {Object}   Object to serialize.
     * @param post {Boolean} Whether spaces should be encoded with "+".
     * @return {String}      Serialized object. Safe to append to URIs or send as
     *                       URL encoded string.
     */
    toParameter: function(obj, post)
    {
      var key,
          parts = [];

      for (key in obj) {
        if (obj.hasOwnProperty(key)) {
          var value = obj[key];
          if (value instanceof Array) {
            for (var i=0; i<value.length; i++) {
              this.__toParameterPair(key, value[i], parts, post);
            }
          } else {
            this.__toParameterPair(key, value, parts, post);
          }
        }
      }

      return parts.join("&");
    },


    /**
     * Encodes key/value to URI safe string and pushes to given array.
     *
     * @param key {String} Key.
     * @param value {String} Value.
     * @param parts {Array} Array to push to.
     * @param post {Boolean} Whether spaces should be encoded with "+".
     */
    __toParameterPair : function(key, value, parts, post) {
      var encode = window.encodeURIComponent;
      if (post) {
        parts.push(encode(key).replace(/%20/g, "+") + "=" +
          encode(value).replace(/%20/g, "+"));
      } else {
        parts.push(encode(key) + "=" + encode(value));
      }
    },


    /**
     * Takes a relative URI and returns an absolute one.
     *
     * @param uri {String} relative URI
     * @return {String} absolute URI
     */
    getAbsolute : function(uri)
    {
      var div = document.createElement("div");
      div.innerHTML = '<a href="' + uri + '">0</a>';
      return div.firstChild.href;
    }
  }
});
