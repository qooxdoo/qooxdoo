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

   ======================================================================

   This class contains code based on the following work:

   * Cross-Browser Split
     http://blog.stevenlevithan.com/archives/cross-browser-split
     Version 0.1

     Copyright:
       (c) 2006-2007, Steven Levithan <http://stevenlevithan.com>

     License:
       MIT: http://www.opensource.org/licenses/mit-license.php

     Authors:
       * Steven Levithan

************************************************************************ */

/**
 * Implements an ECMA-compliant, uniform cross-browser split method
 */
qx.Bootstrap.define("qx.util.StringSplit",
{
  statics :
  {
    /**
     * ECMA-compliant, uniform cross-browser split method
     *
     * @param string {String} Incoming string to split
     * @param separator {RegExp} Specifies the character to use for separating the string.
     *   The separator is treated as a string or a  regular expression. If separator is
     *   omitted, the array returned contains one element consisting of the entire string.
     * @param limit {Integer?} Integer specifying a limit on the number of splits to be found.
     * @return {String[]} splitted string
     */
    split : function(string, separator, limit)
    {
      var flags = "";

      /* Behavior for separator: If it's...
      - Undefined: Return an array containing one element consisting of the entire string
      - A regexp or string: Use it
      - Anything else: Convert it to a string, then use it */

      if (separator === undefined)
      {
        return [ string.toString() ];  // toString is used because the typeof string is object
      }
      else if (separator === null || separator.constructor !== RegExp)
      {
        // Convert to a regex with escaped metacharacters
        separator = new RegExp(String(separator).replace(/[.*+?^${}()|[\]\/\\]/g, "\\$&"), "g");
      }
      else
      {
        flags = separator.toString().replace(/^[\S\s]+\//, "");

        if (!separator.global) {
          separator = new RegExp(separator.source, "g" + flags);
        }
      }

      // Used for the IE non-participating capturing group fix
      var separator2 = new RegExp("^" + separator.source + "$", flags);

      /* Behavior for limit: If it's...
      - Undefined: No limit
      - Zero: Return an empty array
      - A positive number: Use limit after dropping any decimal value (if it's then zero, return an empty array)
      - A negative number: No limit, same as if limit is undefined
      - A type/value which can be converted to a number: Convert, then use the above rules
      - A type/value which cannot be converted to a number: Return an empty array */

      if (limit === undefined || +limit < 0)
      {
        limit = false;
      }
      else
      {
        limit = Math.floor(+limit);
        if (!limit) {
          return [];  // NaN and 0 (the values which will trigger the condition here) are both falsy
        }
      }

      var match, output = [], lastLastIndex = 0, i = 0;

      while ((limit ? i++ <= limit : true) && (match = separator.exec(string)))
      {
        // Fix IE's infinite-loop-resistant but incorrect RegExp.lastIndex
        if ((match[0].length === 0) && (separator.lastIndex > match.index)) {
          separator.lastIndex--;
        }

        if (separator.lastIndex > lastLastIndex)
        {
          /* Fix IE to return undefined for non-participating capturing groups (NPCGs). Although IE
          incorrectly uses empty strings for NPCGs with the exec method, it uses undefined for NPCGs
          with the replace method. Conversely, Firefox incorrectly uses empty strings for NPCGs with
          the replace and split methods, but uses undefined with the exec method. Crazy! */

          if (match.length > 1)
          {
            match[0].replace(separator2, function()
            {
              for (var j=1; j<arguments.length-2; j++)
              {
                if (arguments[j] === undefined) {
                  match[j] = undefined;
                }
              }
            });
          }

          output = output.concat(string.substring(lastLastIndex, match.index), (match.index === string.length ? [] : match.slice(1)));
          lastLastIndex = separator.lastIndex;
        }

        if (match[0].length === 0) {
          separator.lastIndex++;
        }
      }

      return (lastLastIndex === string.length) ?
        (separator.test("") ? output : output.concat("")) :
        (limit ? output : output.concat(string.substring(lastLastIndex)));
    }
  }
});
