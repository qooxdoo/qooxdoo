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

   * Prototype JS
     http://www.prototypejs.org/
     Version 1.5

     Copyright:
       (c) 2006-2007, Prototype Core Team

     License:
       MIT: http://www.opensource.org/licenses/mit-license.php

     Authors:
       * Prototype Core Team

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
qx.Class.define("qx.bom.element.Attribute",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {

    /** Internal map of attribute convertions */
    __hints :
    {
      // Name translation table (camelcase is important for some attributes)
      names :
      {
        "class"     : "className",
        "for"       : "htmlFor",
        html        : "innerHTML",
        text        : qx.core.Variant.isSet("qx.client", "mshtml") ? "innerText" : "textContent",
        colspan     : "colSpan",
        rowspan     : "rowSpan",
        valign      : "vAlign",
        datetime    : "dateTime",
        accesskey   : "accessKey",
        tabindex    : "tabIndex",
        enctype     : "encType",
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
        readonly : 1,
        multiple : 1,
        selected : 1,
        noresize : 1,
        defer    : 1
      },

      // Interpreted as property (element.property)
      property :
      {
        disabled    : 1,
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
        scrollLeft  : 1,
        scrollTop   : 1
      },

      // Interpreted as property and attribute
      // sometimes needed when locally non-allowed attributes are used
      // e.g. tabIndex on all elements which are no input fields in Safari 3 and Opera
      dual :
      {
        tabIndex : 1
      },

      // Use getAttribute(name, 2) for these to query for the real value, not
      // the interpreted one.
      original :
      {
        href : 1,
        src  : 1,
        type : 1
      },

      // Block these properties when trying to apply new value to them
      readonly :
      {
        offsetWidth  : 1,
        offsetHeight : 1,
        scrollWidth  : 1,
        scrollHeight : 1,
        clientWidth  : 1,
        clientHeight : 1
      }
    },


    /**
     * Compiles an incoming attribute map to a string which
     * could be used when building HTML blocks using innerHTML.
     *
     * This method silently ignores runtime attributes like
     * <code>html</code> or <code>text</code>.
     *
     * @type static
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
     * @type static
     * @param element {Element} The DOM element to query
     * @param name {String} Name of the attribute
     * @return {var} New value of the attribute
     * @signature function(element, name)
     */
    get : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(element, name)
      {
        var hints = this.__hints;
        var value;

        // normalize name
        name = hints.names[name] || name;

        // respect properties
        if (hints.property[name]) {
          value = element[name];
        }

        // respect original values
        // http://msdn2.microsoft.com/en-us/library/ms536429.aspx
        else if (hints.original[name]) {
          value = element.getAttribute(name, 2);
        }

        else {
          value = element.getAttribute(name);
        }

        if (hints.bools[name]) {
          return !!value;
        }

        return value;
      },

      // currently supported by gecko, opera and webkit
      "default" : function(element, name)
      {
        var hints = this.__hints;
        var value;

        // normalize name
        name = hints.names[name] || name;

        // Respect dual property/attributes
        // where sometimes the value is stored under
        // as an attribute and sometimes as a property
        // This is the case for example tabIndex in Opera,
        // Safari and Gecko
        if (hints.dual[name]) {
          value = element.getAttribute(name) || element[name];
        }

        // respect properties
        else if (hints.property[name]) {
          value = element[name];
        }

        else {
          value = element.getAttribute(name);
        }

        if (hints.bools[name]) {
          return !!value;
        }

        return value;
      }
    }),


    /**
     * Sets an HTML attribute on the given DOM element
     *
     * @type static
     * @param element {Element} The DOM element to modify
     * @param name {String} Name of the attribute
     * @param value {var} New value of the attribute
     * @return {void}
     */
    set : function(element, name, value)
    {
      var hints = this.__hints;

      // block read only ones
      if (hints.readonly[name]) {
        throw new Error("Attribute " + name + " is read only!");
      }

      // normalize name
      name = hints.names[name] || name;

      // respect booleans
      if (hints.bools[name]) {
        value = !!value;
      }

      // apply attribute
      if (hints.property[name]) {
        element[name] = value;
      } else if (value === true) {
        element.setAttribute(name, name);
      } else if (value === false || value === null) {
        element.removeAttribute(name);
      } else {
        element.setAttribute(name, value);
      }
    },


    /**
     * Resets an HTML attribute on the given DOM element
     *
     * @type static
     * @param element {Element} The DOM element to modify
     * @param name {String} Name of the attribute
     * @return {void}
     */
    reset : function(element, name) {
      this.set(element, name, null);
    }
  }
});
