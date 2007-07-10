/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)

************************************************************************ */

/* ************************************************************************

#module(html2)

************************************************************************ */

qx.Class.define("qx.html2.element.Class",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */
  
  statics :
  {
    /**
     * Adds a className to the given element
     * If successfully added the given className will be returned
     *
     * Inspired by Dean Edwards' Base2
     *
     * @type static
     * @param element {Element} The element to modify
     * @param className {String} The new class name
     * @return {String} The added classname (if so)
     */
    add : function(element, className)
    {
      if (!this.has(element, className))
      {
        element.className += (element.className ? " " : "") + className;
        return className;
      }
    },


    /**
     * Whether the given element has the given className.
     *
     * Inspired by Dean Edwards' Base2
     *
     * @type static
     * @param element {Element} The DOM element to check
     * @param className {String} The class name to check for
     * @return {var} TODOC
     */
    has : function(element, className)
    {
      var regexp = new RegExp("(^|\\s)" + className + "(\\s|$)");
      return regexp.test(element.className);
    },


    /**
     * Removes a className from the given element
     *
     * Inspired by Dean Edwards' Base2
     *
     * @type static
     * @param element {Element} The DOM element to modify
     * @param className {String} The class name to remove
     * @return {String} The removed class name
     */
    remove : function(element, className)
    {
      var regexp = new RegExp("(^|\\s)" + className + "(\\s|$)");
      element.className = element.className.replace(regexp, "$2");

      return className;
    }
  }
});
