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

   * Base2
     http://code.google.com/p/base2/
     Version 0.9

     Copyright:
       (c) 2006-2007, Dean Edwards

     License:
       MIT: http://www.opensource.org/licenses/mit-license.php

     Authors:
       * Dean Edwards

************************************************************************ */


/**
 * CSS class name support for HTML elements. Supports multiple class names
 * for each element. Can query and apply class names to HTML elements.
 */
qx.Class.define("qx.bom.element.Class",
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
     * @param element {Element} The element to modify
     * @param name {String} The class name to add
     * @return {String} The added classname (if so)
     */
    add : function(element, name)
    {
      if (!this.has(element, name)) {
        element.className += (element.className ? " " : "") + name;
      }

      return name;
    },


    /**
     * Gets the classname of the given element
     *
     * @param element {Element} The element to query
     * @return {String} The retrieved classname
     */
    get : function(element)
    {
      return element.className;
    },


    /**
     * Whether the given element has the given className.
     *
     * @param element {Element} The DOM element to check
     * @param name {String} The class name to check for
     * @return {Boolean} true when the element has the given classname
     */
    has : function(element, name)
    {
      var regexp = new RegExp("(^|\\s)" + name + "(\\s|$)");
      return regexp.test(element.className);
    },


    /**
     * Removes a className from the given element
     *
     * @param element {Element} The DOM element to modify
     * @param name {String} The class name to remove
     * @return {String} The removed class name
     */
    remove : function(element, name)
    {
      var regexp = new RegExp("(^|\\s)" + name + "(\\s|$)");
      element.className = element.className.replace(regexp, "$2");

      return name;
    },


    /**
     * Replaces the first given class name with the second one
     *
     * @param element {Element} The DOM element to modify
     * @param oldName {String} The class name to remove
     * @param newName {String} The class name to add
     * @return {String} The added class name
     */
    replace : function(element, oldName, newName)
    {
      this.remove(element, oldName);
      return this.add(element, newName);
    },


    /**
     * Toggles a className of the given element
     *
     * @param element {Element} The DOM element to modify
     * @param name {String} The class name to toggle
     * @return {String} The class name
     */
    toggle : function(element, name)
    {
      this.has(element, name) ? this.remove(element, name) : this.add(element, name);
      return name;
    }
  }
});
