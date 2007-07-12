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

#module(html2)

************************************************************************ */

/** 
 * Attribute/Property handling for HTML elements. 
 *
 * Also includes support for HTML properties like <code>checked</code> 
 * or <code>value</code>. This feature set is supported cross-browser 
 * through one common interface without knowing the differences between 
 * the multiple implementations.
 * 
 * Supports to apply text and HTML content using the attribute names
 * <code>text</code> and <code>html</code>.
 */
qx.Class.define("qx.html2.element.Attribute",
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

      mshtmlOriginal :
      {
        href : true,
        src  : true,
        type : true
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

      "default" : function(element, name)
      {
        var hints = this.__hints;

        // normalize name
        name = hints.names[name] || name;

        // respect properties
        if (hints.property[name]) {
          return element[name];
        }

        return element.getAttribute(name);
      }
    }),


    /**
     * Sets a HTML attribute on an DOM element
     *
     * Correctly supports HTML "for" attribute
     * Can handle both name variants lowercase & camelcase
     * Supports for "text" property to define innerText/textContent
     * Supports for "html" property to define innerHTML content
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
    }
  }
});
