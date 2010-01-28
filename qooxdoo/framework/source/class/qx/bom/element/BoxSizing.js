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
    /** {Map} Internal helper structure to return the valid box-sizing style property names */
    __styleProperties : qx.core.Variant.select("qx.client",
    {
      "mshtml" : null,
      "webkit" : ["boxSizing", "KhtmlBoxSizing", "WebkitBoxSizing"],
      "gecko" : ["MozBoxSizing"],
      "opera" : ["boxSizing"]
    }),


    /** {Map} Internal helper structure to return the valid box-sizing CSS property names */
    __cssProperties : qx.core.Variant.select("qx.client",
    {
      "mshtml" : null,
      "webkit" : ["box-sizing", "-khtml-box-sizing", "-webkit-box-sizing"],
      "gecko" : ["-moz-box-sizing"],
      "opera" : ["box-sizing"]
    }),


    /** {Map} Internal data structure for __usesNativeBorderBox() */
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
     * Compiles the given box sizing into a CSS compatible string.
     *
     * @signature function(value)
     * @param value {String} Valid CSS box-sizing value
     * @return {String} CSS string
     */
    compile : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(value)
      {
        if (qx.core.Variant.isSet("qx.debug", "on"))
        {
          qx.log.Logger.warn(this, "This client do not support the dynamic modification of the box-sizing property.");
          qx.log.Logger.trace();
        }
      },

      "default" : function(value)
      {
        var props = this.__cssProperties;
        var css = "";

        if (props)
        {
          for (var i=0, l=props.length; i<l; i++) {
            css += props[i] + ":" + value + ";";
          }
        }

        return css;
      }
    }),


    /**
     * Returns the box sizing for the given element.
     *
     * @signature function(element)
     * @param element {Element} The element to query
     * @return {String} Box sizing value of the given element.
     */
    get : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(element)
      {
        if (qx.bom.Document.isStandardMode(qx.dom.Node.getDocument(element)))
        {
          if (!this.__usesNativeBorderBox(element)) {
            return "content-box";
          }
        }

        return "border-box";
      },

      "default" : function(element)
      {
        var props = this.__styleProperties;
        var value;

        if (props)
        {
          for (var i=0, l=props.length; i<l; i++)
          {
            value = qx.bom.element.Style.get(element, props[i], null, false);
            if (value != null && value !== "") {
              return value;
            }
          }
        }
        return "";
      }
    }),


    /**
     * Applies a new box sizing to the given element
     *
     * @signature function(element, value)
     * @param element {Element} The element to modify
     * @param value {String} New box sizing value to set
     * @return {void}
     */
    set : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(element, value)
      {
        if (qx.core.Variant.isSet("qx.debug", "on")) {
          qx.log.Logger.warn(this, "This client do not support the dynamic modification of the box-sizing property.");
        }
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
     * Removes the local box sizing applied to the element
     *
     * @param element {Element} The element to modify
     * @return {void}
     */
    reset : function(element) {
      this.set(element, "");
    }
  }
});
