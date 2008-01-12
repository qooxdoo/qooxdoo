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
     * Andreas Ecker (ecker)
     * Fabian Jakobs (fjakobs)

   ======================================================================

   This class contains code based on the following work:

   * Mootools
     http://mootools.net/
     Version 1.1.1

     Copyright:
       (c) 2007 Valerio Proietti

     License:
       MIT: http://www.opensource.org/licenses/mit-license.php


************************************************************************ */

qx.Class.define("qx.util.Type",
{
  statics :
  {
    /**
     * Returns the type of object that matches the element passed in.
     *
     * @type static
     * @param obj {var} the object to inspect
     * @return {String} "element" obj is a DOM element node
     *    "textnode" obj is a DOM text node
     *    "whitespace" obj is a DOM whitespace node
     *    "arguments" obj is an arguments object
     *    "array" obj is an array
     *    "object" obj is an object
     *    "string" obj is a string
     *    "number" obj is a number
     *    "boolean" obj is a boolean
     *    "function" obj is a function
     *    "regexp" obj is a regular expression
     *    "collection" obj is a native htmlelements collection, such as childNodes, getElementsByTagName .. etc
     *    "window" obj is the window object
     *    "document" obj is the document object
     *    "undefined" obj is undefined
     *    "NaN" obj is an invalid number
     */
    detect : function(obj)
    {
      if (obj == undefined) {
        return "undefined";
      }

      if (obj.htmlElement) {
        return "element";
      }

      if (obj.nodeName)
      {
        switch(obj.nodeType)
        {
          case 1:
            return "element";

          case 3:
            return (/\S/).test(obj.nodeValue) ? "textnode" : "whitespace";
        }
      }
      else if (typeof obj.length == "number")
      {
        if (obj.item) {
          return "collection";
        }

        if (obj.callee) {
          return "arguments";
        }
      }

      var type = typeof obj;

      if (type == "number" && !isFinite(obj)) {
        return "NaN";
      }

      return type;
    }
  }
});
