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

/* ************************************************************************

#module(bom)

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
      // Name translation table
      names :
      {
        "class"   : "className",
        "for"     : "htmlFor",
        html      : "innerHTML",
        text      : qx.core.Variant.isSet("qx.client", "mshtml") ? "innerText" : "textContent",
        colspan   : "colSpan",
        rowspan   : "rowSpan",
        valign    : "vAlign",
        datetime  : "dateTime",
        accesskey : "accessKey",
        tabindex  : "tabIndex",
        enctype   : "encType",
        maxlength : "maxLength",
        readonly  : "readOnly",
        longdesc  : "longDesc"
      },

      // Interpreted as property: element.property
      property :
      {
        disabled    : true,
        checked     : true,
        readOnly    : true,
        multiple    : true,
        selected    : true,
        value       : true,
        maxLength   : true,
        className   : true,
        innerHTML   : true,
        innerText   : true,
        textContent : true,
        htmlFor     : true
      },

      // Interpreted as property and attribute
      // sometimes needed when locally non-allowed attributes are used
      // e.g. tabIndex on all elements which are no input fields in Safari 3 and Opera
      dual :
      {
        tabIndex : true
      },

      // Use getAttribute(name, 2) for these to query for the real value, not
      // the interpreted one.
      mshtmlOriginal :
      {
        href : true,
        src  : true,
        type : true
      },

      // Block these properties when trying to apply new value to them
      readOnly :
      {
        offsetWidth : true,
        offsetHeight : true,
        scrollWidth : true,
        scrollHeight : true,
        clientWidth : true,
        clientHeight : true
      }
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

        // normalize name
        name = hints.names[name] || name;

        // respect properties
        if (hints.property[name]) {
          return element[name];
        }

        // respect original values
        // http://msdn2.microsoft.com/en-us/library/ms536429.aspx
        if (hints.mshtmlOriginal[name]) {
          return element.getAttribute(name, 2);
        }

        return element.getAttribute(name);
      },

      // currently only supported by gecko
      "default" : function(element, name)
      {
        var hints = this.__hints;

        // normalize name
        name = hints.names[name] || name;

        // Respect dual property/attributes
        // where sometimes the value is stored under
        // as an attribute and sometimes as a property
        // This is the case for example tabIndex in Opera,
        // Safari and Gecko
        if (hints.dual[name]) {
          return element.getAttribute(name) || element[name];
        }

        // respect properties
        if (hints.property[name]) {
          return element[name];
        }

        return element.getAttribute(name);
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
      if (hints.readOnly[name]) {
        throw new Error("Attribute " + name + " is read only!");
      }

      // normalize name
      name = hints.names[name] || name;

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
