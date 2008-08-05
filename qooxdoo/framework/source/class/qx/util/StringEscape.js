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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Generic escaping and unescaping of DOM strings.
 *
 * {@link qx.bom.String} for (un)escaping of HTML strings.
 * {@link qx.xml.String} for (un)escaping of XML strings.
 */
qx.Bootstrap.define("qx.util.StringEscape",
{
  statics :
  {
    /**
     * generic escaping method
     *
     * @param str {String} string to escape
     * @param charCodeToEntities {Map} entity to charcode map
     * @return {String} escaped string
     * @signature function(str, charCodeToEntities)
     */
    escape : qx.core.Variant.select("qx.client",
    {
      // IE and Opera:
      //  - use [].join() to build strings
      "mshtml": function(str, charCodeToEntities)
      {
        var entity, result = [];

        for (var i=0, l=str.length; i<l; i++)
        {
          var chr = str.charAt(i);
          var code = chr.charCodeAt(0);

          if (charCodeToEntities[code]) {
            entity = "&" + charCodeToEntities[code] + ";";
          }
          else
          {
            if (code > 0x7F) {
              entity = "&#" + code + ";";
            } else {
              entity = chr;
            }
          }

          result[result.length] = entity;
        }

        return result.join("");
      },

      // other browsers:
      //  - use += to build strings
      "default": function(str, charCodeToEntities)
      {
        var entity, result = "";

        for (var i=0, l=str.length; i<l; i++)
        {
          var chr = str.charAt(i);
          var code = chr.charCodeAt(0);

          if (charCodeToEntities[code]) {
            entity = "&" + charCodeToEntities[code] + ";";
          }
          else
          {
            if (code > 0x7F) {
              entity = "&#" + code + ";";
            } else {
              entity = chr;
            }
          }

          result += entity;
        }

        return result;
      }
    }),


    /**
     * generic unescaping method
     *
     * @param str {String} string to unescape
     * @param entitiesToCharCode {Map} charcode to entity map
     * @return {var} TODOC
     */
    unescape : function(str, entitiesToCharCode)
    {
      return str.replace(/&[#\w]+;/gi, function(entity)
      {
        var chr = entity;
        var entity = entity.substring(1, entity.length - 1);
        var code = entitiesToCharCode[entity];

        if (code) {
          chr = String.fromCharCode(code);
        }
        else
        {
          if (entity.charAt(0) == '#')
          {
            if (entity.charAt(1).toUpperCase() == 'X')
            {
              code = entity.substring(2);

              // match hex number
              if (code.match(/^[0-9A-Fa-f]+$/gi)) {
                chr = String.fromCharCode(parseInt(code, 16));
              }
            }
            else
            {
              code = entity.substring(1);

              // match integer
              if (code.match(/^\d+$/gi)) {
                chr = String.fromCharCode(parseInt(code, 10));
              }
            }
          }
        }

        return chr;
      });
    }
  }
});
