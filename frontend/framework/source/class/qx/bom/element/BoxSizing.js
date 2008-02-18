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

************************************************************************ */


/**
 * Contains methods to control and query the element's box-sizing property.
 *
 * Supported values:
 *
 * * "content-box" = W3C model (dimensions are content specific)
 * * "border-box" = Microsoft model (dimensions are box specific incl. border and padding)
 */
qx.Class.define("qx.bom.element.BoxSizing",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /** Internal helper structure to return the valid box-sizing style property names */
    __styleProperties : qx.core.Variant.select("qx.client",
    {
      "mshtml" : null,
      "webkit" : ["boxSizing", "KhtmlBoxSizing", "WebkitBoxSizing"],
      "gecko" : ["MozBoxSizing", "boxSizing"],
      "opera" : ["boxSizing"]
    }),


    /** Internal helper structure to return the valid box-sizing CSS property names */
    __cssProperties : qx.core.Variant.select("qx.client",
    {
      "mshtml" : null,
      "webkit" : ["box-sizing", "-khtml-box-sizing", "-webkit-box-sizing"],
      "gecko" : ["-moz-box-sizing", "box-sizing"],
      "opera" : ["box-sizing"]
    }),


    /** Internal data structure for __usesNativeBorderBox() */
    __nativeBorderBox :
    {
      tags :
      {
        button : true,
        select : true
      },

      types :
      {
        search : true,
        button : true,
        submit : true,
        reset : true,
        checkbox : true,
        radio : true
      }
    },


    /**
     * Whether the given elements defaults to the "border-box" Microsoft model in all cases.
     *
     * @param element {Element} DOM element to query
     * @return {Boolean} true when the element uses "border-box" independently from the doctype
     */
    __usesNativeBorderBox : function(element)
    {
      var map = this.__nativeBorderBox;
      return map.tags[element.tagName.toLowerCase()] || map.types[element.type];
    },


    /**
     * Compiles the given cursor into a CSS compatible string.
     *
     * @type static
     * @param value {String} Valid CSS box-sizing value
     * @return {String} CSS string
     */
    compile : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(element, mode) {
        throw new Error("This client do not support the dynamic modification of the box-sizing property.");
      },

      "default" : function(value)
      {
        var props = this.__cssProperties;
        var value = "";

        if (props)
        {
          for (var i=0, l=props.length; i<l; i++) {
            value += props[i] + ":" + value + ";";
          }
        }

        return value;
      }
    }),


    /**
     * Returns the computed cursor style for the given element.
     *
     * @type static
     * @param element {Element} The element to query
     * @param mode {Number} Choose one of the modes {@link qx.bom.element.Style#COMPUTED_MODE},
     *   {@link qx.bom.element.Style#CASCADED_MODE}, {@link qx.bom.element.Style#LOCAL_MODE}.
     *   The computed mode is the default one.
     * @return {String} Computed cursor value of the given element.
     */
    get : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(element, mode)
      {
        if (qx.bom.Document.isStandardMode(qx.dom.Node.getDocument(element)))
        {
          if (!this.__usesNativeBorderBox(element)) {
            return "content-box";
          }
        }

        return "border-box";
      },

      "default" : function(element, mode)
      {
        var props = this.__styleProperties;
        if (props)
        {
          for (var i=0, l=props.length; i<l; i++)
          {
            value = qx.bom.element.Style.get(element, props[i], mode, false);
            if (value != null && value !== "") {
              return value;
            }
          }
        }
      }
    }),


    /**
     * Applies a new cursor style to the given element
     *
     * @type static
     * @param element {Element} The element to modify
     * @param value {String} New cursor value to set
     * @return {void}
     */
    set : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(element, value) {
        throw new Error("This client do not support the dynamic modification of the box-sizing property.");
      },

      "default" : function(element, value)
      {
        var props = this.__styleProperties;
        if (props)
        {
          for (var i=0, l=props.length; i<l; i++) {
            element.style[props[i]] = value;
          }
        }
      }
    }),


    /**
     * Removes the local cursor style applied to the element
     *
     * @type static
     * @param element {Element} The element to modify
     * @return {void}
     */
    reset : function(element) {
      this.set(element, "");
    }
  }
});
