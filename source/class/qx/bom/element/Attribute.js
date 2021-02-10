/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Alexander Steitz (aback)

   ======================================================================

   This class contains code based on the following work:

   * Prototype JS
     http://www.prototypejs.org/
     Version 1.5

     Copyright:
       (c) 2006-2007, Prototype Core Team

     License:
       MIT: http://www.opensource.org/licenses/mit-license.php

     Authors:
       * Prototype Core Team

   ----------------------------------------------------------------------

     Copyright (c) 2005-2008 Sam Stephenson

     Permission is hereby granted, free of charge, to any person
     obtaining a copy of this software and associated documentation
     files (the "Software"), to deal in the Software without restriction,
     including without limitation the rights to use, copy, modify, merge,
     publish, distribute, sublicense, and/or sell copies of the Software,
     and to permit persons to whom the Software is furnished to do so,
     subject to the following conditions:

     THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
     EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
     MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
     NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
     HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
     WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
     DEALINGS IN THE SOFTWARE.

************************************************************************ */


/**
 * Attribute/Property handling for DOM HTML elements.
 *
 * Also includes support for HTML properties like <code>checked</code>
 * or <code>value</code>. This feature set is supported cross-browser
 * through one common interface and is independent of the differences between
 * the multiple implementations.
 *
 * Supports applying text and HTML content using the attribute names
 * <code>text</code> and <code>html</code>.
 */
qx.Bootstrap.define("qx.bom.element.Attribute",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {

    /** Internal map of attribute conversions */
    __hints :
    {
      // Name translation table (camelcase is important for some attributes)
      names :
      {
        "class"     : "className",
        "for"       : "htmlFor",
        html        : "innerHTML",
        text        : qx.core.Environment.get("html.element.textcontent") ? "textContent" : "innerText",
        colspan     : "colSpan",
        rowspan     : "rowSpan",
        valign      : "vAlign",
        datetime    : "dateTime",
        accesskey   : "accessKey",
        tabindex    : "tabIndex",
        maxlength   : "maxLength",
        readonly    : "readOnly",
        longdesc    : "longDesc",
        cellpadding : "cellPadding",
        cellspacing : "cellSpacing",
        frameborder : "frameBorder",
        usemap      : "useMap"
      },

      // Attributes which are only applyable on a DOM element (not using compile())
      runtime :
      {
        "html" : 1,
        "text" : 1
      },

      // Attributes which are (forced) boolean
      bools :
      {
        compact  : 1,
        nowrap   : 1,
        ismap    : 1,
        declare  : 1,
        noshade  : 1,
        checked  : 1,
        disabled : 1,
        readOnly : 1,
        multiple : 1,
        selected : 1,
        noresize : 1,
        defer    : 1,
        allowTransparency : 1
      },

      // Interpreted as property (element.property)
      property :
      {
        // Used by qx.html.Element
        $$element       : 1,
        $$elementObject : 1,

        // Used by qx.ui.core.Widget
        $$widget        : 1,
        $$widgetObject  : 1,

        // Native properties
        checked     : 1,
        readOnly    : 1,
        multiple    : 1,
        selected    : 1,
        value       : 1,
        maxLength   : 1,
        className   : 1,
        innerHTML   : 1,
        innerText   : 1,
        textContent : 1,
        htmlFor     : 1,
        tabIndex    : 1
      },

      qxProperties :
      {
        $$widget : 1,
        $$widgetObject : 1,
        $$element : 1,
        $$elementObject : 1
      },

      // Default values when "null" is given to a property
      propertyDefault :
      {
        disabled : false,
        checked : false,
        readOnly : false,
        multiple : false,
        selected : false,
        value : "",
        className : "",
        innerHTML : "",
        innerText : "",
        textContent : "",
        htmlFor : "",
        tabIndex : 0,
        maxLength: qx.core.Environment.select("engine.name", {
          "mshtml" : 2147483647,
          "webkit": 524288,
          "default": -1
        })
      },


      // Properties which can be removed to reset them
      removeableProperties :
      {
        disabled: 1,
        multiple: 1,
        maxLength: 1
      }
    },


    /**
     * Compiles an incoming attribute map to a string which
     * could be used when building HTML blocks using innerHTML.
     *
     * This method silently ignores runtime attributes like
     * <code>html</code> or <code>text</code>.
     *
     * @param map {Map} Map of attributes. The key is the name of the attribute.
     * @return {String} Returns a compiled string ready for usage.
     */
    compile : function(map)
    {
      var html = [];
      var runtime = this.__hints.runtime;

      for (var key in map)
      {
        if (!runtime[key]) {
          html.push(key, "='", map[key], "'");
        }
      }

      return html.join("");
    },


    /**
     * Returns the value of the given HTML attribute
     *
     * @param element {Element} The DOM element to query
     * @param name {String} Name of the attribute
     * @return {var} The value of the attribute
     */
    get : function(element, name)
    {
      var hints = this.__hints;
      var value;

      // normalize name
      name = hints.names[name] || name;

      // respect properties
      if (hints.property[name])
      {
        value = element[name];

        if (typeof hints.propertyDefault[name] !== "undefined" &&
            value == hints.propertyDefault[name])
        {
          // only return null for all non-boolean properties
          if (typeof hints.bools[name] === "undefined") {
            return null;
          } else {
            return value;
          }
        }
      } else { // fallback to attribute
        value = element.getAttribute(name);

        // All modern browsers interpret "" as true but not IE8, which set the property to "" reset
        if (hints.bools[name] && !(qx.core.Environment.get("engine.name") == "mshtml" &&
        parseInt(qx.core.Environment.get("browser.documentmode"), 10) <= 8 )) {
          return qx.Bootstrap.isString(value); // also respect empty strings as true
        }
      }

      if (hints.bools[name]) {
        return !!value;
      }

      return value;
    },


    /**
     * Sets an HTML attribute on the given DOM element
     *
     * @param element {Element} The DOM element to modify
     * @param name {String} Name of the attribute
     * @param value {var} New value of the attribute
     */
    set : function(element, name, value)
    {
      if (typeof value === "undefined") {
        return;
      }

      var hints = this.__hints;

      // normalize name
      name = hints.names[name] || name;

      // respect booleans
      if (hints.bools[name] && !qx.lang.Type.isBoolean(value)) {
        value = qx.lang.Type.isString(value);
      }

      // apply attribute
      // only properties which can be applied by the browser or qxProperties
      // otherwise use the attribute methods
      if (hints.property[name] && (!(element[name] === undefined) || hints.qxProperties[name]))
      {
        // resetting the attribute/property
        if (value == null)
        {
          // for properties which need to be removed for a correct reset
          if (hints.removeableProperties[name])
          {
            element.removeAttribute(name);
            return;
          } else if (typeof hints.propertyDefault[name] !== "undefined") {
            value = hints.propertyDefault[name];
          }
        }

        element[name] = value;
      }
      else
      {
        if ((hints.bools[name] || value === null) &&
          name.indexOf("data-") !== 0)
        {
          if (value === true) {
          element.setAttribute(name, name);
          } else if (value === false || value === null) {
            element.removeAttribute(name);
          }
        }
        else if (value === null) {
          element.removeAttribute(name);
        }
        else {
          element.setAttribute(name, value);
        }
      }
    },


    /**
     * Resets an HTML attribute on the given DOM element
     *
     * @param element {Element} The DOM element to modify
     * @param name {String} Name of the attribute
     */
    reset : function(element, name) {
      if (name.indexOf("data-") === 0) {
        element.removeAttribute(name);
      } else {
        this.set(element, name, null);
      }
    }
  }
});