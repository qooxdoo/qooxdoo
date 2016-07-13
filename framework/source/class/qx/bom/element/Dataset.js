/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
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
qx.Bootstrap.define("qx.bom.element.Dataset",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {

    /**
     * Sets a data attribute on the given DOM element.
     *
     * @param element {Element} The DOM element to modify
     * @param name {String} Name of the attribute [CamelCase variant]
     * @param value {var} New value of the attribute
     */
    set : function(element, name, value) {
      if (element.dataset) {
        name = qx.lang.String.camelCase(name);
        if ((value === null) || (value == undefined)) {
           delete element.dataset[name];
        } else {
          element.dataset[name] = value;
        }
      } else {
        if ((value === null) || (value == undefined)) {
          qx.bom.element.Attribute.reset(element, "data-" + qx.lang.String.hyphenate(name));
        } else {
          qx.bom.element.Attribute.set(element, "data-" + qx.lang.String.hyphenate(name), value);
        }
      }
    },


    /**
     * Returns the value of the given HTML "data-*" attribute
     *
     * @param element {Element} The DOM element to query
     * @param name {String} Name of the attribute [CamelCase variant]
     * @return {var} The value of the attribute
     *
     */
    get : function(element, name) {
      if (element.dataset) {
        name = qx.lang.String.camelCase(name);
        return (!element.dataset[name] ? undefined : element.dataset[name]);
      } else {
        var attrName = "data-" + qx.lang.String.hyphenate(name);
        return element.hasAttribute(attrName) ?
          qx.bom.element.Attribute.get(element, attrName) : undefined;
      }
    },


    /**
     * Returns a map containing all the HTML "data-*" attributes of the specified element
     *
     * @param element {Element} The DOM element to query
     * @return {Map} The map containing all the "data-*" attributes
     */
    getAll : function(element) {
      if (element.dataset) {
        return element.dataset;
      } else {
        var res = {}, attr = element.attributes;
        for (var i=0; i < attr.length; i++) {
          if (attr[i].name.match(RegExp("^data-(.*)"))) {
            var key = RegExp.$1;
            res[qx.lang.String.camelCase(key)] = element.getAttribute(attr[i].name);
          }
        }
        return res;
      }
    },


    /**
    * Checks if any element in the collection has a "data-*" attribute
    * @param element {Element} The DOM Element to check the presence of data-* attributes on.
    * @return {Boolean} True if any element in the collection has a "data-*" attribute
    */
    hasData : function(element)
    {
      return Object.keys(qxWeb(element).getAllData()).length > 0;
    },


    /**
     * Remove an HTML "data-*" attribute from the given DOM element
     *
     * @param element {Element} The DOM element to modify
     * @param name {String} Name of the attribute
     */
    remove : function(element, name) {
      this.set(element, name, undefined);
    }
  }
});
