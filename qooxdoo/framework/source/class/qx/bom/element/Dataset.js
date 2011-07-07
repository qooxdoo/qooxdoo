/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Author:
     * Gabriel Munteanu (gabios)

************************************************************************ */


/**
 * Data-* attribute handling for DOM HTML elements.
 *
 * This feature set is supported cross-browser
 * through one common interface and is independent of the differences between
 * the multiple implementations.
 *
 */
qx.Class.define("qx.bom.element.Dataset",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {

    /**
     * Sets an HTML attribute on the given DOM element
     *
     * @param element {Element} The DOM element to modify
     * @param name {String} Name of the attribute [CamelCase variant]
     * @param value {var} New value of the attribute
     * @return {void}
     *
     */
    set : function(element, name, value)
    {
      if (qx.core.Environment.get("html.dataset"))
      {
        if(value != null) {
          element.dataset[name] = value;
        }
        else {
          delete element.dataset[name];
        }
      }
      else
      {
        qx.bom.element.Attribute.set(element, "data-"+qx.lang.String.hyphenate(name), value);
      }
    },

    /**
     *
     * Returns the value of the given HTML "data-*" attribute
     *
     * @param element {Element} The DOM element to query
     * @param name {String} Name of the attribute [CamelCase variant]
     * @return {var} The value of the attribute
     *
     */
    get : function(element, name)
    {
      if (qx.core.Environment.get("html.dataset"))
      {
        return (name in element.dataset) ? element.dataset[name] : null;
      }
      else
      {
        return qx.bom.element.Attribute.get(element, "data-"+qx.lang.String.hyphenate(name));
      }
    },

    /**
     * Remove an HTML "data-*" attribute from the given DOM element
     *
     * @param element {Element} The DOM element to modify
     * @param name {String} Name of the attribute
     * @return {void}
     *
     */
    remove : function(element, name)
    {
      this.set(element, name, null);
    }
  }
});
