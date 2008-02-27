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

************************************************************************ */

/* ************************************************************************

#require(qx.event.handler.Input)

************************************************************************ */

/**
 * Cross browser abstractions to work with input elements.
 */
qx.Class.define("qx.bom.Input",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /** {Map} Internal data structures with all supported input types */
    __types :
    {
      text : 1,
      textarea : 1,
      select : 1,
      checkbox : 1,
      radio : 1,
      password : 1,
      hidden : 1,
      submit : 1,
      image : 1,
      file : 1,
      search : 1,
      reset : 1
    },


    /**
     * Creates an DOM input/textarea/select element.
     *
     * Attributes may be given directly with this call. This is critical
     * for some attributes e.g. name, type, ... in many clients.
     *
     * Note: <code>select</code> and <code>textarea</code> elements are created
     * using the identically named <code>type</code>.
     *
     * @type static
     * @param type {String} Any valid type for HTML, <code>select</code>
     *   and <code>textarea</code>
     * @param attributes {Map} Map of attributes to apply
     * @param win {Window} Window to create the element for
     * @return {Element} The created iframe node
     */
    create : function(type, attributes, win)
    {
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (!this.__types[type]) {
          throw new Error("Unsupported input type: " + type);
        }
      }

      // Work on a copy to not modify given attributes map
      var attributes = attributes ? qx.lang.Object.copy(attributes) : {};

      var elem;
      var tag;

      if (type === "textarea" || type === "select")
      {
        tag = type;
      }
      else
      {
        tag = "input";
        attributes.type = type;
      }

      return qx.bom.Element.create(tag, attributes, win);
    },


    /**
     * Sets the value of the given element.
     *
     * @type static
     * @signature function(element, value)
     * @param element {Element} DOM element to modify
     * @param value {var} the new value
     */
    setValue : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(element, value)
      {
        element.__inValueSet = true;
        element.value = value;
        delete element.__inValueSet;
      },

      "default" : function(element, value) {
        element.value = value;
      }
    }),


    /**
     * Sets the text wrap behaviour of a text area element.
     * This property uses the style property "wrap" (IE) respectively "whiteSpace"
     *
     * @signature function(element, wrap)
     * @param element {Element} DOM element to modify
     * @param wrap {Boolean} Whether to turn text wrap on or off.
     */
    setTextAreaWrap : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(element, wrap) {
        element.wrap = wrap ? "soft" : "off";
      },

      "gecko" : function(element, wrap)
      {
        var wrapValue  = wrap ? "soft" : "off";
        var styleValue = wrap ? ""     : "auto";

        element.setAttribute('wrap', wrapValue);
        element.style.overflow = styleValue;
      },

      "default" : function(element, wrap) {
        element.style.whiteSpace = wrap ? "normal" : "nowrap";
      }
    })
  }
});
